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

var AI_IMG='https://z-cdn-media.chatglm.cn/files/bb9b3808-a808-4cb9-a51f-6cf375d0361a.png?auth_key=1889879109-38d4dc3128aa43fa91a6f0b011598e63-0-adf9af249c6126e32ea0adcc7bd54bbe';
var TEACHER_IMG='https://z-cdn-media.chatglm.cn/files/75ded651-0d28-42b6-ac6e-372dcb2f3a18.png?auth_key=1890942260-f34ada6a38934170ac18de993429b194-0-e2c31b27403b6a0ff985778a913412f7';
