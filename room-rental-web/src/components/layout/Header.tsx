import { useNavigate } from "react-router-dom";

import { Button } from "../ui/Button";
import { usePermissions } from "../../features/auth/hooks/usePermissions";
import { useLogout } from "../../features/auth/hooks/useLogout";
import LanguageSwitcher from "../../features/settings/LanguageSwitcher";
import ThemeToggle from "../../features/settings/ThemeToggle";
import { useAppConfig } from "../../features/settings/context/AppConfigProvider";

/** Top bar for the vertical (sidebar) layout. The horizontal layout uses HorizontalHeader. */
export default function Header() {
  const navigate = useNavigate();
  const { user } = usePermissions();
  const logoutMutation = useLogout();
  const { config } = useAppConfig();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();

    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">{config.app.appName}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </p>

          <p className="text-xs text-slate-500">{user?.username}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/profile")}>
          My profile
        </Button>
        <ThemeToggle />
        <LanguageSwitcher />

        <Button
          variant="ghost"
          onClick={handleLogout}
          loading={logoutMutation.isPending}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
