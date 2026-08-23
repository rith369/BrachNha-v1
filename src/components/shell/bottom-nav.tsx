import { Link, useLocation } from "react-router";
import { bottomNavItems } from "@/lib/nav-items";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";

export function BottomNav() {
  const { pathname } = useLocation();
  const lang = useBrachNhaStore((s) => s.lang);
  const focusMode = useFocusMode();

  // Mid-lesson or mid-question the screen is the exercise and nothing else.
  // Checked here rather than in the pages so all 6 that render this inherit it,
  // the same reasoning as the lg:hidden below.
  if (focusMode) return null;

  return (
    // The bar itself spans the full app width so its top border and blur read
    // as one edge; the tabs inside stay phone-width and centred. Letting
    // justify-around spread five tabs across a 1024px laptop would push them
    // into the far corners, which looks accidental rather than designed.
    // lg:hidden lives here rather than on each of the 9 pages that render this,
    // so the desktop Sidebar and the phone tab bar are never both on screen.
    <div className="shrink-0 border-t border-purple/10 bg-surface/90 backdrop-blur-sm lg:hidden">
      <div className="mx-auto flex w-full max-w-lg items-center justify-around px-2 pt-2 pb-5">
        {bottomNavItems.map((item) => {
          const active = item.href && pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.href ?? "#"}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition",
                active && "bg-purple/10"
              )}
            >
              <Icon
                className={cn("size-5", active ? "text-purple" : "text-muted")}
                strokeWidth={2.25}
              />
              <span
                className={cn(
                  "text-[10px] font-extrabold",
                  active ? "text-purple" : "text-muted"
                )}
              >
                {(item.shortLabel ?? item.label)[lang]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
