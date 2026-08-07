import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vvnxjxywrvhpsakcszsj.supabase.co'

const supabaseKey = 'sb_publishable_9eInNPNvN6N66VkJwK-QHQ_6OmJYyEe'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});