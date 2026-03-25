import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationAction } from "@/components/navigation/navigation-action";
import { NavigationItem } from "@/components/navigation/navigation-item";
import { UserAvatar } from "@/components/auth/user-avatar";
import { LogOut } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export async function NavigationSidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: members } = await supabase
    .from("members")
    .select("server_id, servers(*)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  type ServerItem = { id: string; name: string; image_url: string | null };
  const servers: ServerItem[] = [];
  for (const m of members ?? []) {
    if (m.servers) servers.push(m.servers as unknown as ServerItem);
  }

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full bg-zinc-950 py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-800 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.image_url}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <Separator className="h-[2px] bg-zinc-800 rounded-md w-10 mx-auto" />
        <div className="flex flex-col items-center gap-2">
          <UserAvatar
            src={profile?.image_url}
            name={profile?.name}
            className="h-10 w-10"
          />
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
