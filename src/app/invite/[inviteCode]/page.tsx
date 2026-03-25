import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";

interface InvitePageProps {
  params: { inviteCode: string };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?next=/invite/${params.inviteCode}`);
  }

  // Look up the server
  const { data: server } = await supabase
    .from("servers")
    .select("id, name")
    .eq("invite_code", params.inviteCode)
    .single();

  if (!server) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <p className="text-zinc-400 text-lg">Invalid invite link.</p>
        </div>
      </div>
    );
  }

  // Already a member?
  const { data: existingMember } = await supabase
    .from("members")
    .select("id")
    .eq("server_id", server.id)
    .eq("profile_id", user.id)
    .single();

  if (existingMember) {
    redirect(`/servers/${server.id}`);
  }

  // Join the server
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/invite/${params.inviteCode}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (res.ok) {
    const data = await res.json();
    redirect(`/servers/${data.serverId}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Joining {server.name}...</h1>
      </div>
    </div>
  );
}
