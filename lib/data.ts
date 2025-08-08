export interface Participant {
  avatar: string
  name: string
}

export interface Location {
  id: string
  name: string
  address: string
  vetoedBy?: string[] // Optional: list of participant names who vetoed this location
  votes?: number // New: Number of votes for this location
}

export interface Event {
  id: string
  name: string
  date: string // Format: YYYY-MM-DD HH:mm
  status: '需要你响应' | '投票中' | '结果已出' | '已结束' | '所有选项均被否决'
  description: string
  budgetRange: string
  participants: Participant[]
  recommendedLocations?: Location[]
  finalLocation?: Location
  allVetoed?: boolean
  rsvpDeadline?: string // Format: YYYY-MM-DD HH:mm
  userRsvpStatus?: '已参加' | '已拒绝' | '已待定'
  initiatorName: string // Name of the event initiator
  confirmedParticipants?: Participant[] // New: For reconfirming participants
  userReconfirmationStatus?: '已确认参加' | '已拒绝参加' // New: Current user's reconfirmation status
  reconfirmationDeadline?: string; // New: Deadline for final participant reconfirmation
}

// Simulate current user
export const currentUser = { avatar: '/placeholder.svg?height=32&width=32', name: '当前用户' };

// Dummy data for events (using let so it can be modified)
export let events: Event[] = [
  {
    id: '1',
    name: '周末剧本杀碰头',
    date: '2025-08-10 19:00', // Future date
    status: '投票中',
    description: '一起玩剧本杀，地点待定，大家投票决定！',
    budgetRange: '¥100-200',
    participants: [
      { avatar: '/placeholder.svg?height=32&width=32', name: '张三' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '李四' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '王五' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '赵六' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '钱七' },
      currentUser, // Add current user to a voting event for testing
    ],
    recommendedLocations: [
      { id: 'loc1', name: '剧本杀A馆', address: '上海市徐汇区天钥桥路1号', votes: 3 },
      { id: 'loc2', name: '剧本杀B馆', address: '上海市黄浦区南京东路2号', votes: 5 },
      { id: 'loc3', name: '剧本杀C馆', address: '上海市静安区愚园路3号', votes: 2 },
    ],
    rsvpDeadline: '2025-08-09 18:00',
    initiatorName: '张三',
  },
  {
    id: '2',
    name: '公司团建烧烤',
    date: '2025-08-15 18:30', // Future date
    status: '需要你响应',
    description: '部门团建烧烤，请大家尽快响应是否参加。',
    budgetRange: '¥200-300',
    participants: [
      { avatar: '/placeholder.svg?height=32&width=32', name: '孙八' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '周九' },
    ],
    rsvpDeadline: '2025-08-14 12:00',
    userRsvpStatus: undefined,
    initiatorName: '孙八',
  },
  {
    id: '3',
    name: '老同学聚餐',
    date: '2025-07-20 12:00', // Past date
    status: '结果已出', // Will be displayed as '已结束' due to past date
    description: '毕业十年聚餐，地点已定，期待相聚！',
    budgetRange: '¥150-250',
    participants: [
      { avatar: '/placeholder.svg?height=32&width=32', name: '吴十' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '郑一' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '冯二' },
    ],
    finalLocation: { id: 'loc4', name: '小南国（陆家嘴店）', address: '上海市浦东新区陆家嘴环路1000号' },
    rsvpDeadline: '2025-07-19 10:00',
    initiatorName: '吴十',
    recommendedLocations: [ // Add recommended locations for result display
      { id: 'loc4', name: '小南国（陆家嘴店）', address: '上海市浦东新区陆家嘴环路1000号', votes: 7 },
      { id: 'loc_old_2', name: '老盛昌', address: '上海市黄浦区', votes: 2 },
    ],
    confirmedParticipants: [ // Example confirmed participants
      { avatar: '/placeholder.svg?height=32&width=32', name: '吴十' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '郑一' },
    ]
  },
  {
    id: '4',
    name: '部门下午茶',
    date: '2025-07-18 15:00', // Past date
    status: '已结束',
    description: '轻松一下，聊聊最近的工作和生活。',
    budgetRange: '¥50-100',
    participants: [
      { avatar: '/placeholder.svg?height=32&width=32', name: '陈三' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '褚四' },
    ],
    finalLocation: { id: 'loc5', name: '星巴克（静安寺店）', address: '上海市静安区南京西路1700号' },
    rsvpDeadline: '2025-07-17 14:00',
    initiatorName: '陈三',
    recommendedLocations: [
      { id: 'loc5', name: '星巴克（静安寺店）', address: '上海市静安区南京西路1700号', votes: 4 },
      { id: 'loc_old_3', name: '瑞幸咖啡', address: '上海市静安区', votes: 1 },
    ]
  },
  {
    id: '5',
    name: '生日派对',
    date: '2025-06-05 20:00', // Past date
    status: '已结束',
    description: '庆祝小明的生日，欢迎大家来玩！',
    budgetRange: '¥300+',
    participants: [
      { avatar: '/placeholder.svg?height=32&width=32', name: '卫五' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '蒋六' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '沈七' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '韩八' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '杨九' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '朱十' },
    ],
    finalLocation: { id: 'loc6', name: 'KTV（人民广场店）', address: '上海市黄浦区人民大道1号' },
    rsvpDeadline: '2025-06-04 18:00',
    initiatorName: '卫五',
    recommendedLocations: [
      { id: 'loc6', name: 'KTV（人民广场店）', address: '上海市黄浦区人民大道1号', votes: 10 },
      { id: 'loc_old_4', name: '酒吧A', address: '上海市黄浦区', votes: 3 },
    ]
  },
  {
    id: '6',
    name: '所有地点都被否决的聚会',
    date: '2025-09-01 14:00', // Future date
    status: '所有选项均被否决',
    description: '一个测试所有地点都被否决的场景。',
    budgetRange: '¥50-100',
    participants: [
      { avatar: '/placeholder.svg?height=32&width=32', name: '测试用户A' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '测试用户B' },
    ],
    recommendedLocations: [
      { id: 'loc7', name: '咖啡馆X', address: '测试地址1', vetoedBy: ['测试用户A'], votes: 0 },
      { id: 'loc8', name: '茶馆Y', address: '测试地址2', vetoedBy: ['测试用户B'], votes: 0 },
    ],
    allVetoed: true,
    rsvpDeadline: '2025-08-30 23:59',
    initiatorName: '测试用户A',
  },
  {
    id: '7',
    name: '测试：地点全部否决 (自己发起)',
    date: '2025-08-20 10:00', // Future date
    status: '所有选项均被否决',
    description: '这是一个测试所有地点都被否决的活动，由当前用户发起。',
    budgetRange: '不限',
    participants: [
      currentUser,
      { avatar: '/placeholder.svg?height=32&width=32', name: '测试否决者A' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '测试否决者B' },
    ],
    recommendedLocations: [
      { id: 'loc9', name: '测试地点X', address: '测试地址X', vetoedBy: [currentUser.name, '测试否决者A'], votes: 0 },
      { id: 'loc10', name: '测试地点Y', address: '测试地址Y', vetoedBy: [currentUser.name, '测试否决者B'], votes: 0 },
    ],
    allVetoed: true,
    rsvpDeadline: '2025-08-19 23:59',
    initiatorName: currentUser.name,
  },
  {
    id: '8',
    name: '测试：确认参与人员 (自己发起)',
    date: '2025-08-25 14:00', // Future date
    status: '结果已出',
    description: '这是一个测试最终地点已确定，需要发起人确认参与人员的活动。',
    budgetRange: '¥100-200',
    participants: [
      currentUser,
      { avatar: '/placeholder.svg?height=32&width=32', name: '参与者甲' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '参与者乙' },
      { avatar: '/placeholder.svg?height=32&width=32', name: '参与者丙' },
    ],
    finalLocation: { id: 'loc11', name: '最终咖啡馆', address: '上海市某区某路123号' },
    rsvpDeadline: '2025-08-24 12:00',
    initiatorName: currentUser.name,
    recommendedLocations: [
      { id: 'loc11', name: '最终咖啡馆', address: '上海市某区某路123号', votes: 5 },
      { id: 'loc12', name: '备选茶馆', address: '上海市某区某路456号', votes: 2 },
    ],
    confirmedParticipants: [], // 初始为空，等待参与者重新确认
    userReconfirmationStatus: undefined, // 初始状态
    reconfirmationDeadline: '2025-08-24 18:00', // Example reconfirmation deadline
  },
]

