"use client";

import { useState } from "react";

export function ExpandableCode({ preview, full }: { preview: string, full: string }) {
    const [open, setOpen] = useState(false);

    const toggle = () => {
        setOpen((prev) => !prev);
    };

    return (
        <div className="">
            <a onClick={toggle}>
                <h3 className="font-mono text-l tracking-tight">
                    {open ? "▼" : "▶"} {preview}
                </h3>
            </a>
            {open && (
                <Expanded content={full} />
            )}
        </div>
    )
}

export function Expanded({ content }: { content: string }) {
    return (
        <div className="overflow-auto rounded-lg p-4 relative bg-gray-100">
            <pre>{content}</pre>
        </div>
    )
}
