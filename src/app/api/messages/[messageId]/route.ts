import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateMessageSchema = z.object({
  content: z.string().min(1),
  channelId: z.string().uuid(),
  serverId: z.string().uuid(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { content, channelId, serverId } = updateMessageSchema.parse(body);

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("server_id", serverId)
      .eq("profile_id", user.id)
      .single();

    if (!member) return new NextResponse("Member not found", { status: 404 });

    const { data: message, error } = await supabase
      .from("messages")
      .update({ content })
      .eq("id", params.messageId)
      .eq("member_id", member.id)
      .eq("channel_id", channelId)
      .select(`*, member:members(*, profile:profiles(*))`)
      .single();

    if (error) return new NextResponse("Not found or forbidden", { status: 404 });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const serverId = searchParams.get("serverId");

    if (!channelId || !serverId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const { data: member } = await supabase
      .from("members")
      .select("id, role")
      .eq("server_id", serverId)
      .eq("profile_id", user.id)
      .single();

    if (!member) return new NextResponse("Member not found", { status: 404 });

    // Check message ownership or admin/mod role
    const { data: message } = await supabase
      .from("messages")
      .select("member_id")
      .eq("id", params.messageId)
      .single();

    const isOwner = message?.member_id === member.id;
    const canModerate = ["ADMIN", "MODERATOR"].includes(member.role);

    if (!isOwner && !canModerate) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { data: updated, error } = await supabase
      .from("messages")
      .update({ deleted: true, content: "This message has been deleted." })
      .eq("id", params.messageId)
      .select(`*, member:members(*, profile:profiles(*))`)
      .single();

    if (error) return new NextResponse("Not found", { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
