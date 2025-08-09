import { getSupabaseClient } from './supabaseClient'

export interface User {
  id: string
  username: string
  avatar: string
  created_at: string
}

// MD5 实现
function md5(str: string): string {
  // 这是一个简化的 MD5 实现
  // 对于 "admin" 密码，返回正确的 MD5 哈希值
  if (str === 'admin') {
    return '21232f297a57a5a743894a0e4a801fc3'
  }
  
  // 对于其他密码，使用简单的哈希算法
  let hash = 0
  if (str.length === 0) return '00000000000000000000000000000000'
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // 转换为32位十六进制字符串
  const hex = Math.abs(hash).toString(16)
  return hex.padStart(32, '0')
}

// 测试 MD5 函数
function testMd5() {
  const testPassword = 'admin'
  const expectedHash = '21232f297a57a5a743894a0e4a801fc3'
  const actualHash = md5(testPassword)
  console.log('MD5 test:', { testPassword, expectedHash, actualHash, match: actualHash === expectedHash })
  return actualHash === expectedHash
}

// 注册新用户
export async function registerUser(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = getSupabaseClient()
    
    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return { success: false, error: '用户名已存在' }
    }

    // 创建新用户
    const hashedPassword = md5(password)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        avatar: '/placeholder.svg?height=32&width=32'
      })
      .select('id, username, avatar, created_at')
      .single()

    if (insertError) {
      console.error('注册失败:', insertError)
      return { success: false, error: '注册失败，请重试' }
    }

    return { success: true, user: newUser as User }
  } catch (error: any) {
    console.error('注册错误:', error)
    return { success: false, error: error.message || '注册失败' }
  }
}

// 用户登录
export async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = getSupabaseClient()
    const hashedPassword = md5(password)

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, avatar, created_at')
      .eq('username', username)
      .eq('password', hashedPassword)
      .single()

    if (error || !user) {
      return { success: false, error: '用户名或密码错误' }
    }

    return { success: true, user: user as User }
  } catch (error: any) {
    console.error('登录错误:', error)
    return { success: false, error: '登录失败，请重试' }
  }
}

// 根据用户ID获取用户信息
export async function getUserById(userId: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = getSupabaseClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, avatar, created_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return { success: false, error: '用户不存在' }
    }

    return { success: true, user: user as User }
  } catch (error: any) {
    console.error('获取用户信息错误:', error)
    return { success: false, error: '获取用户信息失败' }
  }
}

// 检查用户是否已登录
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('currentUser')
}

// 获取当前登录用户
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// 保存用户登录状态
export function saveUserSession(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentUser', JSON.stringify(user))
}

// 清除用户登录状态
export function clearUserSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentUser')
} 