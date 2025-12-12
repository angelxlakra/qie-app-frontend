'use client'

import { useEffect, useState } from 'react'
import { useQRCode } from '@/hooks/useQRCode'

interface QRCodeDisplayProps {
  eventAddress: `0x${string}`
  tierId: bigint
  tierName: string
  eventName: string
  onClose: () => void
}

export function QRCodeDisplay({
  eventAddress,
  tierId,
  tierName,
  eventName,
  onClose,
}: QRCodeDisplayProps) {
  const { qrCodeUrl, deadline, isGenerating, error, generateQRCode, clearQRCode } =
    useQRCode(eventAddress, tierId)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Calculate time remaining
  useEffect(() => {
    if (!deadline) return

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = Number(deadline) - now

      if (remaining <= 0) {
        setTimeRemaining(0)
      } else {
        setTimeRemaining(remaining)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isExpired = timeRemaining !== null && timeRemaining <= 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{eventName}</h2>
            <p className="text-sm text-gray-600">{tierName}</p>
          </div>
          <button
            onClick={() => {
              clearQRCode()
              onClose()
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!qrCodeUrl ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-6">
              Generate a QR code to redeem your ticket at the venue. The QR code
              will be valid for 5 minutes.
            </p>
            <button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="btn-primary w-full"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate QR Code'
              )}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img
                src={qrCodeUrl}
                alt="Ticket QR Code"
                className="w-full h-auto"
              />
            </div>

            {timeRemaining !== null && (
              <div className="mb-4">
                {isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-semibold mb-3">
                      QR Code Expired
                    </p>
                    <button
                      onClick={() => {
                        clearQRCode()
                        generateQRCode()
                      }}
                      className="btn-primary w-full"
                    >
                      Generate New QR Code
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Time remaining:</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatTime(timeRemaining)}
                    </p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${(timeRemaining / 300) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>Present this QR code to the venue staff for redemption</p>
              <p className="font-medium">Do not share this QR code with anyone</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
