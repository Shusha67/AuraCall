"use client";

import { Channel, ChannelType, MemberRole, Server } from "@/types";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { Plus, Settings } from "lucide-react";

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
  server?: Server;
}

export function ServerSection({
  label,
  role,
  sectionType,
  channelType,
  server,
}: ServerSectionProps) {
  const { onOpen } = useModal();

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-zinc-500">{label}</p>
      {role !== "GUEST" && sectionType === "channels" && (
        <button
          onClick={() => onOpen("createChannel", { channelType })}
          className="text-zinc-500 hover:text-zinc-300 transition"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
      {role === "ADMIN" && sectionType === "members" && (
        <button
          onClick={() => onOpen("members", { server })}
          className="text-zinc-500 hover:text-zinc-300 transition"
        >
          <Settings className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
