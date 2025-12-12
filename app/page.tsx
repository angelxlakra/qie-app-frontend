import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-50">
            Blockchain-Powered Event Tickets
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Buy, sell, and redeem event tickets securely on the QIE Testnet
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Link
              href="/events"
              className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                Browse Events
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and purchase tickets for upcoming events
              </p>
            </Link>

            <Link
              href="/my-tickets"
              className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                My Tickets
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                View your tickets and generate QR codes for entry
              </p>
            </Link>

            <Link
              href="/marketplace"
              className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                Marketplace
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Buy and sell tickets on the secondary market
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
