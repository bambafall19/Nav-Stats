-- Create match_reminders table for per-match push reminders
CREATE TABLE IF NOT EXISTS match_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matchs(id) ON DELETE CASCADE,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- One reminder per user + match (upsert to change the time)
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_reminders_user_match
  ON match_reminders(user_id, match_id);

-- Index to find due reminders quickly
CREATE INDEX IF NOT EXISTS idx_match_reminders_due
  ON match_reminders(remind_at, sent);

-- Enable Row Level Security
ALTER TABLE match_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reminders
DROP POLICY IF EXISTS "Users can view their own reminders" ON match_reminders;
CREATE POLICY "Users can view their own reminders"
  ON match_reminders FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own reminders
DROP POLICY IF EXISTS "Users can insert their own reminders" ON match_reminders;
CREATE POLICY "Users can insert their own reminders"
  ON match_reminders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own reminders (mark as sent / change time)
DROP POLICY IF EXISTS "Users can update their own reminders" ON match_reminders;
CREATE POLICY "Users can update their own reminders"
  ON match_reminders FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own reminders
DROP POLICY IF EXISTS "Users can delete their own reminders" ON match_reminders;
CREATE POLICY "Users can delete their own reminders"
  ON match_reminders FOR DELETE
  USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON match_reminders TO authenticated;
GRANT ALL ON match_reminders TO service_role;
