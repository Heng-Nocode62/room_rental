import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import UserHorizontalHeader from "./UserHorizontalHeader";
import UserSidebar from "./UserSidebar";
import { useAppConfig } from "../../../features/settings/context/AppConfigProvider";
import UserHeader from "./UserHeader";

interface Props {
  locationName?: string;
  locations?: Array<{ id: number; name: string }>;
  currentLocationId?: number | null;
  onLocationChange?: (id: number) => void;
  children?: ReactNode;
}

export default function UserLayout({ children, ...locationProps }: Props) {
  const { config } = useAppConfig();
  const isHorizontal = config.app.layout === "horizontal";

  return (
    <div
      className={`min-h-screen bg-slate-50 ${
        config.app.skin === "bordered" ? "app-skin-bordered" : ""
      } ${isHorizontal ? "app-layout-horizontal" : ""}`}
    >
      {isHorizontal ? (
        <>
          <UserHorizontalHeader {...locationProps} />
          <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </main>
        </>
      ) : (
        <>
          <UserSidebar />
          <div className="pt-14 lg:pl-60 lg:pt-0">
            <UserHeader {...locationProps} />
            <main className="p-4 sm:p-6">{children ?? <Outlet />}</main>
          </div>
        </>
      )}
    </div>
  );
}