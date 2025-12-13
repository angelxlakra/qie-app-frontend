"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TicketCard } from "@/components/TicketCard";
import { TicketCardSkeleton } from "@/components/ui/Skeletons";
import { getUserTickets, type UserTicket } from "@/lib/events";

export default function MyTicketsPage() {
  const { address, isConnected } = useAccount();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const userTickets = await getUserTickets(address);
        setTickets(userTickets);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load your tickets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTickets();
  }, [address]);

  // Group tickets by event
  const ticketsByEvent = tickets.reduce((acc, ticket) => {
    const eventAddress = ticket.eventAddress;
    if (!acc[eventAddress]) {
      acc[eventAddress] = {
        eventName: ticket.eventName,
        eventAddress: eventAddress,
        tickets: [],
      };
    }
    acc[eventAddress].tickets.push(ticket);
    return acc;
  }, {} as Record<string, { eventName: string; eventAddress: string; tickets: UserTicket[] }>);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              My Tickets
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage all your event tickets
            </p>
          </div>

          {!isConnected ? (
            <div className="text-center py-16">
              <div className="card max-w-md mx-auto">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                    Connect Your Wallet
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Please connect your wallet to view your tickets
                  </p>
                </div>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="card max-w-md mx-auto bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800">
                <div className="text-red-600 dark:text-red-200 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-semibold">{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="card max-w-md mx-auto">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                  No Tickets Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You haven't purchased any tickets yet. Browse available events
                  to get started!
                </p>
                <a href="/events" className="btn-primary inline-block">
                  Browse Events
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.values(ticketsByEvent).map((eventGroup) => (
                <div key={eventGroup.eventAddress}>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {eventGroup.eventName}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventGroup.tickets.map((ticket) => (
                      <TicketCard
                        key={`${ticket.eventAddress}-${ticket.tierId}`}
                        ticket={ticket}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total tickets: {tickets.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
