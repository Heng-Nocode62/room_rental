import { useLocation } from "react-router-dom";
import LanguageSwitcher from "../../../features/settings/LanguageSwitcher";
import { T } from "../../../features/translation/TranslationText";
import UserMenu from "../UserMenu";
import UserLocationSelect from "./UserLocationSelect";
import { activePageLabel, USER_APP_NAME } from "./UserNavigation";

interface Props {
  locationName?: string;
  locations?: Array<{ id: number; name: string }>;
  currentLocationId?: number | null;
  onLocationChange?: (id: number) => void;
}

/** Top bar used with the sidebar layout. */
export default function UserHeader({ locationName, locations, currentLocationId, onLocationChange }: Props) {
  const { pathname } = useLocation();
  const title = activePageLabel(pathname);
  const showLocations = !!locations?.length && currentLocationId != null && !!onLocationChange;

  return (
    <header className="sticky top-14 z-20 border-b border-slate-200 bg-white/90 backdrop-blur lg:top-0">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:h-16">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight text-slate-900 sm:text-lg">
            {title ? <T k={title} /> : USER_APP_NAME}
          </h1>
          {locationName && <p className="truncate text-xs text-slate-500">{locationName}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showLocations && (
            <UserLocationSelect locations={locations!} value={currentLocationId as number} onChange={onLocationChange!} />
          )}
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}