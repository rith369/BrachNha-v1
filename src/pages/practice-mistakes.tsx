import { BottomNav } from "@/components/shell/bottom-nav";
import { MistakesView } from "@/features/practice/components/mistakes-view";

/** `/practice/mistakes`: a place, so the navigation stays. The round itself is `/run`. */
export default function PracticeMistakesPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
        <MistakesView />
      </div>
      <BottomNav />
    </div>
  );
}
