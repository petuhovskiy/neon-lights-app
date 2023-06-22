import { Group } from "@/components/home/queries-results";
import { GroupBinInfo } from "./db";
import formatMillis from "ms";

export function uniqueBinId(group: Group, bin: GroupBinInfo) {
    return group.row.uniqueId + '#' + bin.bin.toISOString();
}

export function getBinInterval(group: Group, bin: GroupBinInfo) {
    const startTs = bin.bin.toISOString().replace('.000Z', '').replace('T', ' ');
    const duration = formatMillis(group.chunks.intervalMs);
    return {
        startTs,
        duration,
    };
}
