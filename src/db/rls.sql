-- ============================================================
-- AuraCall Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- SERVERS
-- ============================================================
DROP POLICY IF EXISTS "servers_select" ON servers;
CREATE POLICY "servers_select" ON servers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.server_id = servers.id
        AND members.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "servers_insert" ON servers;
CREATE POLICY "servers_insert" ON servers
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "servers_update" ON servers;
CREATE POLICY "servers_update" ON servers
  FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "servers_delete" ON servers;
CREATE POLICY "servers_delete" ON servers
  FOR DELETE USING (auth.uid() = profile_id);

-- ============================================================
-- CHANNELS
-- ============================================================
DROP POLICY IF EXISTS "channels_select" ON channels;
CREATE POLICY "channels_select" ON channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.server_id = channels.server_id
        AND members.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "channels_insert" ON channels;
CREATE POLICY "channels_insert" ON channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.server_id = channels.server_id
        AND members.profile_id = auth.uid()
        AND members.role IN ('ADMIN', 'MODERATOR')
    )
  );

DROP POLICY IF EXISTS "channels_update" ON channels;
CREATE POLICY "channels_update" ON channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.server_id = channels.server_id
        AND members.profile_id = auth.uid()
        AND members.role IN ('ADMIN', 'MODERATOR')
    )
  );

DROP POLICY IF EXISTS "channels_delete" ON channels;
CREATE POLICY "channels_delete" ON channels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.server_id = channels.server_id
        AND members.profile_id = auth.uid()
        AND members.role IN ('ADMIN', 'MODERATOR')
    )
  );

-- ============================================================
-- MEMBERS
-- ============================================================
DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members AS m
      WHERE m.server_id = members.server_id
        AND m.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "members_update" ON members;
CREATE POLICY "members_update" ON members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members AS m
      WHERE m.server_id = members.server_id
        AND m.profile_id = auth.uid()
        AND m.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_delete" ON members
  FOR DELETE USING (
    auth.uid() = profile_id OR
    EXISTS (
      SELECT 1 FROM members AS m
      WHERE m.server_id = members.server_id
        AND m.profile_id = auth.uid()
        AND m.role = 'ADMIN'
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = messages.member_id
        AND EXISTS (
          SELECT 1 FROM members AS m2
          WHERE m2.server_id = members.server_id
            AND m2.profile_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = messages.member_id
        AND members.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = messages.member_id
        AND members.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_delete" ON messages;
CREATE POLICY "messages_delete" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = messages.member_id
        AND (
          members.profile_id = auth.uid()
          OR members.role IN ('ADMIN', 'MODERATOR')
        )
    )
  );

-- ============================================================
-- REALTIME: Enable for messages table
-- Run in Supabase Dashboard: Database > Replication > Add table
-- Or run:
-- ============================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE members;
