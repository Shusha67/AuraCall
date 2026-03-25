"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavigationItemProps {
  id: string;
  imageUrl: string | null;
  name: string;
}

export function NavigationItem({ id, imageUrl, name }: NavigationItemProps) {
  const params = useParams();
  const router = useRouter();

  const isActive = params?.serverId === id;

  const onClick = () => {
    router.push(`/servers/${id}`);
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="group relative flex items-center"
          >
            {/* Active indicator bar */}
            <div
              className={cn(
                "absolute left-0 bg-white rounded-r-full transition-all w-[4px]",
                isActive ? "h-[36px]" : "h-[8px] group-hover:h-[20px]"
              )}
            />
            <div
              className={cn(
                "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                isActive && "bg-zinc-800 rounded-[16px]"
              )}
            >
              {imageUrl ? (
                <Image fill src={imageUrl} alt={name} />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white font-semibold text-lg">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
