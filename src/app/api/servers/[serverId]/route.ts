import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateServerSchema = z.object({
  name: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, imageUrl } = updateServerSchema.parse(body);

    const { data: server, error } = await supabase
      .from("servers")
      .update({
        ...(name && { name }),
        ...(imageUrl !== undefined && { image_url: imageUrl }),
      })
      .eq("id", params.serverId)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error) return new NextResponse("Not found or forbidden", { status: 404 });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { error } = await supabase
      .from("servers")
      .delete()
      .eq("id", params.serverId)
      .eq("profile_id", user.id);

    if (error) return new NextResponse("Not found or forbidden", { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SERVER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
