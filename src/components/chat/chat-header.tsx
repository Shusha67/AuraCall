import { Hash, Mic, Users, Video } from "lucide-react";
import { ChannelType } from "@/types";
import { UserAvatar } from "@/components/auth/user-avatar";
import { MobileToggle } from "@/components/mobile-toggle";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  channelType?: ChannelType;
  imageUrl?: string | null;
}

const channelIconMap: Partial<Record<ChannelType, React.ReactNode>> = {
  TEXT: <Hash className="w-5 h-5 text-zinc-500 mr-2" />,
  AUDIO: <Mic className="w-5 h-5 text-zinc-500 mr-2" />,
  VIDEO: <Video className="w-5 h-5 text-zinc-500 mr-2" />,
};

export async function ChatHeader({ serverId, name, type, channelType, imageUrl }: ChatHeaderProps) {
  return (
    <div className="text-md font-semibold px-3 flex items-center h-12 border-b border-zinc-700 shadow-sm">
      <MobileToggle>
        <div className="w-[72px]">
          <NavigationSidebar />
        </div>
        <ServerSidebar serverId={serverId} />
      </MobileToggle>
      {type === "channel" && channelType && channelIconMap[channelType]}
      {type === "conversation" && (
        <UserAvatar src={imageUrl} name={name} className="h-8 w-8 md:h-8 md:w-8 mr-2" />
      )}
      <p className="font-semibold text-md text-zinc-200">{name}</p>
      <div className="ml-auto flex items-center">
        <button className="hover:opacity-75 transition">
          <Users className="h-6 w-6 text-zinc-500" />
        </button>
      </div>
    </div>
  );
}
