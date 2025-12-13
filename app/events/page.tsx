import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { EventsList } from "@/components/EventsList";
import { getAllEvents } from "@/lib/events";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              Discover Events
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Browse all events on the QIE Testnet
            </p>
          </div>

          {/* Events List with Search and Pagination */}
          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎫</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                No Events Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Be the first to create an event!
              </p>
              <a href="/create-event" className="btn-primary inline-block">
                Create Event
              </a>
            </div>
          ) : (
            <EventsList events={events} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