export function getEventById(id: string): Event | undefined {
  return events.find(event => event.id === id)
}

export function addEvent(newEvent: Omit<Event, 'id' | 'status' | 'participants' | 'userRsvpStatus' | 'initiatorName' | 'confirmedParticipants' | 'userReconfirmationStatus'>) {
  const newId = (events.length + 1).toString()
  const eventToAdd: Event = {
    ...newEvent,
    id: newId,
    status: '需要你响应', // Default status for new events
    participants: [currentUser], // Initiator is the first participant
    userRsvpStatus: '已参加', // Initiator automatically "参加"
    initiatorName: currentUser.name, // Set initiator name
    confirmedParticipants: [currentUser], // Initiator is confirmed by default
    userReconfirmationStatus: '已确认参加', // Initiator automatically reconfirms
  }
  events.push(eventToAdd)
  return eventToAdd
}

export function updateEventStatus(id: string, newStatus: Event['status']) {
  const eventIndex = events.findIndex(event => event.id === id)
  if (eventIndex !== -1) {
    events[eventIndex] = { ...events[eventIndex], status: newStatus }
  }
}

export function updateParticipantStatus(id: string, participant: Participant, rsvpStatus: Event['userRsvpStatus']) {
  const eventIndex = events.findIndex(event => event.id === id)
  if (eventIndex !== -1) {
    const currentParticipants = events[eventIndex].participants;
    const isParticipantAlreadyInList = currentParticipants.some(p => p.name === participant.name);

    let newParticipants = [...currentParticipants];

    if (rsvpStatus === '已参加') {
      if (!isParticipantAlreadyInList) {
        newParticipants.push(participant);
      }
    } else { // '已拒绝' or '已待定'
      if (isParticipantAlreadyInList) {
        newParticipants = newParticipants.filter(p => p.name !== participant.name);
      }
    }

    events[eventIndex] = {
      ...events[eventIndex],
      participants: newParticipants,
    }
  }
}

