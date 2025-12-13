import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { EventCardSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Skeletons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
