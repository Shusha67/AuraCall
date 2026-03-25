import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
}

export function UserAvatar({ src, name, className }: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarImage src={src ?? undefined} alt={name ?? "User"} />
      <AvatarFallback className="bg-indigo-600 text-white text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
