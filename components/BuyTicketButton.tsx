'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useRouter } from 'next/navigation'
import EventABI from '@/abis/Event.json'
import { toast } from 'sonner'

interface BuyTicketButtonProps {
  eventAddress: `0x${string}`
  tierId: bigint
  tierName: string
  price: bigint
  available: bigint
  active: boolean
}

export function BuyTicketButton({
  eventAddress,
  tierId,
  tierName,
  price,
  available,
  active,
}: BuyTicketButtonProps) {
  const { address, isConnected } = useAccount()
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()

  const {
    data: hash,
    isPending,
    writeContract,
    error,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Toast notifications for transaction status
  useEffect(() => {
    if (isPending) {
        toast.loading('Confirming transaction in wallet...', { id: 'buy-ticket' })
    }
    if (isConfirming) {
        toast.loading('Processing transaction...', { id: 'buy-ticket' })
    }
    if (isSuccess) {
      toast.success('Tickets purchased successfully!', {
        id: 'buy-ticket',
        description: `Tx: ${hash?.slice(0, 10)}...`
      })
      // Wait a moment for the blockchain state to update
      const timer = setTimeout(() => {
        router.refresh()
      }, 2000)
      return () => clearTimeout(timer)
    }
    if (error) {
        toast.error('Transaction failed', {
            id: 'buy-ticket',
            description: error.message.split('\n')[0]
        })
    }
  }, [isPending, isConfirming, isSuccess, error, hash, router])


  const handleBuy = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const totalPrice = price * BigInt(quantity)

    writeContract({
      address: eventAddress,
      abi: EventABI,
      functionName: 'buyTickets',
      args: [tierId, BigInt(quantity)],
      value: totalPrice,
    })
  }

  const isDisabled = !active || available === 0n || isPending || isConfirming
  const canBuyMore = quantity < Number(available)

  return (
    <div className="space-y-3">
      {/* Quantity Selector */}
      {active && available > 0n && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Quantity:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={!canBuyMore}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Buy Button */}
      <button
        onClick={handleBuy}
        disabled={isDisabled || !isConnected}
        className="btn-primary w-full"
      >
        {!isConnected
          ? 'Connect Wallet'
          : isPending
          ? 'Check Wallet...'
          : isConfirming
          ? 'Processing...'
          : isSuccess
          ? 'Success! ✓'
          : !active
          ? 'Not Available'
          : available === 0n
          ? 'Sold Out'
          : `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
      </button>
    </div>
  )
}
