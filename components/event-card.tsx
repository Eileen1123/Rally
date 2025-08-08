import Image from 'next/image'
import Link from 'next/link'
import { Event, currentUser } from '@/lib/data' // Import Event interface and currentUser

interface EventCardProps {
  event: Event // Pass the entire event object
}

export function EventCard({ event }: EventCardProps) {
  const { id, name, date, status, participants, userRsvpStatus, initiatorName, confirmedParticipants } = event;

  // Helper to determine if event date has passed
  const isEventDatePassed = () => {
    const eventDateObj = new Date(date);
    const now = new Date();
    eventDateObj.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return eventDateObj < now;
  };

  // Get the display status based on date and actual status
  const getDisplayStatus = () => {
    if (isEventDatePassed()) {
      return '已结束';
    }
    // If date is not passed, use the actual status or user RSVP status
    if (status === '需要你响应' && userRsvpStatus) {
      return userRsvpStatus;
    }
    return status;
  };

  // Get the badge classes based on the display status
  const getStatusBadgeClasses = (displayStatus: string) => {
    switch (displayStatus) {
      case '需要你响应':
        return 'bg-yellow-100 text-yellow-800';
      case '投票中':
        return 'bg-blue-100 text-blue-800';
      case '结果已出':
        return 'bg-green-100 text-green-800';
      case '已结束':
        return 'bg-gray-100 text-gray-800';
      case '所有选项均被否决':
        return 'bg-red-100 text-red-800';
      case '已参加':
        return 'bg-green-100 text-green-800';
      case '已待定':
        return 'bg-yellow-100 text-yellow-800';
      case '已拒绝':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentDisplayStatus = getDisplayStatus();
  const isInitiator = initiatorName === currentUser.name;

  // Determine which participant list to display for avatars
  const displayParticipants = (status === '结果已出' && confirmedParticipants && confirmedParticipants.length > 0)
    ? confirmedParticipants
    : participants;

  // Determine the text for participant count
  const totalParticipantsCount = participants.length;
  const confirmedCount = confirmedParticipants ? confirmedParticipants.length : 0;

  const participantCountText =
    (status === '结果已出' || isEventDatePassed()) && confirmedParticipants
      ? `${totalParticipantsCount} 位参与者，其中 ${confirmedCount} 位已确认参与`
      : `${totalParticipantsCount} 位参与者`;


  return (
    <Link href={`/event/${id}`} className="block">
      <div className="relative bg-white rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-xl transition-shadow">
        <h3 className="font-bold text-lg text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {date}
          {isInitiator && <span className="ml-2 text-xs text-orange-500 font-medium">由自己发起</span>}
        </p>

        <div className="flex items-center mt-4">
          <div className="flex -space-x-2 overflow-hidden">
            {displayParticipants.slice(0, 4).map((participant, index) => (
              <Image
                key={index}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                src={participant.avatar || '/placeholder.svg'}
                alt={participant.name}
                width={32}
                height={32}
              />
            ))}
            {displayParticipants.length > 4 && (
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
                {`+${displayParticipants.length - 4}`}
              </span>
            )}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {participantCountText} {/* Display the dynamic participant count text */}
          </span>
        </div>

        <span
          className={`absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(
            currentDisplayStatus
          )}`}
        >
          {currentDisplayStatus}
        </span>
      </div>
    </Link>
  )
}
