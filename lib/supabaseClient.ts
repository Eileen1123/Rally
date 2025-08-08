import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// 为了避免在构建期因为缺少 env 而报错，这里采用惰性创建客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined

let cachedClient: SupabaseClient | null = null

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}

export type Task = {
  id: string
  title: string
  completed: boolean
  inserted_at: string | null
}

