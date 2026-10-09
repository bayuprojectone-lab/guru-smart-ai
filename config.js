// js/config.js
var SUPABASE_URL = 'https://urslwiueyqhoykjhxmqq.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyc2x3aXVleXFob3lramh4bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTIxMDgsImV4cCI6MjEwNTIyODEwOH0.cRHI2m9lasLJ6yX2vc1ioxJGm7bLRsCIptmiNtpz5go';

// Inisialisasi Supabase Client
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

