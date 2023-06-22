"use client";

import { ReactNode, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import useWindowSize from "@/lib/hooks/use-window-size";
import Leaflet from "../shared/leaflet";

export default function BinTooltip({
  children,
  content,
  fullWidth,
}: {
  children: ReactNode;
  content: ReactNode | string;
  fullWidth?: boolean;
}) {
  const [openTooltip, setOpenTooltip] = useState(false);

  return (
    <>
        <TooltipPrimitive.Provider delayDuration={100}>
            <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger className="hidden sm:inline-flex" asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content
                sideOffset={4}
                side="bottom"
                className="z-30 hidden animate-slide-up-fade items-center overflow-hidden rounded-md border border-gray-200 bg-white drop-shadow-lg sm:block"
            >
                <TooltipPrimitive.Arrow className="fill-current text-white" />
                {typeof content === "string" ? (
                <div className="p-5">
                    <span className="block max-w-xs text-center text-sm text-gray-700">
                    {content}
                    </span>
                </div>
                ) : (
                content
                )}
                <TooltipPrimitive.Arrow className="fill-current text-white" />
            </TooltipPrimitive.Content>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    </>
  );
}
