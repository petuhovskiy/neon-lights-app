import { GroupBinInfo } from "@/lib/db";
import { TimeChunks } from "@/lib/intervals";

export type Group = {
    pgRow: Record<string, unknown>;
    bins: GroupBinInfo[];
    chunks: TimeChunks;
};

export function QueriesResults({ groups }: { groups: Group[] }) {
    const renders = groups.map((group) => {
        return (
            <GroupView group={group} />
        )
    });

    return (
        <>
            {renders}
        </>
    )
}

export function GroupView({ group }: { group: Group }) {
    let exactFeatures = [];
    for (const [key, value] of Object.entries(group.pgRow)) {
        if (key == 'count') continue;
        // TODO: region_id -> region name
        exactFeatures.push(value);
    }
    const groupName = exactFeatures.join(', ');

    return (
        <div className="border border-gray-300 rounded-lg p-4 relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
            <h2>{groupName}</h2>
            {JSON.stringify(group.pgRow)}
            <Bars rawBins={group.bins} chunks={group.chunks} />
        </div>
    )
}

export function Bars({ rawBins, chunks }: { rawBins: GroupBinInfo[], chunks: TimeChunks }) {
    let binIndex = 0;
    let bins: GroupBinInfo[] = [];
    for (let i = 0, ms = chunks.start.getTime(); i < chunks.numberOfChunks; i++, ms += chunks.intervalMs) {
        if (binIndex < rawBins.length) {
            const bin = rawBins[binIndex];
            if (bin.bin.getTime() < ms) {
                console.log('ASSERT bin.bin.getTime() < ms');
            }
            if (bin.bin.getTime() <= ms) {
                bins.push(bin);
                binIndex++;
                continue;
            }
        }

        bins.push({
            count: 0,
            failed_count: 0,
            success_count: 0,
            bin: new Date(ms),
        });
    }

    const htmlBins = bins.map((bin) => {
        return (
            <a
                data-state="closed"
                className={`flex-1 rounded-sm border border-white transition-all duration-150 px-px hover:scale-110 py-1 ${
                    bin.count == 0 ? "bg-zinc-400/20 hover:bg-zinc-400/50" : "bg-emerald-500"
                } bg-red-500`}
                style={{height: '100%'}}>
            </a>
        )
    });

    return (
        <div className="w-full">
            <div className="flex w-full bg-white h-12 items-end">
                {htmlBins}
            </div>
        </div>
    )
}