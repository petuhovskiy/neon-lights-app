import { TimeRange } from "./db";

export type TimeChunks = {
    start: Date,
    numberOfChunks: number,
    intervalMs: number,
}

export function splitRangeIntoChunks(range: TimeRange) {
    const target = 125;
    const rangesMs = [1, 50, 1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000];

    for (let i = 0; i < rangesMs.length; i++) {
        const intervalMs = rangesMs[i];
        const chunks = Math.ceil((range.to.getTime() - range.from.getTime()) / intervalMs);
        if (chunks < target || i+1 === rangesMs.length) {
            let startMs = range.from.getTime() - (range.from.getTime() % intervalMs);
            let startDate = new Date(startMs);
            return {
                start: startDate,
                numberOfChunks: Math.ceil((range.to.getTime() - startDate.getTime()) / intervalMs),
                intervalMs,
            } as TimeChunks;
        }
    }
    throw new Error("unreachable");
}
