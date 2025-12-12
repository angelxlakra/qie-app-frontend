'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatEther } from 'viem'
import type { UserTicket } from '@/lib/events'
import { QRCodeDisplay } from './QRCodeDisplay'

interface TicketCardProps {
  ticket: UserTicket
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [showQRCode, setShowQRCode] = useState(false)

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {ticket.eventName}
            </h3>
            <p className="text-sm text-gray-600">{ticket.tierName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {ticket.balance.toString()}
            </p>
            <p className="text-xs text-gray-500">
              {ticket.balance === 1n ? 'ticket' : 'tickets'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Original Price</span>
            <span className="font-medium text-gray-900">
              {formatEther(ticket.price)} QIE
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/events/${ticket.eventAddress}`}
            className="btn-secondary flex-1 text-center"
          >
            View Event
          </Link>
          <button
            className="btn-primary flex-1"
            onClick={() => setShowQRCode(true)}
          >
            Generate QR
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Contract: {ticket.eventAddress.slice(0, 6)}...
          {ticket.eventAddress.slice(-4)}
        </p>
      </div>

      {showQRCode && (
        <QRCodeDisplay
          eventAddress={ticket.eventAddress}
          tierId={ticket.tierId}
          tierName={ticket.tierName}
          eventName={ticket.eventName}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </>
  )
}
