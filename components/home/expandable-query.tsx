"use client";

import { JoinedQuery, Query } from "@/lib/db";
import ms from "ms";
import { useState } from "react";

export function ExpandableQuery({ query }: { query: JoinedQuery }) {
    const [open, setOpen] = useState(false);

    const toggle = () => {
        setOpen((prev) => !prev);
    };

    return (
        <div className="">
            <a onClick={toggle}>
                <h3 className="font-mono text-l tracking-tight">
                    {open ? "▼" : "▶"} [{query.queries.id}] {query.queries.created_at?.toISOString()}
                    {query.queries.is_failed ? " [FAILED]" : ""}
                    {!query.queries.is_finished ? " [NOT FINISHED]" : ""}
                    {" " + query.queries.driver}
                    {" " + query.queries.method}
                </h3>
            </a>
            {open && (
                <QueryDetails query={query} />
            )}
        </div>
    )
}

function mapFunction([key, value]: [key: any, value: any]): string {
    // use ISO format for dates
    if (value instanceof Date) {
        return `${key}: ${value.toISOString()}`;
    }
    if (key == 'duration') {
        return `${key}: ${value as number / 1000000.0 + " ms"}`;
    }
    return `${key}: ${value}`;
};

export function QueryDetails({ query }: { query: JoinedQuery }) {
    const queryFields = Object.entries(query.queries).map(mapFunction).join("\n");
    const projectFields = query.projects
        ? Object.entries(query.projects).map(mapFunction).join("\n")
        : null;

    return (
        <div className="overflow-auto rounded-lg p-4 relative bg-gray-100">
            <pre>query{"\n"}{queryFields}{"\n\n"}project{"\n"}{projectFields}</pre>
        </div>
    )
}
