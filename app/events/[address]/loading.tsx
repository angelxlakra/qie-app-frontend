import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { EventDetailsSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <EventDetailsSkeleton />
        </div>
      </main>

      <Footer />
    </div>
  );
}
