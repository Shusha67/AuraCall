"use client";

import { Channel, ChannelType, MemberRole, Server } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap: Record<ChannelType, React.ReactNode> = {
  TEXT: <Hash className="flex-shrink-0 w-5 h-5 text-zinc-500 mr-2" />,
  AUDIO: <Mic className="flex-shrink-0 w-5 h-5 text-zinc-500 mr-2" />,
  VIDEO: <Video className="flex-shrink-0 w-5 h-5 text-zinc-500 mr-2" />,
};

export function ServerChannel({ channel, server, role }: ServerChannelProps) {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const isActive = params?.channelId === channel.id;
  const isGeneral = channel.name === "general";

  const onClick = () => {
    router.push(`/servers/${server.id}/channels/${channel.id}`);
  };

  const onAction = (e: React.MouseEvent, action: "editChannel" | "deleteChannel") => {
    e.stopPropagation();
    onOpen(action, { channel, server });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1",
        isActive && "bg-zinc-700 text-zinc-200"
      )}
    >
      {iconMap[channel.type]}
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-300 transition",
          isActive && "text-zinc-200 group-hover:text-white"
        )}
      >
        {channel.name}
      </p>
      {isGeneral && (
        <Lock className="ml-auto w-4 h-4 text-zinc-500" />
      )}
      {!isGeneral && role !== "GUEST" && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              onClick={(e) => onAction(e, "editChannel")}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              onClick={(e) => onAction(e, "deleteChannel")}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-red-400 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </button>
  );
}
