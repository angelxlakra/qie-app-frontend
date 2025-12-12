import Link from 'next/link'
import { formatEther } from 'viem'

interface EventCardProps {
  eventAddress: `0x${string}`
  name: string
  creator: `0x${string}`
  eventId: bigint
}

export function EventCard({ eventAddress, name, creator, eventId }: EventCardProps) {
  return (
    <Link href={`/events/${eventAddress}`} className="card block">
      <div className="space-y-4">
        {/* Event Header */}
        <div>
          <h3 className="text-xl font-semibold mb-1">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Event #{eventId.toString()}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Contract:</span>
            <p className="font-mono text-xs break-all">
              {eventAddress.slice(0, 10)}...{eventAddress.slice(-8)}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Organizer:</span>
            <p className="font-mono text-xs break-all">
              {creator.slice(0, 10)}...{creator.slice(-8)}
            </p>
          </div>
        </div>

        {/* View Button */}
        <div className="pt-2">
          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}
