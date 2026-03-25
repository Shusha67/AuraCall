import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const createServerSchema = z.object({
  name: z.string().min(1, "Server name is required"),
  imageUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, imageUrl } = createServerSchema.parse(body);

    // Create server
    const { data: server, error: serverError } = await supabase
      .from("servers")
      .insert({
        name,
        image_url: imageUrl ?? null,
        invite_code: uuidv4(),
        profile_id: user.id,
      })
      .select()
      .single();

    if (serverError || !server) {
      return new NextResponse("Failed to create server", { status: 500 });
    }

    // Create default #general channel
    await supabase.from("channels").insert({
      name: "general",
      type: "TEXT",
      profile_id: user.id,
      server_id: server.id,
    });

    // Add creator as ADMIN member
    await supabase.from("members").insert({
      profile_id: user.id,
      server_id: server.id,
      role: "ADMIN",
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
