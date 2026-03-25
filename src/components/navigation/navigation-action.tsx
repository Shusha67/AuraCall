"use client";

import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function NavigationAction() {
  const { onOpen } = useModal();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onOpen("createServer")}
            className="group flex items-center"
          >
            <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-zinc-800 group-hover:bg-indigo-500">
              <Plus className="group-hover:text-white transition text-indigo-400" size={25} />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Add a server</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
