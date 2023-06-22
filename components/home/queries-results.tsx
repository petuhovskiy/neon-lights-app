import { GroupBinInfo, QGroup, Query } from "@/lib/db";
import { TimeChunks } from "@/lib/intervals";
import { Bins } from "./queries-bins";
import { nFormatter } from "@/lib/utils";
import { getBinInterval, uniqueBinId } from "@/lib/bins";
import { Search, Twitter } from "../shared/icons";
import { ZoomInInterval } from "./zoom-in-interval";
import { ExpandableQuery } from "./expandable-query";

export type Group = {
    row: QGroup;
    bins: GroupBinInfo[];
    chunks: TimeChunks;
};

export function QueriesResults(
    {
        groups,
        regions,
        selectedBin,
        selectedBinQueries,
        selectedGroup,
    }: {
        groups: Group[],
        regions: Record<string, string>,
        selectedBin: string,
        selectedBinQueries: Query[] | undefined,
        selectedGroup: Group | undefined,
    }) {
    const renders = groups.map((group) => {
        const groupView = (
            <GroupView group={group} regions={regions} selectedBin={selectedBin} key={group.row.uniqueId} />
        );
        if (group == selectedGroup && selectedBinQueries != undefined) {
            return (
                <>
                    {groupView}
                    <SelectedBinView group={group} allQueries={selectedBinQueries} selectedBinStr={selectedBin} />
                </>
            )
        }
        return groupView;
    });

    return (
        <>
            {renders}
        </>
    )
}

export function GroupView({ group, regions, selectedBin }: { group: Group, regions: Record<string, string>, selectedBin: string }) {
    let exactFeatures = [];
    for (const [key, value] of Object.entries(group.row.row)) {
        if (key == 'region_id') {
            exactFeatures.push(`[${value}]` + regions[value as string]);
            continue;
        }
        exactFeatures.push(value);
    }
    const groupName = exactFeatures.join(', ');

    return (
        <div className="border border-gray-300 rounded-lg p-4 relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
            <div className="w-full pb-4">
                <h2 className="inline-block scroll-m-20 text-2xl font-semibold tracking-tight">{groupName}</h2>
                <p className="inline-block float-right text-xl">Total {nFormatter(group.row.count)}</p>
            </div>
            <Bins group={group} rawBins={group.bins} chunks={group.chunks} selectedBin={selectedBin} />
        </div>
    )
}

export function SelectedBinView(
    {
        group,
        allQueries,
        selectedBinStr,
    }: {
        group: Group,
        allQueries: Query[],
        selectedBinStr: string
    }
) {
    const selectedBin = group.bins.find((bin) => {
        return uniqueBinId(group, bin) == selectedBinStr;
    });

    if (selectedBin == undefined) {
        throw new Error("Selected bin not found: " + selectedBinStr);
    }

    const { startTs, duration } = getBinInterval(group, selectedBin);

    const tsFrom = selectedBin.bin;
    const tsTo = new Date(tsFrom.getTime() + group.chunks.intervalMs);

    return (
        <div className="border border-gray-300 rounded-lg p-4 relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
            <div className="w-full pb-4">
                <h2 className="inline-block scroll-m-20 text-xl font-semibold tracking-tight">{startTs} + {duration}</h2>
                <div className="inline-block p-1 m-1 float-left">
                    <ZoomInInterval tsFrom={tsFrom.toISOString()} tsTo={tsTo.toISOString()} />
                </div>
                <p className="inline-block float-right text-l">Total {allQueries.length}</p>
            </div>
            <ul className="overflow-auto">
                {allQueries.map((query) => {
                    return (
                        <li key={query.id}>
                            <ExpandableQuery query={query} />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
