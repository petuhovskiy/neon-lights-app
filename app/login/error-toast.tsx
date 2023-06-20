"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Toast from '@/components/shared/toast/toast';

export default function ErrorToast() {
    const searchParams = useSearchParams();

    function isAuthError() {
        console.log(searchParams);
        return new URLSearchParams(searchParams).get('error') === 'wrongtoken';
    }

    return (
        <Toast
                children={"Provided token is invalid. Please try again."}
                title="Auth Error"
                fire={isAuthError()}
            />
    )
}
