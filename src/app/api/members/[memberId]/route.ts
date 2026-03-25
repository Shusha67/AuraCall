import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateMemberSchema = z.object({
  role: z.enum(["MODERATOR", "GUEST"]),
  serverId: z.string().uuid(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { role, serverId } = updateMemberSchema.parse(body);

    // Only ADMIN can change roles
    const { data: currentMember } = await supabase
      .from("members")
      .select("role")
      .eq("server_id", serverId)
      .eq("profile_id", user.id)
      .single();

    if (!currentMember || currentMember.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { data: member, error } = await supabase
      .from("members")
      .update({ role })
      .eq("id", params.memberId)
      .eq("server_id", serverId)
      .select("*, profile:profiles(*)")
      .single();

    if (error) return new NextResponse("Not found", { status: 404 });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[MEMBER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) return new NextResponse("Server ID missing", { status: 400 });

    // Only ADMIN can kick members
    const { data: currentMember } = await supabase
      .from("members")
      .select("role")
      .eq("server_id", serverId)
      .eq("profile_id", user.id)
      .single();

    if (!currentMember || currentMember.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", params.memberId)
      .eq("server_id", serverId);

    if (error) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
