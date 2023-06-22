import { drizzle } from 'drizzle-orm/postgres-js';
import { InferModel, gte, sql, and, lt, desc, eq } from 'drizzle-orm';
import postgres from 'postgres';
import { TimeChunks } from './intervals';
import { Group } from '@/components/home/queries-results';
import { bigint, boolean, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';


const client = postgres(process.env.STATS_DB || '', {
    ssl: true,
});
const db = drizzle(client, {
    logger: true,
});

// run select 1
export async function runSelect1() {
    const res = await db.execute(sql`SHOW TIMEZONE`);
    return res;
}

export type QGroup = {
    count: number,
    row: Record<string, string>,
    uniqueId: string,
}

export async function fetchQueriesGroups(filters: string, groupBy: string, fromTs: string, toTs: string) {
    // SELECT region_id, count(*) FROM queries WHERE created_at > '2023-06-21' GROUP BY region_id;
    const res = await db.execute(sql.raw(`SELECT ${groupBy}, count(*) FROM queries WHERE (${filters}) AND created_at >= '${fromTs}' AND created_at < '${toTs}' GROUP BY ${groupBy} ORDER BY ${groupBy}`));
    
    const groups: QGroup[] = [];
    for (const row of res) {
        const newRow = {} as Record<string, string>;
        let count = 0;
        for (const [key, value] of Object.entries(row)) {
            if (key == 'count') {
                count = value as number;
                continue;
            }
            newRow[key] = value as string;
        }
        groups.push({
            count,
            row: newRow,
            uniqueId: JSON.stringify(newRow),
        });
    }

    return groups;
}

export type TimeRange = {
    from: Date,
    to: Date,
};

export async function timestampsFromStrings(fromStr: string, toStr: string) {
    const res = await db.execute(sql.raw(`SELECT '${fromStr}'::timestamptz AS from, '${toStr}'::timestamptz AS to`));
    // console.log(res);
    return {
        from: res[0]['from'],
        to: res[0]['to'],
    } as TimeRange;
}

export type GroupBinInfo = {
    count: number,
    failed_count: number,
    success_count: number,
    avg_duration_ns: number | undefined,
    bin: Date,
}

export async function fetchGroupInfo(filters: string, fromTs: string, toTs: string, chunks: TimeChunks, group: QGroup) {
    let groupFilters = '';
    for (const [key, value] of Object.entries(group.row)) {
        groupFilters += ` AND ${key} = '${value}'`;
    }

    let dateBin = `date_bin('${chunks.intervalMs} ms', created_at, '${chunks.start.toISOString()}')`;

    const failedCount = `count(*) FILTER (WHERE is_failed = 't')`;
    const successCount = `count(*) FILTER (WHERE is_failed = 'f')`;

    // SELECT count(*), date_bin('1000 ms', created_at, '2023-06-21') AS bin FROM queries WHERE created_at > '2023-06-21' AND created_at < '2023-06-22'` GROUP BY bin
    const res = await db.execute<GroupBinInfo>(sql.raw(`SELECT count(*) AS count, ${failedCount} AS failed_count, ${successCount} AS success_count, ${dateBin} AS bin, AVG(duration) AS avg_duration_ns FROM queries WHERE (${filters}) AND created_at >= '${fromTs}' AND created_at < '${toTs}' ${groupFilters} GROUP BY bin ORDER BY bin`));
    
    // TODO: fix this with proper NULL
    for (const row of res) {
        if (Number(row.avg_duration_ns) <= 0.0) {
            row.avg_duration_ns = undefined;
        }
    }
   
    // console.log(res);
    return {
        row: group,
        bins: res,
        chunks,
    } as Group;
}

export async function fetchRegionsMap() {
    const res = await db.execute<Record<string, string>>(sql.raw(`SELECT id, database_region FROM regions`));
    let map: Record<string, string> = {};
    for (const row of res) {
        map[row['id']] = row['database_region'];
    }
    // console.log(map);
    return map;
}

/*
external_monitoring=> \d queries
                                       Table "public.queries"
   Column    |           Type           | Collation | Nullable |               Default
-------------+--------------------------+-----------+----------+-------------------------------------
 id          | bigint                   |           | not null | nextval('queries_id_seq'::regclass)
 created_at  | timestamp with time zone |           |          |
 updated_at  | timestamp with time zone |           |          |
 project_id  | bigint                   |           |          |
 region_id   | bigint                   |           |          |
 exitnode    | text                     |           |          |
 kind        | text                     |           |          |
 addr        | text                     |           |          |
 driver      | text                     |           |          |
 method      | text                     |           |          |
 request     | text                     |           |          |
 is_finished | boolean                  |           |          |
 response    | text                     |           |          |
 error       | text                     |           |          |
 started_at  | timestamp with time zone |           |          |
 finished_at | timestamp with time zone |           |          |
 is_failed   | boolean                  |           |          |
 duration    | bigint                   |           |          |
Indexes:
    "queries_pkey" PRIMARY KEY, btree (id)
*/

export const queries = pgTable('queries', {
    id: serial('id').primaryKey(),
    created_at: timestamp('created_at', { withTimezone: true }),
    updated_at: timestamp('updated_at', { withTimezone: true }),
    project_id: bigint('project_id', { mode: 'number' }),
    region_id: bigint('region_id', { mode: 'number' }),
    exitnode: text('exitnode'),
    kind: text('kind'),
    addr: text('addr'),
    driver: text('driver'),
    method: text('method'),
    request: text('request'),
    is_finished: boolean('is_finished'),
    response: text('response'),
    error: text('error'),
    started_at: timestamp('started_at', { withTimezone: true }),
    finished_at: timestamp('finished_at', { withTimezone: true }),
    is_failed: boolean('is_failed'),
    duration: bigint('duration', { mode: 'number' }),
});

export type Query = InferModel<typeof queries>;

export async function fetchQueries(filters: string, fromStr: string, toStr: string, chunks: TimeChunks, selectedGroup: Group, selectedBinInfo: GroupBinInfo): Promise<Query[]> {
    // TODO: fix filters to match func params
    // TODO: use toStr and fromStr
    const groupFilters = Object.entries(selectedGroup.row.row).map(([key, value]) => sql.raw(`${key} = '${value}'`));

    const binStart = selectedBinInfo.bin;
    const binEnd = new Date(binStart.getTime() + chunks.intervalMs);

    return await db.select().from(queries).where(and(
        gte(queries.created_at, binStart),
        lt(queries.created_at, binEnd),
        sql.raw(filters),
        gte(queries.created_at, sql.raw(`'${fromStr}'::timestamptz`)),
        lt(queries.created_at, sql.raw(`'${toStr}'::timestamptz`)),
        ...groupFilters,
    )).orderBy(desc(queries.created_at));
}
