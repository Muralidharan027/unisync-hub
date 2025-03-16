
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fahqlerywybttjinbanp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaHFsZXJ5d3lidHRqaW5iYW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTczODEsImV4cCI6MjA1NzQzMzM4MX0.4tkhXB8BYlkAQlmkYYvfuK8gPjoGQztY2xhGbko3fcU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
