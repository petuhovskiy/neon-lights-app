import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';


const client = postgres(process.env.STATS_DB, {
    ssl: true,
});
const db = drizzle(client);


// run select 1
export default async function runSelect1() {
    const res = await db.execute(sql`select * FROM global_rules`);
    return res;
}
