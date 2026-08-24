import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { useBrachNhaStore } from "@/lib/store";

/**
 * The mobile/tablet nav: the same SidebarNav the desktop Sidebar renders, in a
 * slide-over Sheet. Only the wrapper differs, so the two navs cannot drift.
 * Below lg this is reached from TopBar's hamburger; at lg and above the
 * permanent Sidebar takes over and the hamburger is hidden.
 */
export function Drawer() {
  const drawerOpen = useBrachNhaStore((s) => s.drawerOpen);
  const setDrawerOpen = useBrachNhaStore((s) => s.setDrawerOpen);

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarNav onNavigate={() => setDrawerOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
