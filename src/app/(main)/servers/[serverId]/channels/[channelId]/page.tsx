import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { Member, Profile } from "@/types";

interface ChannelPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", params.channelId)
    .single();

  if (!channel) redirect("/");

  const { data: member } = await supabase
    .from("members")
    .select("*, profile:profiles(*)")
    .eq("server_id", params.serverId)
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/");

  const memberWithProfile = member as Member & { profile: Profile };

  return (
    <div className="bg-zinc-950 flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.server_id}
        type="channel"
        channelType={channel.type}
      />

      {channel.type === "TEXT" && (
        <>
          <ChatMessages
            member={memberWithProfile}
            name={channel.name}
            channelId={channel.id}
            apiUrl="/api/messages"
            socketUrl="/api/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: params.serverId,
            }}
            paramKey="channelId"
            paramValue={channel.id}
            type="channel"
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/messages"
            query={{
              channelId: channel.id,
              serverId: params.serverId,
            }}
          />
        </>
      )}

      {(channel.type === "AUDIO" || channel.type === "VIDEO") && (
        <MediaRoom
          chatId={channel.id}
          video={channel.type === "VIDEO"}
          audio={true}
          username={memberWithProfile.profile.name}
        />
      )}
    </div>
  );
}
