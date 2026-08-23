import { Link, useLocation } from "react-router";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { useBrachNhaStore } from "@/lib/store";
import { mainNavItems, featureNavItems, type NavItem } from "@/lib/nav-items";
import { cn } from "@/utils/cn";

/**
 * The nav list itself, with no shell around it. Rendered in two places and it
 * must stay that way — the mobile Drawer wraps it in a Sheet, the desktop
 * Sidebar mounts it as a permanent column. Both read the same
 * mainNavItems/featureNavItems config, so a new route appears in both navs at
 * once and they can never drift apart.
 */

function NavRow({
  item,
  onNavigate,
}: {
  item: NavItem;
  /** Drawer passes a close handler; the sidebar is permanent and passes none. */
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const lang = useBrachNhaStore((s) => s.lang);
  const active = item.href && pathname === item.href;
  const Icon = item.icon;

  const content = (
    <>
      <Icon className="size-5 shrink-0 text-purple" strokeWidth={2.25} />
      <span className="min-w-0 truncate text-sm font-extrabold text-text">
        {item.label[lang]}
      </span>
      {!item.href && (
        <span className="ml-auto shrink-0 rounded-full bg-purple/8 px-2 py-0.5 text-[9px] font-extrabold text-muted">
          {lang === "en" ? "Soon" : "ឆាប់ៗ"}
        </span>
      )}
    </>
  );

  const rowClasses = cn(
    // py-3 keeps a ~44px touch target in the mobile drawer; the desktop sidebar
    // is pointer-driven and has 12 rows plus two switchers to fit in one column,
    // so it tightens slightly rather than scrolling on a 768px-tall laptop.
    "flex items-center gap-3 rounded-2xl px-3.5 py-3 transition lg:py-2.5",
    active && "border border-purple/20 bg-linear-to-r from-pink/10 to-purple/10",
    !item.href && "cursor-default opacity-45",
    item.href && !active && "hover:bg-purple/8"
  );

  if (!item.href) {
    return <div className={rowClasses}>{content}</div>;
  }

  return (
    <Link to={item.href} onClick={onNavigate} className={rowClasses}>
      {content}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const lang = useBrachNhaStore((s) => s.lang);

  return (
    <>
      <div className="shrink-0 border-b border-purple/10 bg-[image:var(--drawer-header)] px-6 pt-13 pb-5 lg:pt-6">
        <div className="bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
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
            <NavRow key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="my-2.5 h-px bg-purple/10" />

        <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold tracking-widest text-muted uppercase">
          {lang === "en" ? "Features" : "លក្ខណៈពិសេស"}
        </div>
        <div className="flex flex-col gap-1">
          {featureNavItems.map((item) => (
            <NavRow key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      {/* Pinned below the nav rather than inside the scroll area: the list
          scrolls once there are enough nav items, and switching language or
          theme shouldn't require scrolling to find the control. */}
      <div className="shrink-0 space-y-3 border-t border-purple/10 p-3">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </>
  );
}

/**
 * Desktop-only permanent nav. Hidden below lg, where BottomNav + the hamburger
 * Drawer own navigation instead — the two are never on screen together.
 */
export function Sidebar() {
  return (
    // w-64 rather than something narrower because the labels have to survive in
    // BOTH languages: "Document Library" and Khmer names like
    // "វិញ្ញាសារត្រៀមប្រឡង" are the long cases, and anything under ~240px
    // ellipsises them. Even at w-64 a 1024px laptop still leaves ~344px columns,
    // comfortably above the 288px a 320px phone already gives these cards.
    <aside className="hidden w-64 shrink-0 flex-col border-r border-purple/10 bg-surface lg:flex xl:w-72">
      <SidebarNav />
    </aside>
  );
}
