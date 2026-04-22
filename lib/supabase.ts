import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uszflkegdshxmrrbrfkq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzemZsa2VnZHNoeG1ycmJyYnJma3EiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3Njg3Nzk4MywiZXhwIjoyMDkyNDUzOTgzfQ.a8zR4Anr_7fl50qI2yLIB2mBWn_tA2OcTMoIgBG-K_A';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzemZsa2VnZHNoeG1ycmJyZmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg3Nzk4MywiZXhwIjoyMDkyNDUzOTgzfQ.sgW-SLz_5ldTktyBRN5gQwt4BJlfYjHcBRv996r38Q8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
);
