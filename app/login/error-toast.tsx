"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Toast from '@/components/shared/toast/toast';

export default function ErrorToast() {
    const searchParams = useSearchParams();

    function isAuthError() {
        return searchParams.get('error') === 'wrongtoken';
    }

    return (
        <Toast
                title="Auth Error"
                fire={isAuthError()}
        >
            Provided token is invalid. Please try again.
        </Toast>
    )
}
