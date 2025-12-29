// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ton-projet.supabase.co' // Remplace par ton URL
const supabaseKey = 'eyJh...' // Remplace par ta clé "anon" / "public"

export const supabase = createClient(supabaseUrl, supabaseKey)