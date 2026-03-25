export type ChannelType = "TEXT" | "AUDIO" | "VIDEO";
export type MemberRole = "ADMIN" | "MODERATOR" | "GUEST";

export interface Profile {
  id: string;
  name: string;
  image_url: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Server {
  id: string;
  name: string;
  image_url: string | null;
  invite_code: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  profile_id: string;
  server_id: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  role: MemberRole;
  profile_id: string;
  server_id: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  content: string;
  file_url: string | null;
  member_id: string;
  channel_id: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  member?: Member & { profile: Profile };
}

export interface ServerWithMembersWithProfiles extends Server {
  channels: Channel[];
  members: (Member & { profile: Profile })[];
}