export function updateUserRsvpStatus(id: string, status: Event['userRsvpStatus']) {
  const eventIndex = events.findIndex(event => event.id === id)
  if (eventIndex !== -1) {
    events[eventIndex] = { ...events[eventIndex], userRsvpStatus: status }
  }
}

export function updateUserReconfirmationStatus(id: string, participant: Participant, status: '已确认参加' | '已拒绝参加') {
  const eventIndex = events.findIndex(event => event.id === id);
  if (eventIndex !== -1) {
    const event = events[eventIndex];
    let newConfirmedParticipants = [...(event.confirmedParticipants || [])];

    if (status === '已确认参加') {
      if (!newConfirmedParticipants.some(p => p.name === participant.name)) {
        newConfirmedParticipants.push(participant);
      }
    } else { // '已拒绝参加'
      newConfirmedParticipants = newConfirmedParticipants.filter(p => p.name !== participant.name);
    }

    // Update the specific user's reconfirmation status if it's the current user
    const updatedEvent = { ...event, confirmedParticipants: newConfirmedParticipants };
    if (participant.name === currentUser.name) {
      updatedEvent.userReconfirmationStatus = status;
    }
    events[eventIndex] = updatedEvent;
  }
}

export function setEventFinalLocation(id: string, location: Location, allLocationsWithVotes: Location[]) {
  const eventIndex = events.findIndex(event => event.id === id)
  if (eventIndex !== -1) {
    events[eventIndex] = {
      ...events[eventIndex],
      status: '结果已出', // Ensure status is '结果已出'
      finalLocation: location,
      recommendedLocations: allLocationsWithVotes, // Store all locations with their final vote counts
      // When final location is set, reset confirmed participants to initial participants
      // This assumes reconfirmation starts after final location is set
      confirmedParticipants: events[eventIndex].participants,
    }
  }
}

export function setEventManualFinalLocation(id: string, location: Location) {
  const eventIndex = events.findIndex(event => event.id === id)
  if (eventIndex !== -1) {
    events[eventIndex] = {
      ...events[eventIndex],
      status: '结果已出', // Change status to '结果已出'
      finalLocation: location,
      allVetoed: false, // No longer all vetoed
      // When final location is set, reset confirmed participants to initial participants
      confirmedParticipants: events[eventIndex].participants,
    }
  }
}

export function updateEventLocations(id: string, updatedLocations: Location[]) {
  const eventIndex = events.findIndex(event => event.id === id)
  if (eventIndex !== -1) {
    events[eventIndex] = { ...events[eventIndex], recommendedLocations: updatedLocations }
  }
}

export function setEventAllVetoed(id: string, isVetoed: boolean, allLocationsWithVetoes: Location[]) {
  const eventIndex = events.findIndex(event => event.id === id)
  if (eventIndex !== -1) {
    events[eventIndex] = {
      ...events[eventIndex],
      allVetoed: isVetoed,
      recommendedLocations: allLocationsWithVetoes // Store locations with veto info
    }
  }
}
