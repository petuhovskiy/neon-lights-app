"use client";

import { Query } from "@/lib/db";
import ms from "ms";
import { useState } from "react";

export function ExpandableQuery({ query }: { query: Query }) {
    const [open, setOpen] = useState(false);

    const toggle = () => {
        setOpen((prev) => !prev);
    };

    return (
        <div className="">
            <a onClick={toggle}>
                <h3 className="font-mono text-l tracking-tight">
                    {open ? "▼" : "▶"} [{query.id}] {query.created_at?.toISOString()}
                    {query.is_failed ? " [FAILED]" : ""}
                    {!query.is_finished ? " [NOT FINISHED]" : ""}
                    {" " + query.driver}
                    {" " + query.method}
                </h3>
            </a>
            {open && (
                <QueryDetails query={query} />
            )}
        </div>
    )
}

export function QueryDetails({ query }: { query: Query }) {
    const content = Object.entries(query).map(([key, value]) => {
        // use ISO format for dates
        if (value instanceof Date) {
            return `${key}: ${value.toISOString()}`;
        }
        if (key == 'duration') {
            return `${key}: ${value as number / 1000000.0 + " ms"}`;
        }
        return `${key}: ${value}`;
    }).join("\n");

    return (
        <div className="overflow-auto rounded-lg p-4 relative bg-gray-100">
            <pre>{content}</pre>
        </div>
    )
}