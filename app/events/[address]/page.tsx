import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TierCard } from "@/components/TierCard";
import { getEventDetails, getEventTiers } from "@/lib/events";
import Link from "next/link";

export const revalidate = 30; // Revalidate every 30 seconds

interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { address } = await params;
  const eventAddress = address as `0x${string}`;

  // Fetch event details and tiers
  const [eventDetails, tiers] = await Promise.all([
    getEventDetails(eventAddress),
    getEventTiers(eventAddress),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/events"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Events
            </Link>
          </div>

          {/* Event Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              {eventDetails.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {eventDetails.symbol}
            </p>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Event Contract:
                </span>
                <a
                  href={`https://testnet.qie.digital/address/${eventDetails.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 font-mono text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {eventDetails.address.slice(0, 10)}...
                  {eventDetails.address.slice(-8)} ↗
                </a>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Access Pass NFT:
                </span>
                <a
                  href={`https://testnet.qie.digital/address/${eventDetails.accessPassNFT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 font-mono text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {eventDetails.accessPassNFT.slice(0, 10)}...
                  {eventDetails.accessPassNFT.slice(-8)} ↗
                </a>
              </div>
            </div>
          </div>

          {/* Tiers Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Available Tickets
            </h2>

            {tiers.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No ticket tiers available for this event yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                  <TierCard
                    key={tier.tierId.toString()}
                    eventAddress={eventAddress}
                    tierId={tier.tierId}
                    tierName={tier.tierName}
                    price={tier.price}
                    maxSupply={tier.maxSupply}
                    currentSupply={tier.currentSupply}
                    available={tier.available}
                    active={tier.active}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-2">
              ℹ️ How it works
            </h3>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Connect your wallet to purchase tickets</li>
              <li>• Tickets are ERC-1155 tokens stored in your wallet</li>
              <li>• View your tickets in the "My Tickets" page</li>
              <li>• Generate a QR code from your tickets for venue entry</li>
              <li>• Resell your tickets on the marketplace if needed</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
