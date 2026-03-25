import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: { inviteCode: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Find server by invite code
    const { data: server } = await supabase
      .from("servers")
      .select("id")
      .eq("invite_code", params.inviteCode)
      .single();

    if (!server) return new NextResponse("Invalid invite code", { status: 404 });

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .eq("server_id", server.id)
      .eq("profile_id", user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ serverId: server.id });
    }

    // Add as GUEST
    await supabase.from("members").insert({
      server_id: server.id,
      profile_id: user.id,
      role: "GUEST",
    });

    return NextResponse.json({ serverId: server.id });
  } catch (error) {
    console.error("[INVITE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
