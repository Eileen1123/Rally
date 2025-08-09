"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabaseClient'
import { isLoggedIn, getCurrentUser, User } from '@/lib/auth'

export default function CreateEventPage() {
  const router = useRouter()
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [description, setDescription] = useState('')
  const [friends, setFriends] = useState('') // Simplified friend invitation
  const [rsvpDate, setRsvpDate] = useState('') // RSVP deadline date
  const [rsvpTime, setRsvpTime] = useState('') // RSVP deadline time
  const [reconfirmationDate, setReconfirmationDate] = useState('') // New: Reconfirmation deadline date
  const [reconfirmationTime, setReconfirmationTime] = useState('') // New: Reconfirmation deadline time
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // 检查用户登录状态
  useEffect(() => {
    if (isLoggedIn()) {
      setCurrentUser(getCurrentUser())
    } else {
      // 如果未登录，重定向到登录页面
      window.location.href = '/login'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventName || !eventDate || !eventTime) {
      alert('请填写活动名称、日期和时间！')
      return
    }

    if (!hasSupabaseEnv || !currentUser) {
      alert('Supabase 环境未配置或用户未登录，无法创建活动！')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = getSupabaseClient()
      
      // 构建活动数据
      const activityData = {
        name: eventName,
        date: `${eventDate} ${eventTime}`,
        status: '需要你响应',
        description: description || null,
        budget_range: budgetRange || null,
        participants: [{
          name: currentUser.username,
          avatar: currentUser.avatar
        }], // 直接使用数组，Supabase 会自动转换为 JSON
        rsvp_deadline: rsvpDate && rsvpTime ? `${rsvpDate} ${rsvpTime}` : null,
        initiator_name: currentUser.username,
        reconfirmation_deadline: reconfirmationDate && reconfirmationTime ? `${reconfirmationDate} ${reconfirmationTime}` : null,
        user_id: currentUser.id,
      }

      const { data, error } = await supabase
        .from('activities')
        .insert(activityData)
        .select()
        .single()

      if (error) {
        console.error('创建活动失败:', error)
        throw error
      }

      alert('活动创建成功！')
      router.push('/') // Redirect to the homepage
    } catch (error: any) {
      console.error('创建活动错误:', error)
      alert('创建活动失败：' + (error?.message ?? '未知错误'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // 如果未登录，显示加载状态
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-500">发起碰头</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasSupabaseEnv && (
            <div className="mb-4 p-3 bg-amber-100 text-amber-800 rounded-md text-sm">
              ⚠️ 未配置 Supabase 环境变量，无法创建活动
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 活动名称 */}
            <div>
              <Label htmlFor="eventName" className="text-gray-700">
                活动名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="例如：周末剧本杀、老友聚餐"
                required
                className="mt-1"
              />
            </div>

            {/* 活动时间 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate" className="text-gray-700">
                  活动日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="eventTime" className="text-gray-700">
                  活动时间 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={e => setEventTime(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* 响应截止日期 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rsvpDate" className="text-gray-700">
                  响应截止日期 (可选)
                </Label>
                <Input
                  id="rsvpDate"
                  type="date"
                  value={rsvpDate}
                  onChange={e => setRsvpDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rsvpTime" className="text-gray-700">
                  响应截止时间 (可选)
                </Label>
                <Input
                  id="rsvpTime"
                  type="time"
                  value={rsvpTime}
                  onChange={e => setRsvpTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* 最终确认截止日期 (New Section) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reconfirmationDate" className="text-gray-700">
                  最终确认截止日期 (可选)
                </Label>
                <Input
                  id="reconfirmationDate"
                  type="date"
                  value={reconfirmationDate}
                  onChange={e => setReconfirmationDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reconfirmationTime" className="text-gray-700">
                  最终确认截止时间 (可选)
                </Label>
                <Input
                  id="reconfirmationTime"
                  type="time"
                  value={reconfirmationTime}
                  onChange={e => setReconfirmationTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* 预算范围 */}
            <div>
              <Label htmlFor="budgetRange" className="text-gray-700">
                预算范围 (可选)
              </Label>
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="选择预算范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="不限">不限</SelectItem>
                  <SelectItem value="¥50-100">¥50-100</SelectItem>
                  <SelectItem value="¥100-200">¥100-200</SelectItem>
                  <SelectItem value="¥200-300">¥200-300</SelectItem>
                  <SelectItem value="¥300+">¥300+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 活动描述 */}
            <div>
              <Label htmlFor="description" className="text-gray-700">
                活动描述 (可选)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="简单描述一下活动内容，让朋友们更了解"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* 好友邀请系统 (简化版) */}
            <div>
              <Label htmlFor="friends" className="text-gray-700">
                邀请好友 (输入好友ID或昵称，逗号分隔)
              </Label>
              <Input
                id="friends"
                value={friends}
                onChange={e => setFriends(e.target.value)}
                placeholder="例如：张三, 李四, 王五"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                * 实际应用中会提供通讯录导入、搜索等功能
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md"
              disabled={isSubmitting || !hasSupabaseEnv}
            >
              {isSubmitting ? '创建中...' : '发起碰头'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
