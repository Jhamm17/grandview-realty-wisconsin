-- Enable pg_cron extension (if not already enabled)
-- Note: This may require superuser privileges. Contact Supabase support if needed.

-- Create a function to call the Supabase Edge Function
CREATE OR REPLACE FUNCTION refresh_cache_via_edge_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_status int;
  response_body text;
BEGIN
  -- Call the Supabase Edge Function using http extension
  -- Note: You'll need to enable the http extension first
  SELECT status, content INTO response_status, response_body
  FROM http((
    SELECT 
      'POST' as method,
      'https://' || current_setting('app.settings.supabase_url') || '/functions/v1/refresh-cache' as url,
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ) as headers,
      '{}'::text as content
  )::http_request);
  
  IF response_status != 200 THEN
    RAISE EXCEPTION 'Cache refresh failed with status %: %', response_status, response_body;
  END IF;
END;
$$;

-- Alternative: Use pg_net extension (newer, recommended by Supabase)
-- This is simpler and doesn't require http extension
CREATE OR REPLACE FUNCTION refresh_cache_simple()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This will be called by pg_cron
  -- The actual HTTP call will be made from the Edge Function
  PERFORM net.http_post(
    url := 'https://' || current_setting('app.settings.supabase_url') || '/functions/v1/refresh-cache',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Schedule the cron job to run daily at 6 AM
-- Note: pg_cron may need to be enabled by Supabase support
SELECT cron.schedule(
  'refresh-cache-daily',
  '0 6 * * *', -- Daily at 6 AM UTC
  $$
  SELECT refresh_cache_simple();
  $$
);

-- You can also schedule it more frequently if needed
-- SELECT cron.schedule(
--   'refresh-cache-twice-daily',
--   '0 6,18 * * *', -- 6 AM and 6 PM daily
--   $$
--   SELECT refresh_cache_simple();
--   $$
-- );

