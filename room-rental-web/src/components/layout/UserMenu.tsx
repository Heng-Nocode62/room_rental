import { ChevronDown, LogOut } from "../ui/MaterialIcon.tsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useLogout } from "../../features/auth/hooks/useLogout";
import { usePermissions } from "../../features/auth/hooks/usePermissions";
import { useDismissable } from "./useDismissable";

export default function UserMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = usePermissions();
  const logoutMutation = useLogout();

  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useDismissable(ref, open, close);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      (user.username?.[0] ?? "").toUpperCase()
    : "";

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:pr-3"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100">
          {initials}
        </span>

        <span className="hidden text-left md:block">
          <span className="block text-sm font-medium leading-tight text-slate-900">
            {fullName}
          </span>
          <span className="block text-xs leading-tight text-slate-500">
            {user?.username}
          </span>
        </span>

        <ChevronDown
          size={14}
          className={`hidden text-slate-400 transition-transform md:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-medium text-slate-900">
              {fullName}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.username}</p>
          </div>

          <div className="my-1 h-px bg-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            My profile
          </button>
          <div className="my-1 h-px bg-slate-100" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
          >
            <LogOut size={16} />
            {logoutMutation.isPending ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
