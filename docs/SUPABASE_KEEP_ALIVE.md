# Supabase Keep-Alive Setup

This project includes an automated system to prevent the Supabase database from auto-pausing due to inactivity.

## Setup Instructions

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:
   - Name: `SUPABASE_URL`
   - Value: `https://mjbmkwwpnzdbdbgrapmx.supabase.co`
   
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `your-service-role-key` (Add your service role key here)

4. Deploy the SQL migration file to create the keepalive function:
   ```sql
   -- Run this in your Supabase SQL editor
   create or replace function keepalive()
   returns timestamptz
   language sql
   security definer
   as $$
     select now();
   $$;
   ```

The GitHub Action will automatically run every 5 days to keep your database active. You can also manually trigger it from the "Actions" tab in your GitHub repository.

## How it Works

1. A GitHub Action runs every 5 days
2. It makes a simple API call to your Supabase database
3. The call executes a lightweight `keepalive()` function
4. This activity prevents the database from being auto-paused

## Security

- The service role key is stored securely in GitHub Secrets
- The keepalive function only returns the current timestamp
- No sensitive data is accessed or exposed
