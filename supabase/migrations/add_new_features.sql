-- Create followers table
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create ranking_notifications table
CREATE TABLE IF NOT EXISTS ranking_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_rank INT NOT NULL,
  new_rank INT NOT NULL,
  rank_change INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Create user_statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_predictions INT DEFAULT 0,
  correct_predictions INT DEFAULT 0,
  accuracy_rate DECIMAL(5, 2) DEFAULT 0,
  current_rank INT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create monthly_statistics table
CREATE TABLE IF NOT EXISTS monthly_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  predictions_count INT DEFAULT 0,
  correct_predictions INT DEFAULT 0,
  accuracy_rate DECIMAL(5, 2) DEFAULT 0,
  UNIQUE(user_id, month)
);

-- Create weekly_statistics table
CREATE TABLE IF NOT EXISTS weekly_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  predictions_count INT DEFAULT 0,
  correct_predictions INT DEFAULT 0,
  accuracy_rate DECIMAL(5, 2) DEFAULT 0,
  UNIQUE(user_id, week_start)
);

-- Create team_statistics table
CREATE TABLE IF NOT EXISTS team_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  total_members INT DEFAULT 0,
  average_accuracy DECIMAL(5, 2) DEFAULT 0,
  total_predictions INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id)
);

-- Enable RLS on all tables
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for followers table
CREATE POLICY "Users can view followers" ON followers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own followers" ON followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own followers" ON followers
  FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for ranking_notifications table
CREATE POLICY "Users can view their own notifications" ON ranking_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" ON ranking_notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_achievements table
CREATE POLICY "Users can view achievements" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update achievements" ON user_achievements
  FOR UPDATE USING (true);

-- RLS Policies for user_statistics table
CREATE POLICY "Users can view statistics" ON user_statistics
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage statistics" ON user_statistics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update statistics" ON user_statistics
  FOR UPDATE USING (true);

-- RLS Policies for monthly_statistics table
CREATE POLICY "Users can view monthly statistics" ON monthly_statistics
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage monthly statistics" ON monthly_statistics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update monthly statistics" ON monthly_statistics
  FOR UPDATE USING (true);

-- RLS Policies for weekly_statistics table
CREATE POLICY "Users can view weekly statistics" ON weekly_statistics
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage weekly statistics" ON weekly_statistics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update weekly statistics" ON weekly_statistics
  FOR UPDATE USING (true);

-- RLS Policies for team_statistics table
CREATE POLICY "Users can view team statistics" ON team_statistics
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage team statistics" ON team_statistics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update team statistics" ON team_statistics
  FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);
CREATE INDEX idx_ranking_notifications_user_id ON ranking_notifications(user_id);
CREATE INDEX idx_ranking_notifications_created_at ON ranking_notifications(created_at);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_monthly_statistics_user_id ON monthly_statistics(user_id);
CREATE INDEX idx_monthly_statistics_month ON monthly_statistics(month);
CREATE INDEX idx_weekly_statistics_user_id ON weekly_statistics(user_id);
CREATE INDEX idx_weekly_statistics_week_start ON weekly_statistics(week_start);
CREATE INDEX idx_team_statistics_team_id ON team_statistics(team_id);
