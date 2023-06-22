"use client";

import { useRouter } from "next/navigation";
import { Search } from "../shared/icons";

export function ZoomInInterval({ tsFrom, tsTo }: { tsFrom: string, tsTo: string }) {
    const router = useRouter();
    
    return (
        <a className="text-black-500 hover:text-gray-500" onClick={() => {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('from', tsFrom);
            searchParams.set('to', tsTo);
            router.push('/?' + searchParams.toString());
        }}>
            <Search className="h-5 w-5 block"/>
        </a>
    )
}
