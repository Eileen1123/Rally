"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'
import { EventCard } from '@/components/event-card'
import { Event, currentUser } from '@/lib/data'
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabaseClient'

type ConnectionState =
  | { status: 'idle' }
  | { status: 'connecting' }
  | { status: 'connected' }
  | { status: 'error'; message: string }

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeTab') || 'in-progress'
    }
    return 'in-progress'
  })
  const [events, setEvents] = useState<Event[]>([])
  const [conn, setConn] = useState<ConnectionState>({ status: 'idle' })
  const [isLoading, setIsLoading] = useState(false)
  const canConnect = useMemo(() => hasSupabaseEnv, [])

  const mapActivityToEvent = (row: any): Event => {
    // 确保 participants 是数组
    let participants = []
    if (row.participants) {
      if (typeof row.participants === 'string') {
        try {
          participants = JSON.parse(row.participants)
        } catch (e) {
          console.error('解析 participants 失败:', e)
          participants = []
        }
      } else if (Array.isArray(row.participants)) {
        participants = row.participants
      }
    }

    // 确保 confirmedParticipants 是数组
    let confirmedParticipants = undefined
    if (row.confirmed_participants) {
      if (typeof row.confirmed_participants === 'string') {
        try {
          confirmedParticipants = JSON.parse(row.confirmed_participants)
        } catch (e) {
          console.error('解析 confirmed_participants 失败:', e)
          confirmedParticipants = []
        }
      } else if (Array.isArray(row.confirmed_participants)) {
        confirmedParticipants = row.confirmed_participants
      }
    }

    // 确保 recommendedLocations 是数组
    let recommendedLocations = undefined
    if (row.recommended_locations) {
      if (typeof row.recommended_locations === 'string') {
        try {
          recommendedLocations = JSON.parse(row.recommended_locations)
        } catch (e) {
          console.error('解析 recommended_locations 失败:', e)
        }
      } else if (Array.isArray(row.recommended_locations)) {
        recommendedLocations = row.recommended_locations
      }
    }

    // 确保 finalLocation 是对象
    let finalLocation = undefined
    if (row.final_location) {
      if (typeof row.final_location === 'string') {
        try {
          finalLocation = JSON.parse(row.final_location)
        } catch (e) {
          console.error('解析 final_location 失败:', e)
        }
      } else if (typeof row.final_location === 'object') {
        finalLocation = row.final_location
      }
    }

    return {
      id: row.id,
      name: row.name,
      date: row.date,
      status: row.status,
      description: row.description ?? '',
      budgetRange: row.budget_range ?? '',
      participants: participants,
      recommendedLocations: recommendedLocations,
      finalLocation: finalLocation,
      allVetoed: row.all_vetoed ?? undefined,
      rsvpDeadline: row.rsvp_deadline ?? undefined,
      userRsvpStatus: row.user_rsvp_status ?? undefined,
      initiatorName: row.initiator_name ?? '',
      confirmedParticipants: confirmedParticipants,
      userReconfirmationStatus: row.user_reconfirmation_status ?? undefined,
      reconfirmationDeadline: row.reconfirmation_deadline ?? undefined,
    } as Event
  }

  const loadFromSupabase = async () => {
    if (!canConnect) return
    
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      const rows = (data ?? []) as any[]
      const mapped = rows.map(mapActivityToEvent)
      setEvents(mapped)
    } catch (e: any) {
      console.error('加载 activities 失败:', e)
      setConn({ status: 'error', message: e?.message ?? '加载失败' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const testConnection = async () => {
      setConn({ status: 'connecting' })
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from('activities').select('id').limit(1)
        if (error) throw error
        setConn({ status: 'connected' })
      } catch (e: any) {
        console.error('Supabase 连接错误:', e)
        setConn({ status: 'error', message: e?.message ?? '连接失败，请检查环境变量和数据库表' })
      }
    }
    if (canConnect) testConnection()
  }, [canConnect])

  useEffect(() => {
    if (conn.status === 'connected') {
      loadFromSupabase()
    }
  }, [conn.status])

  // 监听页面焦点，自动刷新数据
  useEffect(() => {
    const handleFocus = () => {
      if (conn.status === 'connected') {
        loadFromSupabase()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [conn.status])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab)
    }
  }, [activeTab])

  // 过滤逻辑与原先保持一致
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const now = new Date()
    eventDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const isEventDatePassed = eventDate < now

    if (activeTab === 'in-progress') {
      return !isEventDatePassed
    } else if (activeTab === 'history') {
      return isEventDatePassed
    } else if (activeTab === 'my-initiated') {
      return event.initiatorName === currentUser.name
    }
    return true
  })

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-orange-500">碰头吧 Rally</h1>
        <Image
          src="/placeholder.svg?height=40&width=40"
          width={40}
          height={40}
          alt="User Avatar"
          className="w-10 h-10 rounded-full cursor-pointer"
        />
      </header>

      {/* 连接状态条 */}
      <div className="px-4 py-2 text-sm flex items-center justify-between">
        <div>
          {!canConnect && (
            <div className="text-amber-600">
              未配置 Supabase 环境变量
            </div>
          )}
          {canConnect && conn.status === 'connecting' && (
            <div className="text-blue-600">正在连接云端数据…</div>
          )}
          {canConnect && conn.status === 'connected' && (
            <div className="text-green-600">已成功链接云端数据</div>
          )}
          {canConnect && conn.status === 'error' && (
            <div className="text-red-600">链接失败：{conn.message}</div>
          )}
        </div>
        
        {/* 刷新按钮 */}
        {conn.status === 'connected' && (
          <button
            onClick={loadFromSupabase}
            disabled={isLoading}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '刷新中...' : '刷新'}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-4 border-b border-gray-200 bg-white">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
              activeTab === 'in-progress'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            aria-current={activeTab === 'in-progress' ? 'page' : undefined}
          >
            正在进行
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            历史记录
          </button>
          <button
            onClick={() => setActiveTab('my-initiated')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
              activeTab === 'my-initiated'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            aria-current={activeTab === 'my-initiated' ? 'page' : undefined}
          >
            由自己发起
          </button>
        </nav>
      </div>

      {/* Event List */}
      <main className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="text-center text-gray-500 py-10">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>加载中...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>暂无{activeTab === 'in-progress' ? '正在进行' : activeTab === 'history' ? '历史' : '由自己发起'}活动。</p>
            {activeTab === 'in-progress' && <p>点击右下角按钮发起新的碰头吧！</p>}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Link href="/create-event" passHref>
        <button className="fixed bottom-8 right-8 h-16 w-16 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
          <Plus className="h-8 w-8" />
          <span className="sr-only">发起碰头</span>
        </button>
      </Link>
    </div>
  )
}
