import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateChannelSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]).optional(),
  serverId: z.string().uuid(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, type, serverId } = updateChannelSchema.parse(body);

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("server_id", serverId)
      .eq("profile_id", user.id)
      .single();

    if (!member || member.role === "GUEST") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { data: channel, error } = await supabase
      .from("channels")
      .update({
        ...(name && { name }),
        ...(type && { type }),
      })
      .eq("id", params.channelId)
      .eq("server_id", serverId)
      .select()
      .single();

    if (error) return new NextResponse("Not found", { status: 404 });

    return NextResponse.json(channel);
  } catch (error) {
    console.error("[CHANNEL_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) return new NextResponse("Server ID missing", { status: 400 });

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("server_id", serverId)
      .eq("profile_id", user.id)
      .single();

    if (!member || member.role === "GUEST") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { error } = await supabase
      .from("channels")
      .delete()
      .eq("id", params.channelId)
      .eq("server_id", serverId)
      .neq("name", "general");

    if (error) return new NextResponse("Not found or protected", { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHANNEL_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
