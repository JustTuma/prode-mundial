-- ================================================
-- PRODE MUNDIAL 2026 - Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- PROFILES
-- ================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'AR',
  total_points INTEGER DEFAULT 0,
  exact_scores INTEGER DEFAULT 0,
  correct_results INTEGER DEFAULT 0,
  predictions_made INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- MATCHES
-- ================================================
CREATE TABLE matches (
  id INTEGER PRIMARY KEY,
  external_id INTEGER UNIQUE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_team_code TEXT,
  away_team_code TEXT,
  home_team_flag TEXT,
  away_team_flag TEXT,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, FINISHED, POSTPONED
  stage TEXT NOT NULL, -- GROUP_STAGE, ROUND_OF_16, QUARTER_FINALS, SEMI_FINALS, THIRD_PLACE, FINAL
  group_name TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  city TEXT,
  minute INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- PREDICTIONS
-- ================================================
CREATE TABLE predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  home_score_pred INTEGER NOT NULL,
  away_score_pred INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  is_exact BOOLEAN DEFAULT FALSE,
  is_correct_result BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- ================================================
-- BONUS PREDICTIONS
-- ================================================
CREATE TABLE bonus_predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  champion TEXT,
  top_scorer TEXT,
  runner_up TEXT,
  third_place TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================
-- LEAGUES (private groups)
-- ================================================
CREATE TABLE leagues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  avatar_emoji TEXT DEFAULT '🏆',
  is_public BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE league_members (
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  league_points INTEGER DEFAULT 0,
  league_rank INTEGER,
  PRIMARY KEY (league_id, user_id)
);

-- ================================================
-- COMMENTS / REACTIONS on matches
-- ================================================
CREATE TABLE match_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE match_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_id, emoji)
);

-- ================================================
-- ACHIEVEMENTS / BADGES
-- ================================================
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  condition_type TEXT NOT NULL -- exact_scores, streak, points, etc.
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ================================================
-- SEED ACHIEVEMENTS
-- ================================================
INSERT INTO achievements (id, name, description, emoji, condition_type) VALUES
  ('first_pred', 'Primera Predicción', 'Hiciste tu primera predicción', '🎯', 'predictions_made'),
  ('exacto_1', 'Ojo de Águila', 'Acertaste el resultado exacto de un partido', '🦅', 'exact_scores'),
  ('exacto_5', 'Adivino', 'Acertaste 5 resultados exactos', '🔮', 'exact_scores'),
  ('exacto_10', 'Mago del Prode', 'Acertaste 10 resultados exactos', '🧙', 'exact_scores'),
  ('points_50', 'En Racha', '50 puntos acumulados', '🔥', 'total_points'),
  ('points_100', 'Centurión', '100 puntos acumulados', '💯', 'total_points'),
  ('points_200', 'Leyenda', '200 puntos acumulados', '🏆', 'total_points'),
  ('all_group', 'Fanático', 'Predijiste todos los partidos de fase de grupos', '⚽', 'predictions_made'),
  ('champion_correct', 'El Oráculo', 'Acertaste al campeón', '🌟', 'bonus'),
  ('streak_3', 'Invicto', '3 predicciones correctas seguidas', '⚡', 'streak');

-- ================================================
-- FUNCTIONS
-- ================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update profile points after prediction scored
CREATE OR REPLACE FUNCTION update_profile_stats(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    total_points = (SELECT COALESCE(SUM(points_earned), 0) FROM predictions WHERE user_id = p_user_id) +
                   (SELECT COALESCE(points_earned, 0) FROM bonus_predictions WHERE user_id = p_user_id),
    exact_scores = (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id AND is_exact = TRUE),
    correct_results = (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id AND is_correct_result = TRUE),
    predictions_made = (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update league member points
CREATE OR REPLACE FUNCTION update_league_standings()
RETURNS VOID AS $$
BEGIN
  UPDATE league_members lm SET
    league_points = (
      SELECT COALESCE(SUM(p.points_earned), 0) +
             COALESCE((SELECT bp.points_earned FROM bonus_predictions bp WHERE bp.user_id = lm.user_id), 0)
      FROM predictions p WHERE p.user_id = lm.user_id
    );

  -- Update ranks within each league
  WITH ranked AS (
    SELECT league_id, user_id,
           RANK() OVER (PARTITION BY league_id ORDER BY league_points DESC) as r
    FROM league_members
  )
  UPDATE league_members lm SET league_rank = ranked.r
  FROM ranked
  WHERE lm.league_id = ranked.league_id AND lm.user_id = ranked.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Predictions: public read, own insert/update
CREATE POLICY "predictions_public_read" ON predictions FOR SELECT USING (true);
CREATE POLICY "predictions_own_insert" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_own_update" ON predictions FOR UPDATE USING (auth.uid() = user_id);

-- Bonus predictions
CREATE POLICY "bonus_public_read" ON bonus_predictions FOR SELECT USING (true);
CREATE POLICY "bonus_own_insert" ON bonus_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bonus_own_update" ON bonus_predictions FOR UPDATE USING (auth.uid() = user_id);

-- Leagues: public read, member-based access
CREATE POLICY "leagues_public_read" ON leagues FOR SELECT USING (true);
CREATE POLICY "leagues_owner_insert" ON leagues FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "leagues_owner_update" ON leagues FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "leagues_owner_delete" ON leagues FOR DELETE USING (auth.uid() = owner_id);

-- League members
CREATE POLICY "lm_public_read" ON league_members FOR SELECT USING (true);
CREATE POLICY "lm_own_insert" ON league_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lm_own_delete" ON league_members FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_public_read" ON match_comments FOR SELECT USING (true);
CREATE POLICY "comments_auth_insert" ON match_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_delete" ON match_comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions
CREATE POLICY "reactions_public_read" ON match_reactions FOR SELECT USING (true);
CREATE POLICY "reactions_auth_insert" ON match_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_own_delete" ON match_reactions FOR DELETE USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "achievements_public_read" ON user_achievements FOR SELECT USING (true);

-- Matches: public read (written by server)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_public_read" ON matches FOR SELECT USING (true);
