"use client";

import { Member, MemberRole, Profile, Server } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/auth/user-avatar";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface ServerMemberProps {
  member: Member & { profile: Profile };
  server: Server;
}

const roleIconMap: Partial<Record<MemberRole, React.ReactNode>> = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

export function ServerMember({ member, server }: ServerMemberProps) {
  const params = useParams();
  const router = useRouter();

  const isActive = params?.memberId === member.id;

  const onClick = () => {
    router.push(`/servers/${server.id}/conversations/${member.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1",
        isActive && "bg-zinc-700"
      )}
    >
      <UserAvatar
        src={member.profile.image_url}
        name={member.profile.name}
        className="h-8 w-8 md:h-8 md:w-8"
      />
      <p
        className={cn(
          "font-semibold text-sm text-zinc-500 group-hover:text-zinc-300 transition",
          isActive && "text-zinc-200 group-hover:text-white"
        )}
      >
        {member.profile.name}
      </p>
      {roleIconMap[member.role]}
    </button>
  );
}
