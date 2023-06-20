"use client";

import { ReactNode } from "react";
import * as Radix from '@radix-ui/react-toast';
import React from "react";
import './styles.css';

export default function Toast({
    children,
    title,
    fire,
  }: {
    children: ReactNode;
    title: string;
    fire: boolean;
  }) {
    const [open, setOpen] = React.useState(fire);
    const timerRef = React.useRef(0);

    React.useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <Radix.Provider swipeDirection="right">
            <Radix.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
                <Radix.Title className="ToastTitle">{title}</Radix.Title>
                <Radix.Description asChild>
                    <p className="ToastDescription">{children}</p>
                </Radix.Description>
            </Radix.Root>
            <Radix.Viewport className="ToastViewport" />
        </Radix.Provider>
    );
}