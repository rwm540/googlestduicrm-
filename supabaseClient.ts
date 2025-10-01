import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwfzqacatttacysbeqax.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnpxYWNhdHR0YWN5c2JlcWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTM4MzgsImV4cCI6MjA3NDEyOTgzOH0.X1IMJsxR4TS1_Uq_f0hsoWsqeRF-nc8KbeM780X_MaU';

// نام باکت (bucket) برای ذخیره پیوست‌ها
// نکته: این باکت باید در داشبورد Supabase شما به صورت دستی ایجاد شده و روی حالت "Public" تنظیم شده باشد.
export const BUCKET_NAME = 'attachments';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);