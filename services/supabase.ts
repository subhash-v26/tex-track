import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
const supabaseUrl = 'https://gchqaydihccspgshynek.supabase.co';
const supabaseKey = 'sb_publishable_QC_M4Mn3Mt9y7QUP4FTxyQ_15RtqbER';

export const supabase = createClient(supabaseUrl, supabaseKey);