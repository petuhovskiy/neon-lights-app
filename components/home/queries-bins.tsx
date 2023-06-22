"use client";

import { GroupBinInfo } from "@/lib/db";
import { TimeChunks } from "@/lib/intervals";
import BinTooltip from "./bin-tooltip";
import { useRouter } from "next/navigation";
import { Group } from "./queries-results";
import { getBinInterval, uniqueBinId } from "@/lib/bins";

export function Bins({ rawBins, chunks, selectedBin, group }: { rawBins: GroupBinInfo[], chunks: TimeChunks, selectedBin: string, group: Group }) {
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

    const router = useRouter();

    const htmlBins = bins.map((bin) => {
        const { startTs, duration } = getBinInterval(group, bin);

        const data = [
            ['Queries', bin.count],
            ['Success', bin.success_count],
            ['Failed', bin.failed_count],
        ];
        {/* TODO: unfinished, latencies, etc */}

        const content = (
            <div className="px-4 py-5 overflow-hidden bg-white rounded-sm shadow sm:p-6">
                <p className="text-xl font-medium truncate text-zinc-900">{startTs} + {duration}</p>
                <dt className="text-sm font-medium truncate text-zinc-500"></dt>
                <dl className="grid grid-cols-1 gap-2 mt-5 md:grid-cols-3 lg:grid-cols-6 ">
                    {data.map(([key, value]) => (
                        <div className="flex flex-col p-4" key={key}>
                            <p className="leading-7 text-zinc-900" color="text-zinc-500">{key}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-medium md:text-4xl text-zinc-800">{value}</span>
                            </div>
                        </div>
                    ))}
                </dl>
            </div>
        )

        let colorClass;
        if (uniqueBinId(group, bin) == selectedBin) {
            colorClass = 'bg-blue-500';
        } else if (bin.count == 0) {
            colorClass = 'bg-zinc-400/20 hover:bg-zinc-400/50';
        } else {
            colorClass = 'bg-emerald-500';
        }

        return (
            <BinTooltip content={content} key={bin.bin.getTime()+'+'+chunks.intervalMs}>
                <a
                    className={`flex-1 rounded-sm border border-white transition-all duration-150 px-px hover:scale-110 py-1 ${
                        colorClass
                    }`} // bg-red-500
                    style={{height: '100%'}}
                    onClick={() => {
                        const searchParams = new URLSearchParams(window.location.search);
                        searchParams.set('selectedBin', uniqueBinId(group, bin));
                        router.push('/?' + searchParams.toString());
                    }}
                >
                </a>
            </BinTooltip>
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
