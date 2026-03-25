import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ServerHeader } from "@/components/server/server-header";
import { ServerSection } from "@/components/server/server-section";
import { ServerChannel } from "@/components/server/server-channel";
import { ServerMember } from "@/components/server/server-member";
import { Channel, Member, MemberRole, Profile, ServerWithMembersWithProfiles } from "@/types";

interface ServerSidebarProps {
  serverId: string;
}

const channelIconMap = {
  TEXT: Hash,
  AUDIO: Mic,
  VIDEO: Video,
};

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

export async function ServerSidebar({ serverId }: ServerSidebarProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: server } = await supabase
    .from("servers")
    .select(`
      *,
      channels(*),
      members(*, profile:profiles(*))
    `)
    .eq("id", serverId)
    .single();

  if (!server) redirect("/");

  const textChannels = (server.channels as Channel[]).filter((c) => c.type === "TEXT");
  const audioChannels = (server.channels as Channel[]).filter((c) => c.type === "AUDIO");
  const videoChannels = (server.channels as Channel[]).filter((c) => c.type === "VIDEO");

  const members = (server.members as (Member & { profile: Profile })[]).filter(
    (m) => m.profile_id !== user.id
  );

  const currentMember = (server.members as Member[]).find(
    (m) => m.profile_id === user.id
  );

  const role = currentMember?.role as MemberRole;

  return (
    <div className="flex flex-col h-full text-primary w-full bg-zinc-900 shadow-md">
      <ServerHeader server={server as unknown as ServerWithMembersWithProfiles} role={role} />

      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          {/* Text Channels */}
          {textChannels.length > 0 && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType="TEXT"
                role={role}
                label="Text Channels"
              />
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server as any}
                  role={role}
                />
              ))}
            </div>
          )}

          {/* Voice Channels */}
          {audioChannels.length > 0 && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType="AUDIO"
                role={role}
                label="Voice Channels"
              />
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server as any}
                  role={role}
                />
              ))}
            </div>
          )}

          {/* Video Channels */}
          {videoChannels.length > 0 && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType="VIDEO"
                role={role}
                label="Video Channels"
              />
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server as any}
                  role={role}
                />
              ))}
            </div>
          )}

          {/* Members */}
          {members.length > 0 && (
            <div className="mb-2">
              <Separator className="bg-zinc-800 rounded-md my-2" />
              <ServerSection
                sectionType="members"
                role={role}
                label={`Members — ${members.length}`}
                server={server as any}
              />
              {members.map((member) => (
                <ServerMember key={member.id} member={member} server={server as any} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
