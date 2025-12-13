import { useState } from 'react'
import { useAccount, useSignTypedData, useReadContract } from 'wagmi'
import QRCode from 'qrcode'
import EventABI from '@/abis/Event.json'
import { qieTestnet } from '@/config/chains'

interface QRCodeData {
  e: string // eventAddress
  h: string // ticketHolder
  t: string // tierId
  d: string // deadline
  s: string // signature
}

const REDEMPTION_TYPES = {
  RedeemTicket: [
    { name: 'ticketHolder', type: 'address' },
    { name: 'tierId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const

export function useQRCode(eventAddress: `0x${string}`, tierId: bigint) {
  const { address } = useAccount()
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<bigint | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch nonce from contract
  const { data: nonce, refetch: refetchNonce } = useReadContract({
    address: eventAddress,
    abi: EventABI,
    functionName: 'nonces',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { signTypedDataAsync } = useSignTypedData()

  const generateQRCode = async () => {
    if (!address || nonce === undefined) {
      setError('Please connect your wallet')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      // Refetch nonce to ensure it's fresh
      const { data: freshNonce } = await refetchNonce()
      if (freshNonce === undefined) {
        throw new Error('Failed to fetch nonce')
      }

      // Set deadline to 5 minutes from now
      const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + 300)
      setDeadline(deadlineTimestamp)

      // Sign the typed data
      const signature = await signTypedDataAsync({
        domain: {
          name: 'EventTicket',
          version: '1',
          chainId: qieTestnet.id,
          verifyingContract: eventAddress,
        },
        types: REDEMPTION_TYPES,
        primaryType: 'RedeemTicket',
        message: {
          ticketHolder: address,
          tierId: tierId,
          nonce: freshNonce as bigint,
          deadline: deadlineTimestamp,
        },
      })

      // Create QR code data
      const qrData: QRCodeData = {
        e: eventAddress,
        h: address,
        t: tierId.toString(),
        d: deadlineTimestamp.toString(),
        s: signature,
      }

      // Generate QR code as data URL
      const qrString = JSON.stringify(qrData)
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      setQrCodeUrl(dataUrl)
    } catch (err: any) {
      console.error('Error generating QR code:', err)
      setError(err.message || 'Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  const clearQRCode = () => {
    setQrCodeUrl(null)
    setDeadline(null)
    setError(null)
  }

  return {
    qrCodeUrl,
    deadline,
    isGenerating,
    error,
    generateQRCode,
    clearQRCode,
  }
}
