import { Link, useLocation } from "react-router";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";
import { useBrachNhaStore } from "@/lib/store";
import { mainNavItems, featureNavItems, type NavItem } from "@/lib/nav-items";
import { cn } from "@/utils/cn";

function DrawerRow({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const lang = useBrachNhaStore((s) => s.lang);
  const setDrawerOpen = useBrachNhaStore((s) => s.setDrawerOpen);
  const active = item.href && pathname === item.href;
  const Icon = item.icon;

  const content = (
    <>
      <Icon className="size-5 shrink-0 text-purple" strokeWidth={2.25} />
      <span className="text-sm font-extrabold text-text">
        {item.label[lang]}
      </span>
      {!item.href && (
        <span className="ml-auto rounded-full bg-purple/8 px-2 py-0.5 text-[9px] font-extrabold text-muted">
          {lang === "en" ? "Soon" : "ឆាប់ៗ"}
        </span>
      )}
    </>
  );

  const rowClasses = cn(
    "flex items-center gap-3.5 rounded-2xl px-4 py-3 transition",
    active && "border border-purple/20 bg-linear-to-r from-pink/10 to-purple/10",
    !item.href && "cursor-default opacity-45",
    item.href && !active && "hover:bg-purple/8"
  );

  if (!item.href) {
    return <div className={rowClasses}>{content}</div>;
  }

  return (
    <Link
      to={item.href}
      onClick={() => setDrawerOpen(false)}
      className={rowClasses}
    >
      {content}
    </Link>
  );
}

export function Drawer() {
  const drawerOpen = useBrachNhaStore((s) => s.drawerOpen);
  const setDrawerOpen = useBrachNhaStore((s) => s.setDrawerOpen);
  const lang = useBrachNhaStore((s) => s.lang);

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="shrink-0 border-b border-purple/10 bg-linear-to-br from-[#f5eeff] to-[#ede0ff] px-6 pt-13 pb-5">
          <div className="bg-linear-to-r from-pink via-purple to-blue bg-clip-text text-xl font-extrabold text-transparent">
            BrachNha ✨
          </div>
          <div className="text-xs font-bold text-muted">
            {lang === "en" ? "Hero" : "វីរបុរស"}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold tracking-widest text-muted uppercase">
            {lang === "en" ? "Main" : "មេ"}
          </div>
          <div className="flex flex-col gap-1">
            {mainNavItems.map((item) => (
              <DrawerRow key={item.id} item={item} />
            ))}
          </div>

          <div className="my-2.5 h-px bg-purple/10" />

          <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold tracking-widest text-muted uppercase">
            {lang === "en" ? "Features" : "លក្ខណៈពិសេស"}
          </div>
          <div className="flex flex-col gap-1">
            {featureNavItems.map((item) => (
              <DrawerRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Pinned below the nav rather than inside the scroll area: the drawer
            scrolls once there are enough nav items, and switching language
            shouldn't require scrolling to find the control. */}
        <div className="shrink-0 border-t border-purple/10 p-3">
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}
