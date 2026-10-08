import type { HTMLAttributes } from "react";

type IconProps = HTMLAttributes<HTMLSpanElement> & { size?: number | string; strokeWidth?: number };
export function createIcon(name: string) {
  return function MaterialIcon({ size = 20, className = "", style, ...props }: IconProps) {
    return <span aria-hidden="true" className={`material-symbols-rounded inline-flex select-none items-center justify-center leading-none ${className}`} style={{ fontSize: size, ...style }} {...props}>{name}</span>;
  };
}
export function Edit({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size }}
    >
      edit
    </span>
  );
}
export const Ban = createIcon("block");
export const Calendar = createIcon("calendar_month");
export const CalendarCheck = createIcon("event_available");
export const CalendarClock = createIcon("calendar_clock");
export const CalendarDays = createIcon("calendar_month");
export const CheckCircle2 = createIcon("check_circle");
export const ChevronDown = createIcon("keyboard_arrow_down");
export const ChevronLeft = createIcon("chevron_left");
export const ChevronRight = createIcon("chevron_right");
export const CircleDollarSign = createIcon("monetization_on");
export const ClipboardList = createIcon("assignment");
export const Clock = createIcon("schedule");
export const Clock3 = createIcon("schedule");
export const CreditCard = createIcon("credit_card");
export const DollarSign = createIcon("attach_money");
export const DoorOpen = createIcon("meeting_room");
export const Edit3 = createIcon("edit");
export const ExternalLink = createIcon("open_in_new");
export const Eye = createIcon("visibility");
export const Languages = createIcon("translate");
export const Lock = createIcon("lock");
export const Unlock = createIcon("lock_open");
export const UserX = createIcon("person_off");
export const LayoutDashboard = createIcon("dashboard");
export const LogIn = createIcon("login");
export const LogOut = createIcon("logout");
export const MapPin = createIcon("location_on");
export const Menu = createIcon("menu");
export const Minus = createIcon("remove");
export const MoreHorizontal = createIcon("more_horiz");
export const PackagePlus = createIcon("add_box");
export const Plus = createIcon("add");
export const Power = createIcon("power_settings_new");
export const RefreshCw = createIcon("refresh");
export const RotateCcw = createIcon("restart_alt");
export const ScrollText = createIcon("article");
export const Settings2 = createIcon("settings");
export const ShieldCheck = createIcon("verified_user");
export const SlidersHorizontal = createIcon("tune");
export const Sparkles = createIcon("auto_awesome");
export const Tag = createIcon("sell");
export const Tags = createIcon("sell");
export const Trash2 = createIcon("delete");
export const Users = createIcon("group");
export const X = createIcon("close");
export const XCircle = createIcon("cancel");
