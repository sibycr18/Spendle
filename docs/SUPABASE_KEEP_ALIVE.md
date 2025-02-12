# Supabase Keep-Alive Setup

This project includes an automated system to prevent the Supabase database from auto-pausing due to inactivity.

## Setup Instructions

### 1. GitHub Secrets Setup
1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:
   - Name: `SUPABASE_URL`
   - Value: `https://mjbmkwwpnzdbdbgrapmx.supabase.co`
   
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `your-service-role-key` (Add your service role key here)

### 2. Supabase Database Setup
1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Paste this SQL:
   ```sql
   create or replace function keepalive()
   returns timestamptz
   language sql
   security definer
   as $$
     select now();
   $$;
   ```
5. Click "Run" to create the function

### 3. Manual Trigger (Optional)
To manually trigger the keep-alive action:
1. Go to your GitHub repository
2. Click the "Actions" tab
3. Select "Supabase Keep-Alive" from the left sidebar
4. Click the "Run workflow" button (blue button with dropdown)
5. Click "Run workflow" in the dropdown to trigger it

## How it Works

1. A GitHub Action runs automatically every 3 days
2. If a run fails, there's another attempt 3 days later (before the 7-day inactivity limit)
3. It makes a simple API call to your Supabase database
4. The call executes a lightweight `keepalive()` function
5. This activity prevents the database from being auto-paused

## Security

- The service role key is stored securely in GitHub Secrets
- The keepalive function only returns the current timestamp
- No sensitive data is accessed or exposed

## Troubleshooting

If the action fails:
1. Check if the GitHub secrets are correctly set
2. Verify the `keepalive()` function exists in your Supabase database
3. You can manually trigger the action to test it
4. Check the action logs in GitHub for specific error messages
