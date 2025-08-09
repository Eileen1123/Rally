"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Event,
  Location,
  currentUser,
} from '@/lib/data'
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabaseClient'
import { MapPin, Share2, XCircle, Lightbulb, CheckCircle2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [vetoedLocationId, setVetoedLocationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 从 Supabase 加载事件数据
  const loadEventFromSupabase = async () => {
    if (!hasSupabaseEnv) {
      console.error('Supabase 环境变量未配置')
      router.push('/')
      return
    }

    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        console.error('加载事件失败:', error)
        router.push('/')
        return
      }

      if (!data) {
        console.error('未找到事件')
        router.push('/')
        return
      }

      // 转换数据格式
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

      const mappedEvent = mapActivityToEvent(data)
      setEvent(mappedEvent)

      // 设置用户否决的地点
      const userVetoedLoc = mappedEvent.recommendedLocations?.find(loc =>
        loc.vetoedBy?.includes(currentUser.name)
      );
      if (userVetoedLoc) {
        setVetoedLocationId(userVetoedLoc.id);
      }
    } catch (e: any) {
      console.error('加载事件失败:', e)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEventFromSupabase()
  }, [eventId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600">事件不存在</p>
      </div>
    )
  }

  const isRsvpDeadlinePassed = event.rsvpDeadline ? new Date() > new Date(event.rsvpDeadline) : false;
  const isReconfirmationDeadlinePassed = event.reconfirmationDeadline ? new Date() > new Date(event.reconfirmationDeadline) : false; // New: Reconfirmation deadline check
  const isInitiator = event.initiatorName === currentUser.name;

  const isEventDatePassed = () => {
    const eventDateObj = new Date(event.date);
    const now = new Date();
    eventDateObj.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return eventDateObj < now;
  };

  const getDisplayStatus = () => {
    if (isEventDatePassed()) {
      return '已结束';
    }
    if (event.status === '需要你响应' && event.userRsvpStatus) {
      return event.userRsvpStatus;
    }
    return event.status;
  };

  const handleRsvp = async (status: Event['userRsvpStatus']) => {
    if (isRsvpDeadlinePassed) {
      alert('响应截止日期已过，无法更改响应状态。');
      return;
    }

    try {
      const supabase = getSupabaseClient()
      
      // 更新用户响应状态
      const { error: rsvpError } = await supabase
        .from('activities')
        .update({ user_rsvp_status: status })
        .eq('id', event.id)

      if (rsvpError) {
        console.error('更新响应状态失败:', rsvpError)
        alert('更新失败，请重试')
        return
      }

      // 更新参与者列表
      let newParticipants = [...event.participants]
      if (status === '已参加' && !newParticipants.some(p => p.name === currentUser.name)) {
        newParticipants.push(currentUser)
      } else if (status !== '已参加') {
        newParticipants = newParticipants.filter(p => p.name !== currentUser.name)
      }

      const { error: participantsError } = await supabase
        .from('activities')
        .update({ participants: newParticipants })
        .eq('id', event.id)

      if (participantsError) {
        console.error('更新参与者列表失败:', participantsError)
        alert('更新失败，请重试')
        return
      }

      alert(`您已选择：${status}`)
      
      // 更新本地状态
      setEvent(prevEvent => {
        if (!prevEvent) return null
        return {
          ...prevEvent,
          userRsvpStatus: status,
          participants: newParticipants,
        }
      })

      router.push('/')
    } catch (e: any) {
      console.error('更新失败:', e)
      alert('更新失败，请重试')
    }
  }

  const handleLocationVote = (locationId: string, isChecked: boolean) => {
    if (vetoedLocationId === locationId) {
      return;
    }
    setSelectedLocations(prev =>
      isChecked ? [...prev, locationId] : prev.filter(id => id !== locationId),
    )
  }

  const handleVeto = (locationId: string) => {
    if (vetoedLocationId === locationId) {
      setVetoedLocationId(null)
    } else if (!vetoedLocationId) {
      setVetoedLocationId(locationId)
      setSelectedLocations(prev => prev.filter(id => id !== locationId));
    } else {
      alert('您只能否决一个地点。')
    }
  }

  const handleSubmitVote = async () => {
    if (selectedLocations.length === 0 && !vetoedLocationId) {
      alert('请至少选择一个地点或否决一个地点。')
      return
    }

    try {
      const supabase = getSupabaseClient()
      
      let finalChosenLocation: Location | undefined = undefined;
      let allOptionsVetoed = false;

      const updatedLocationsWithVotes: Location[] = event.recommendedLocations?.map(loc => {
        let currentVotes = loc.votes || 0;
        let currentVetoedBy = loc.vetoedBy ? [...loc.vetoedBy] : [];

        if (selectedLocations.includes(loc.id)) {
          currentVotes += 1;
        }
        if (vetoedLocationId === loc.id && !currentVetoedBy.includes(currentUser.name)) {
          currentVetoedBy.push(currentUser.name);
          currentVotes = 0;
        }

        if (!currentVetoedBy.includes(currentUser.name)) {
          if (Math.random() < 0.1 && !currentVetoedBy.includes('其他用户A')) {
            currentVetoedBy.push('其他用户A');
            currentVotes = 0;
          } else if (Math.random() < 0.5) {
            currentVotes += Math.floor(Math.random() * 3);
          }
        }

        return { ...loc, votes: currentVotes, vetoedBy: currentVetoedBy };
      }) || [];

      const nonVetoedLocations = updatedLocationsWithVotes.filter(loc => !(loc.vetoedBy && loc.vetoedBy.length > 0));

      if (nonVetoedLocations.length === 0) {
        allOptionsVetoed = true;
      } else {
        finalChosenLocation = nonVetoedLocations.reduce((prev, current) => {
          return (prev.votes || 0) > (current.votes || 0) ? prev : current;
        }, nonVetoedLocations[0]);
      }

      let newStatus: Event['status']
      if (allOptionsVetoed) {
        newStatus = '所有选项均被否决'
        alert('很遗憾，所有选项均被否决！')
      } else if (finalChosenLocation) {
        newStatus = '结果已出'
        alert(`投票提交成功！最终地点：${finalChosenLocation.name}`)
      } else {
        newStatus = '投票中'
        alert('投票提交成功，但未能确定最终地点。')
      }

      // 更新数据库
      const updateData: any = {
        status: newStatus,
        recommended_locations: updatedLocationsWithVotes,
      }

      if (finalChosenLocation) {
        updateData.final_location = finalChosenLocation
      }

      if (allOptionsVetoed) {
        updateData.all_vetoed = true
      }

      const { error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', event.id)

      if (error) {
        console.error('更新投票结果失败:', error)
        alert('投票提交失败，请重试')
        return
      }

      // 更新本地状态
      setEvent(prevEvent => {
        if (!prevEvent) return null
        return {
          ...prevEvent,
          status: newStatus,
          finalLocation: finalChosenLocation || prevEvent.finalLocation,
          allVetoed: allOptionsVetoed,
          recommendedLocations: updatedLocationsWithVotes,
        }
      })
    } catch (e: any) {
      console.error('投票提交失败:', e)
      alert('投票提交失败，请重试')
    }
  }

  const handleShare = () => {
    alert('活动详情已复制到剪贴板，可以分享给朋友了！')
  }

  const handleReconfirmation = async (status: '已确认参加' | '已拒绝参加') => {
    if (isReconfirmationDeadlinePassed) {
      alert('最终确认截止日期已过，无法更改状态。');
      return;
    }

    try {
      const supabase = getSupabaseClient()
      
      // 更新用户重新确认状态
      const { error: statusError } = await supabase
        .from('activities')
        .update({ user_reconfirmation_status: status })
        .eq('id', event.id)

      if (statusError) {
        console.error('更新重新确认状态失败:', statusError)
        alert('更新失败，请重试')
        return
      }

      // 更新确认参与者列表
      let newConfirmedParticipants = [...(event.confirmedParticipants || [])]
      if (status === '已确认参加') {
        if (!newConfirmedParticipants.some(p => p.name === currentUser.name)) {
          newConfirmedParticipants.push(currentUser)
        }
      } else {
        newConfirmedParticipants = newConfirmedParticipants.filter(p => p.name !== currentUser.name)
      }

      const { error: participantsError } = await supabase
        .from('activities')
        .update({ confirmed_participants: newConfirmedParticipants })
        .eq('id', event.id)

      if (participantsError) {
        console.error('更新确认参与者列表失败:', participantsError)
        alert('更新失败，请重试')
        return
      }

      alert(`您已${status}本次活动。`)
      
      // 更新本地状态
      setEvent(prevEvent => {
        if (!prevEvent) return null
        return {
          ...prevEvent,
          userReconfirmationStatus: status,
          confirmedParticipants: newConfirmedParticipants,
        }
      })
    } catch (e: any) {
      console.error('更新失败:', e)
      alert('更新失败，请重试')
    }
  };

  const handleManualLocationSelect = async (locationId: string) => {
    const selectedLoc = event.recommendedLocations?.find(loc => loc.id === locationId);
    if (selectedLoc) {
      try {
        const supabase = getSupabaseClient()
        
        const { error } = await supabase
          .from('activities')
          .update({
            status: '结果已出',
            final_location: selectedLoc,
            all_vetoed: false
          })
          .eq('id', event.id)

        if (error) {
          console.error('手动选择地点失败:', error)
          alert('选择失败，请重试')
          return
        }

        setEvent(prev => prev ? { 
          ...prev, 
          status: '结果已出', 
          finalLocation: selectedLoc, 
          allVetoed: false 
        } : null)
        
        alert(`您已手动选择地点：${selectedLoc.name}`)
      } catch (e: any) {
        console.error('手动选择地点失败:', e)
        alert('选择失败，请重试')
      }
    }
  }

  const renderParticipants = (participants: Event['participants']) => (
    <div className="flex items-center mt-4">
      <div className="flex -space-x-2 overflow-hidden">
        {participants.slice(0, 4).map((participant, index) => (
          <Image
            key={index}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            src={participant.avatar || '/placeholder.svg'}
            alt={participant.name}
            width={32}
            height={32}
          />
        ))}
        {participants.length > 4 && (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
            {`+${participants.length - 4}`}
          </span>
        )}
      </div>
      <span className="ml-2 text-sm text-gray-600">
        {participants.length} 位参与者
      </span>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          &larr; 返回
        </button>
        <h1 className="text-xl font-bold text-orange-500">碰头吧 Rally</h1>
        <Image
          src="/placeholder.svg?height=40&width=40"
          width={40}
          height={40}
          alt="User Avatar"
          className="w-10 h-10 rounded-full cursor-pointer"
        />
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">{event.name}</CardTitle>
            <CardDescription className="text-gray-600">
              {event.date} | 预算: {event.budgetRange}
              {isInitiator && <span className="ml-2 text-xs text-orange-500 font-medium">由自己发起</span>}
              {isEventDatePassed() && <span className="ml-2 text-xs text-gray-500 font-medium">(已结束)</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{event.description}</p>
            {event.rsvpDeadline && (
              <p className={`text-sm mt-2 ${isRsvpDeadlinePassed ? 'text-red-500' : 'text-gray-600'}`}>
                响应截止日期: {event.rsvpDeadline} {isRsvpDeadlinePassed && '(已截止)'}
              </p>
            )}
            {renderParticipants(event.participants)}
          </CardContent>
        </Card>

        {event.status === '需要你响应' && !isEventDatePassed() && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-xl text-orange-500">响应邀约</CardTitle>
              {event.userRsvpStatus && (
                <CardDescription className="text-sm text-gray-600">
                  您当前的响应状态：<span className="font-medium">{event.userRsvpStatus}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleRsvp('已参加')}
                className={`flex-1 min-w-[100px] ${
                  event.userRsvpStatus === '已参加'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                disabled={isRsvpDeadlinePassed}
              >
                参加
              </Button>
              <Button
                onClick={() => handleRsvp('已待定')}
                className={`flex-1 min-w-[100px] ${
                  event.userRsvpStatus === '已待定'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                disabled={isRsvpDeadlinePassed}
              >
                待定
              </Button>
              <Button
                onClick={() => handleRsvp('已拒绝')}
                className={`flex-1 min-w-[100px] ${
                  event.userRsvpStatus === '已拒绝'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                disabled={isRsvpDeadlinePassed}
              >
                拒绝
              </Button>
            </CardContent>
          </Card>
        )}

        {event.status === '投票中' && event.recommendedLocations && !isEventDatePassed() && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-xl text-orange-500">地点投票</CardTitle>
              <CardDescription className="flex items-center text-gray-600">
                <Lightbulb className="h-4 w-4 mr-1 text-blue-500" />
                基于参与者位置和预算智能推荐
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.recommendedLocations.map(location => {
                const isVetoedByCurrentUser = vetoedLocationId === location.id;
                const isAlreadyVetoedByAnyone = location.vetoedBy && location.vetoedBy.length > 0;
                const isDisabledForVote = isVetoedByCurrentUser || isAlreadyVetoedByAnyone;

                return (
                  <div
                    key={location.id}
                    className={`flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm ${
                      isVetoedByCurrentUser ? 'border-red-400 bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`loc-${location.id}`}
                        checked={selectedLocations.includes(location.id)}
                        onCheckedChange={checked =>
                          handleLocationVote(location.id, checked as boolean)
                        }
                        disabled={isDisabledForVote}
                      />
                      <Label htmlFor={`loc-${location.id}`} className="flex flex-col">
                        <span className="font-medium text-gray-800">{location.name}</span>
                        <span className="text-sm text-gray-500">{location.address}</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isAlreadyVetoedByAnyone && (
                        <span className="text-red-500 text-xs font-medium">
                          被 {location.vetoedBy?.length} 人否决
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVeto(location.id)}
                        className={`text-sm ${
                          isVetoedByCurrentUser
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        disabled={!!vetoedLocationId && !isVetoedByCurrentUser}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {isVetoedByCurrentUser ? '已否决' : '否决'}
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button onClick={handleSubmitVote} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                提交投票
              </Button>
            </CardContent>
          </Card>
        )}

        {(event.status === '结果已出' || isEventDatePassed()) && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-xl text-green-500">最终地点已确定！</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.finalLocation && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="font-bold text-lg text-gray-900">{event.finalLocation.name}</p>
                    <p className="text-gray-700">{event.finalLocation.address}</p>
                  </div>
                </div>
              )}
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                <p>地图导航占位符</p>
              </div>

              {event.recommendedLocations && event.recommendedLocations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-2">投票详情:</h4>
                  <ul className="space-y-2">
                    {event.recommendedLocations.map(loc => (
                      <li key={loc.id} className="flex justify-between items-center text-gray-700">
                        <span>{loc.name}</span>
                        <div className="flex items-center space-x-2">
                          {loc.vetoedBy && loc.vetoedBy.length > 0 && (
                            <span className="text-red-500 text-sm">
                              否决: {loc.vetoedBy.length}
                            </span>
                          )}
                          {loc.votes !== undefined && (
                            <span className="text-blue-600 text-sm">
                              票数: {loc.votes}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={handleShare} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <Share2 className="h-4 w-4 mr-2" />
                分享活动结果
              </Button>

              {/* 重新确认参与人员模块 */}
              {event.status === '结果已出' && !isEventDatePassed() && (
                <Card className="mt-6 border-t pt-4">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl text-orange-500 flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      确认最终参与人员
                    </CardTitle>
                    {event.reconfirmationDeadline && ( // New: Display reconfirmation deadline
                      <CardDescription className={`text-sm mt-1 ${isReconfirmationDeadlinePassed ? 'text-red-500' : 'text-gray-600'}`}>
                        最终确认截止日期: {event.reconfirmationDeadline} {isReconfirmationDeadlinePassed && '(已截止)'}
                      </CardDescription>
                    )}
                    <CardDescription>
                      {isInitiator
                        ? '以下是已确认参加本次活动的朋友。'
                        : '请确认您是否参加本次活动。一经选择无法更改。'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    {isInitiator ? (
                      // Initiator view: display confirmed participants
                      event.confirmedParticipants && event.confirmedParticipants.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"> {/* Improved layout */}
                          {event.confirmedParticipants.map(participant => (
                            <div key={participant.name} className="flex flex-col items-center space-y-1 text-gray-700">
                              <Image
                                src={participant.avatar || '/placeholder.svg'}
                                alt={participant.name}
                                width={40}
                                height={40}
                                className="rounded-full ring-2 ring-white"
                              />
                              <span className="text-sm truncate w-full text-center">{participant.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">暂无确认参加的成员。</p>
                      )
                    ) : (
                      // Participant view: reconfirmation buttons
                      event.userReconfirmationStatus ? (
                        <p className="text-gray-700 font-medium">
                          您已选择：<span className={event.userReconfirmationStatus === '已确认参加' ? 'text-green-600' : 'text-red-600'}>
                            {event.userReconfirmationStatus}
                          </span>
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => handleReconfirmation('已确认参加')}
                            className="flex-1 min-w-[100px] bg-green-500 hover:bg-green-600 text-white"
                            disabled={!!event.userReconfirmationStatus || isReconfirmationDeadlinePassed} // New: Disable if deadline passed
                          >
                            确认参加
                          </Button>
                          <Button
                            onClick={() => handleReconfirmation('已拒绝参加')}
                            className="flex-1 min-w-[100px] bg-red-500 hover:bg-red-600 text-white"
                            disabled={!!event.userReconfirmationStatus || isReconfirmationDeadlinePassed} // New: Disable if deadline passed
                          >
                            拒绝参加
                          </Button>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {event.status === '所有选项均被否决' && !isEventDatePassed() && (
          <Card className="mb-4 border-red-400 border-2">
            <CardHeader>
              <CardTitle className="text-xl text-red-600">抱歉，所有选项均被否决！</CardTitle>
              <CardDescription>
                很遗憾，本次碰头的所有推荐地点都被参与者否决了。请发起人与成员商议后，手动选择一个地点。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {event.recommendedLocations && event.recommendedLocations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">投票详情:</h4>
                  <ul className="space-y-2">
                    {event.recommendedLocations.map(loc => (
                      <li key={loc.id} className="flex justify-between items-center text-gray-700">
                        <span>{loc.name}</span>
                        <div className="flex items-center space-x-2">
                          {loc.vetoedBy && loc.vetoedBy.length > 0 && (
                            <span className="text-red-500 text-sm">
                              否决: {loc.vetoedBy.length} 人 ({loc.vetoedBy.join(', ')})
                            </span>
                          )}
                          {loc.votes !== undefined && (
                            <span className="text-blue-600 text-sm">
                              票数: {loc.votes}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isInitiator && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">发起人手动选择地点:</h4>
                  <Select onValueChange={handleManualLocationSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择一个地点作为最终地点" />
                    </SelectTrigger>
                    <SelectContent>
                      {event.recommendedLocations?.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name} ({loc.address})
                          {loc.vetoedBy && loc.vetoedBy.length > 0 && ` (被否决: ${loc.vetoedBy.length}人)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    * 手动选择后，活动状态将变为“结果已出”。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
