import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { data: server, error } = await supabase
      .from("servers")
      .update({ invite_code: uuidv4() })
      .eq("id", params.serverId)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error) return new NextResponse("Forbidden", { status: 403 });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[INVITE_CODE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
