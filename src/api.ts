import axios from 'axios';

// اطلاعات اتصال به پروژه Supabase شما
const supabaseUrl = 'https://gwfzqacatttacysbeqax.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnpxYWNhdHR0YWN5c2JlcWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTM4MzgsImV4cCI6MjA3NDEyOTgzOH0.X1IMJsxR4TS1_Uq_f0hsoWsqeRF-nc8KbeM780X_MaU';

// ایجاد یک نمونه axios با تنظیمات پایه برای Supabase REST API
const api = axios.create({
  baseURL: `${supabaseUrl}/rest/v1`,
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  }
});

export default api;
