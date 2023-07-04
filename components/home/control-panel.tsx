"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ControlPanel({ filtersStr, groupByStr, fromStr, toStr, detailsFlag }: { filtersStr: string, groupByStr: string, fromStr: string, toStr: string, detailsFlag: boolean }) {
    const [filters, setFilters] = useState<string>(filtersStr);
    const [groupBy, setGroupBy] = useState<string>(groupByStr);
    const [from, setFrom] = useState<string>(fromStr);
    const [to, setTo] = useState<string>(toStr);
    const [details, setDetails] = useState<boolean>(detailsFlag);

    useEffect(() => {
        setFilters(filtersStr);
        setGroupBy(groupByStr);
        setFrom(fromStr);
        setTo(toStr);
        setDetails(detailsFlag);
    }, [filtersStr, groupByStr, fromStr, toStr, detailsFlag]);

    const router = useRouter();

    return (
        <div className="border border-gray-300 rounded-lg p-4 relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
            <label htmlFor="filters" className="block text-gray-700 font-bold mb-2">
                Filters
            </label>
            <input
                type="text"
                id="filters"
                value={filters}
                onChange={(event) => setFilters(event.target.value)}
                className="w-full px-4 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />

            <div>
                <label htmlFor="groupby" className="block text-gray-700 font-bold mb-2 mt-4">
                    Group By
                </label>
                <input
                    type="text"
                    id="groupby"
                    value={groupBy}
                    onChange={(event) => setGroupBy(event.target.value)}
                    className="w-full px-4 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
            </div>

            <div className="inline-block w-1/2 pr-4">
                <label htmlFor="from" className="block text-gray-700 font-bold mb-2 mt-4">
                    From
                </label>
                <input
                    type="text"
                    id="from"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="w-full px-4 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
            </div>

            <div className="inline-block w-1/2 pr-4">
                <label htmlFor="to" className="block text-gray-700 font-bold mb-2 mt-4">
                    To
                </label>
                <input
                    type="text"
                    id="to"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                    className="w-full px-4 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
            </div>

            {/* Black button */}
            <button
                className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 inline-block"
                onClick={() => {
                    const newURL = `/?filters=${encodeURIComponent(filters)}&groupBy=${encodeURIComponent(groupBy)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&details=${encodeURIComponent(details)}`;
                    router.push(newURL);
                }}
            >
                Fetch
            </button>

            <div className="mt-4 inline-block pt-1 pr-4 float-right">
                <input type="checkbox" id="details" checked={details} onChange={(event) => setDetails(event.target.checked)} className="form-checkbox h-5 w-5 text-black border-gray-300 rounded" />
                <label htmlFor="details" className="ml-2 text-gray-700">Show details</label>
            </div>
        </div>
    )
}
