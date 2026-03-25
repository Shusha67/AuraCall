import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface ServerPageProps {
  params: { serverId: string };
}

export default async function ServerPage({ params }: ServerPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // Redirect to first text channel
  const { data: channel } = await supabase
    .from("channels")
    .select("id")
    .eq("server_id", params.serverId)
    .eq("type", "TEXT")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (channel) {
    redirect(`/servers/${params.serverId}/channels/${channel.id}`);
  }

  return null;
}
