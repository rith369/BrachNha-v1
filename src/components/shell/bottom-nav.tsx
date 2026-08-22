import { Link, useLocation } from "react-router";
import { bottomNavItems } from "@/lib/nav-items";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";

export function BottomNav() {
  const { pathname } = useLocation();
  const lang = useBrachNhaStore((s) => s.lang);

  return (
    <div className="flex shrink-0 items-center justify-around border-t border-purple/10 bg-white/90 px-2 pt-2 pb-5 backdrop-blur-sm">
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
  );
}
