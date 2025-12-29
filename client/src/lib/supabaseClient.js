// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fcacvjriatrbgyzqckub.supabase.co' // Remplace par ton URL
const supabaseKey = 'sb_secret_gjbsN5e1wp_3p1Ly_j8_Xg_NAdt0JhO' // Remplace par ta clé "anon" / "public"

export const supabase = createClient(supabaseUrl, supabaseKey)