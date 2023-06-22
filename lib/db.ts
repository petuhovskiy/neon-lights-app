import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { TimeChunks } from './intervals';
import { Group } from '@/components/home/queries-results';


const client = postgres(process.env.STATS_DB || '', {
    ssl: true,
});
const db = drizzle(client, {
    logger: true,
});

// run select 1
export async function runSelect1() {
    const res = await db.execute(sql`select * FROM global_rules`);
    return res;
}

export async function fetchQueriesGroups(filters: string, groupBy: string, fromTs: string, toTs: string) {
    // SELECT region_id, count(*) FROM queries WHERE created_at > '2023-06-21' GROUP BY region_id;
    const res = await db.execute(sql.raw(`SELECT ${groupBy}, count(*) FROM queries WHERE (${filters}) AND created_at >= '${fromTs}' AND created_at < '${toTs}' GROUP BY ${groupBy} ORDER BY ${groupBy}`));
    console.log(res);
    return res;
}

export type TimeRange = {
    from: Date,
    to: Date,
};

export async function timestampsFromStrings(fromStr: string, toStr: string) {
    const res = await db.execute(sql.raw(`SELECT '${fromStr}'::timestamp AS from, '${toStr}'::timestamp AS to`));
    console.log(res);
    return {
        from: res[0]['from'],
        to: res[0]['to'],
    } as TimeRange;
}

export type GroupBinInfo = {
    count: number,
    failed_count: number,
    success_count: number,
    bin: Date,
}

export async function fetchGroupInfo(filters: string, fromTs: string, toTs: string, chunks: TimeChunks, row: Record<string, unknown>) {
    let groupFilters = '';
    for (const [key, value] of Object.entries(row)) {
        if (key == 'count') continue;
        groupFilters += ` AND ${key} = '${value}'`;
    }

    let dateBin = `date_bin('${chunks.intervalMs} ms', created_at, '${chunks.start.toISOString()}')`;

    const failedCount = `count(*) FILTER (WHERE is_failed = 't')`;
    const successCount = `count(*) FILTER (WHERE is_failed = 'f')`;

    // SELECT count(*), date_bin('1000 ms', created_at, '2023-06-21') AS bin FROM queries WHERE created_at > '2023-06-21' AND created_at < '2023-06-22'` GROUP BY bin
    const res = await db.execute<GroupBinInfo>(sql.raw(`SELECT count(*) AS count, ${failedCount} AS failed_count, ${successCount} AS success_count, ${dateBin} AS bin FROM queries WHERE (${filters}) AND created_at >= '${fromTs}' AND created_at < '${toTs}' ${groupFilters} GROUP BY bin ORDER BY bin`));
    console.log(res);
    return {
        pgRow: row,
        bins: res,
        chunks,
    } as Group;
}
