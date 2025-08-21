-- Add unique constraint on user_id for google_oauth_tokens table
ALTER TABLE google_oauth_tokens 
ADD CONSTRAINT google_oauth_tokens_user_id_unique UNIQUE (user_id);