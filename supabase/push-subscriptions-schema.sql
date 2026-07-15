-- Create push_subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  subscription_endpoint TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(subscription_endpoint);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON push_subscriptions;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON push_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant permissions
GRANT ALL ON push_subscriptions TO authenticated;
GRANT ALL ON push_subscriptions TO service_role;