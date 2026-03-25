import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Check not owner
    const { data: server } = await supabase
      .from("servers")
      .select("profile_id")
      .eq("id", params.serverId)
      .single();

    if (server?.profile_id === user.id) {
      return new NextResponse("Owner cannot leave server", { status: 400 });
    }

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("server_id", params.serverId)
      .eq("profile_id", user.id);

    if (error) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SERVER_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
