# Run Realtime Notification Fix

1.  Go to Supabase Dashboard > SQL Editor.
2.  Paste the content of `supabase/migrations/006_enable_realtime.sql`:
    ```sql
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    ```
3.  Run the query.

This is **REQUIRED** for instant notifications to work.
