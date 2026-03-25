import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .refine((name) => name !== "general", {
      message: "Channel name cannot be 'general'",
    }),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]).default("TEXT"),
  serverId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, type, serverId } = createChannelSchema.parse(body);

    // Check user has ADMIN/MODERATOR role
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
      .insert({
        name,
        type,
        server_id: serverId,
        profile_id: user.id,
      })
      .select()
      .single();

    if (error) return new NextResponse("Failed to create channel", { status: 500 });

    return NextResponse.json(channel);
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
