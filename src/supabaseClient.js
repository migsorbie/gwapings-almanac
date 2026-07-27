import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ykopykdqeteskllrjreo.supabase.co'
const supabaseAnonKey = 'sb_publishable_jpqUXJUqd2nZTbG9WPc7Sg_3w1cWuF2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)