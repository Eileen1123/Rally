"use client"

import { useEffect, useState } from 'react'
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState({
    hasUrl: false,
    hasKey: false,
    canConnect: false
  })
  const [connectionTest, setConnectionTest] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error'
    message?: string
  }>({ status: 'idle' })

  useEffect(() => {
    setEnvStatus({
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      canConnect: hasSupabaseEnv
    })
  }, [])

  const testConnection = async () => {
    setConnectionTest({ status: 'testing' })
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('activities').select('id').limit(1)
      if (error) throw error
      setConnectionTest({ status: 'success' })
    } catch (e: any) {
      setConnectionTest({ 
        status: 'error', 
        message: e?.message ?? '未知错误' 
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Supabase 调试信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">环境变量状态：</h3>
              <div className="text-sm space-y-1">
                <div>NEXT_PUBLIC_SUPABASE_URL: {envStatus.hasUrl ? '✅ 已配置' : '❌ 未配置'}</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.hasKey ? '✅ 已配置' : '❌ 未配置'}</div>
                <div>可以连接: {envStatus.canConnect ? '✅ 是' : '❌ 否'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">连接测试：</h3>
              <button 
                onClick={testConnection}
                disabled={!envStatus.canConnect || connectionTest.status === 'testing'}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {connectionTest.status === 'testing' ? '测试中...' : '测试连接'}
              </button>
              
              {connectionTest.status === 'success' && (
                <div className="text-green-600">✅ 连接成功！</div>
              )}
              {connectionTest.status === 'error' && (
                <div className="text-red-600">❌ 连接失败：{connectionTest.message}</div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">常见问题：</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 确保在项目根目录创建了 .env.local 文件</li>
                <li>• 确保环境变量名称正确（NEXT_PUBLIC_ 前缀）</li>
                <li>• 确保在 Supabase 中创建了 <code>activities</code> 表</li>
                <li>• 确保关闭了 RLS（Demo 用途）</li>
                <li>• 重启开发服务器以加载新的环境变量</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 