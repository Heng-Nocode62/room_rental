import { Outlet } from "react-router-dom";

import { useAppConfig } from "../../features/settings/context/AppConfigProvider";
import Header from "./Header";
import HorizontalHeader from "./HorizontalHeader";
import Sidebar from "./Sidebar";

export default function AppLayout() {
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
          <HorizontalHeader />

          <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </>
      ) : (
        <>
          <Sidebar />
          <div className="lg:pl-60">
            <Header />

            <main className="p-6">
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
