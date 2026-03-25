import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const MESSAGES_BATCH = 50;

const createMessageSchema = z.object({
  content: z.string().min(1),
  fileUrl: z.string().optional(),
  channelId: z.string().uuid(),
  serverId: z.string().uuid(),
});

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const cursor = searchParams.get("cursor");

    if (!channelId) return new NextResponse("Channel ID missing", { status: 400 });

    let query = supabase
      .from("messages")
      .select(`
        *,
        member:members(
          *,
          profile:profiles(*)
        )
      `)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(MESSAGES_BATCH);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: messages, error } = await query;

    if (error) return new NextResponse("Failed to fetch messages", { status: 500 });

    let nextCursor = null;
    if (messages && messages.length === MESSAGES_BATCH) {
      nextCursor = messages[messages.length - 1].created_at;
    }

    return NextResponse.json({
      items: messages ?? [],
      nextCursor,
    });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { content, fileUrl, channelId, serverId } = createMessageSchema.parse(body);

    // Get member record
    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("server_id", serverId)
      .eq("profile_id", user.id)
      .single();

    if (!member) return new NextResponse("Member not found", { status: 404 });

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        content,
        file_url: fileUrl ?? null,
        channel_id: channelId,
        member_id: member.id,
      })
      .select(`
        *,
        member:members(
          *,
          profile:profiles(*)
        )
      `)
      .single();

    if (error) return new NextResponse("Failed to send message", { status: 500 });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
