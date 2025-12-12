'use client'

import { formatEther } from 'viem'
import { BuyTicketButton } from './BuyTicketButton'

interface TierCardProps {
  eventAddress: `0x${string}`
  tierId: bigint
  tierName: string
  price: bigint
  maxSupply: bigint
  currentSupply: bigint
  available: bigint
  active: boolean
}

export function TierCard({
  eventAddress,
  tierId,
  tierName,
  price,
  maxSupply,
  currentSupply,
  available,
  active,
}: TierCardProps) {
  const soldPercentage = maxSupply > 0n ? Number((currentSupply * 100n) / maxSupply) : 0
  const isSoldOut = available === 0n

  return (
    <div className="card">
      <div className="space-y-4">
        {/* Tier Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{tierName}</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatEther(price)} QIE
            </p>
          </div>
          {!active && (
            <span className="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded-full">
              Inactive
            </span>
          )}
          {isSoldOut && (
            <span className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Available</span>
            <span className="font-medium">
              {available.toString()} / {maxSupply.toString()}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                soldPercentage >= 90
                  ? 'bg-red-600'
                  : soldPercentage >= 70
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentSupply.toString()} sold ({soldPercentage.toFixed(1)}%)
          </p>
        </div>

        {/* Buy Button */}
        <BuyTicketButton
          eventAddress={eventAddress}
          tierId={tierId}
          tierName={tierName}
          price={price}
          available={available}
          active={active}
        />
      </div>
    </div>
  )
}
