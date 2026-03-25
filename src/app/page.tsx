import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user's first server
  const { data: member } = await supabase
    .from("members")
    .select("server_id, servers(id, channels(id))")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (member?.server_id) {
    const serverId = member.server_id;
    // Get first text channel
    const { data: channel } = await supabase
      .from("channels")
      .select("id")
      .eq("server_id", serverId)
      .eq("type", "TEXT")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (channel) {
      redirect(`/servers/${serverId}/channels/${channel.id}`);
    }
    redirect(`/servers/${serverId}`);
  }

  // No servers yet — show welcome screen
  redirect("/servers/welcome");
}
