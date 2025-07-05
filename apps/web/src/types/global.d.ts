// Global type declarations to fix TypeScript compatibility issues

declare module "lucide-react" {
  import { FC, SVGProps } from "react";
  
  interface LucideProps extends SVGProps<SVGSVGElement> {
    className?: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  export const Lock: FC<LucideProps>;
  export const Send: FC<LucideProps>;
  export const Search: FC<LucideProps>;
  export const MessageCircle: FC<LucideProps>;
  export const User: FC<LucideProps>;
  export const CreditCard: FC<LucideProps>;
  export const Folder: FC<LucideProps>;
  export const History: FC<LucideProps>;
  export const ChevronDown: FC<LucideProps>;
  export const Settings: FC<LucideProps>;
  export const LogOut: FC<LucideProps>;
  export const X: FC<LucideProps>;
  export const ChevronRight: FC<LucideProps>;
  export const Check: FC<LucideProps>;
  export const Circle: FC<LucideProps>;
  export const PanelLeft: FC<LucideProps>;
  export const AlertTriangle: FC<LucideProps>;
  export const Info: FC<LucideProps>;
  export const CheckCircle: FC<LucideProps>;
  export const XCircle: FC<LucideProps>;
  export const Bell: FC<LucideProps>;
  export const Home: FC<LucideProps>;
  export const Users: FC<LucideProps>;
  export const Calendar: FC<LucideProps>;
  export const Mail: FC<LucideProps>;
  export const FileText: FC<LucideProps>;
  export const HelpCircle: FC<LucideProps>;
  export const MoreHorizontal: FC<LucideProps>;
  export const Edit: FC<LucideProps>;
  export const Trash: FC<LucideProps>;
  export const Download: FC<LucideProps>;
  export const Upload: FC<LucideProps>;
  export const Share: FC<LucideProps>;
  export const Copy: FC<LucideProps>;
  export const ExternalLink: FC<LucideProps>;
  export const Eye: FC<LucideProps>;
  export const EyeOff: FC<LucideProps>;
  export const Play: FC<LucideProps>;
  export const Pause: FC<LucideProps>;
  export const Stop: FC<LucideProps>;
  export const SkipForward: FC<LucideProps>;
  export const SkipBack: FC<LucideProps>;
  export const Volume2: FC<LucideProps>;
  export const VolumeX: FC<LucideProps>;
  export const Mic: FC<LucideProps>;
  export const MicOff: FC<LucideProps>;
  export const Video: FC<LucideProps>;
  export const VideoOff: FC<LucideProps>;
  export const Phone: FC<LucideProps>;
  export const PhoneOff: FC<LucideProps>;
  export const Monitor: FC<LucideProps>;
  export const Smartphone: FC<LucideProps>;
  export const Tablet: FC<LucideProps>;
  export const Laptop: FC<LucideProps>;
  export const Tv: FC<LucideProps>;
  export const Headphones: FC<LucideProps>;
  export const Speaker: FC<LucideProps>;
  export const Wifi: FC<LucideProps>;
  export const WifiOff: FC<LucideProps>;
  export const Signal: FC<LucideProps>;
  export const SignalMedium: FC<LucideProps>;
  export const SignalLow: FC<LucideProps>;
  export const SignalZero: FC<LucideProps>;
  export const Battery: FC<LucideProps>;
  export const BatteryLow: FC<LucideProps>;
  export const Power: FC<LucideProps>;
  export const PowerOff: FC<LucideProps>;
  export const Refresh: FC<LucideProps>;
  export const RefreshCw: FC<LucideProps>;
  export const RotateCcw: FC<LucideProps>;
  export const RotateCw: FC<LucideProps>;
  export const Maximize: FC<LucideProps>;
  export const Minimize: FC<LucideProps>;
  export const Minus: FC<LucideProps>;
  export const Plus: FC<LucideProps>;
  export const Star: FC<LucideProps>;
  export const Heart: FC<LucideProps>;
  export const ThumbsUp: FC<LucideProps>;
  export const ThumbsDown: FC<LucideProps>;
  export const Bookmark: FC<LucideProps>;
  export const Flag: FC<LucideProps>;
  export const Tag: FC<LucideProps>;
  export const Hash: FC<LucideProps>;
  export const AtSign: FC<LucideProps>;
  export const Globe: FC<LucideProps>;
  export const Map: FC<LucideProps>;
  export const MapPin: FC<LucideProps>;
  export const Navigation: FC<LucideProps>;
  export const Compass: FC<LucideProps>;
  export const Target: FC<LucideProps>;
  export const Crosshair: FC<LucideProps>;
  export const Filter: FC<LucideProps>;
  export const SlidersHorizontal: FC<LucideProps>;
  export const SlidersVertical: FC<LucideProps>;
  export const BarChart: FC<LucideProps>;
  export const LineChart: FC<LucideProps>;
  export const PieChart: FC<LucideProps>;
  export const TrendingUp: FC<LucideProps>;
  export const TrendingDown: FC<LucideProps>;
  export const Activity: FC<LucideProps>;
  export const Zap: FC<LucideProps>;
  export const Award: FC<LucideProps>;
  export const Gift: FC<LucideProps>;
  export const Package: FC<LucideProps>;
  export const ShoppingCart: FC<LucideProps>;
  export const ShoppingBag: FC<LucideProps>;
  export const DollarSign: FC<LucideProps>;
  export const Percent: FC<LucideProps>;
  export const Calculator: FC<LucideProps>;
  export const Clock: FC<LucideProps>;
  export const Timer: FC<LucideProps>;
  export const Stopwatch: FC<LucideProps>;
  export const Alarm: FC<LucideProps>;
  export const Sun: FC<LucideProps>;
  export const Moon: FC<LucideProps>;
  export const Cloud: FC<LucideProps>;
  export const CloudRain: FC<LucideProps>;
  export const CloudSnow: FC<LucideProps>;
  export const Umbrella: FC<LucideProps>;
  export const Thermometer: FC<LucideProps>;
  export const Wind: FC<LucideProps>;
  export const Droplets: FC<LucideProps>;
  export const Flame: FC<LucideProps>;
  export const Lightbulb: FC<LucideProps>;
  export const Key: FC<LucideProps>;
  export const Shield: FC<LucideProps>;
  export const ShieldCheck: FC<LucideProps>;
  export const ShieldAlert: FC<LucideProps>;
  export const ShieldX: FC<LucideProps>;
  export const Database: FC<LucideProps>;
  export const Server: FC<LucideProps>;
  export const HardDrive: FC<LucideProps>;
  export const Cpu: FC<LucideProps>;
  export const MemoryStick: FC<LucideProps>;
  export const Printer: FC<LucideProps>;
  export const Scanner: FC<LucideProps>;
  export const Keyboard: FC<LucideProps>;
  export const Mouse: FC<LucideProps>;
  export const Gamepad: FC<LucideProps>;
  export const Joystick: FC<LucideProps>;
  export const Camera: FC<LucideProps>;
  export const Image: FC<LucideProps>;
  export const Film: FC<LucideProps>;
  export const Music: FC<LucideProps>;
  export const Radio: FC<LucideProps>;
  export const Disc: FC<LucideProps>;
  export const Cassette: FC<LucideProps>;
  export const Book: FC<LucideProps>;
  export const BookOpen: FC<LucideProps>;
  export const Newspaper: FC<LucideProps>;
  export const Pencil: FC<LucideProps>;
  export const Pen: FC<LucideProps>;
  export const PenTool: FC<LucideProps>;
  export const Highlighter: FC<LucideProps>;
  export const Eraser: FC<LucideProps>;
  export const Ruler: FC<LucideProps>;
  export const Scissors: FC<LucideProps>;
  export const Paperclip: FC<LucideProps>;
  export const Link: FC<LucideProps>;
  export const Unlink: FC<LucideProps>;
  export const ChevronUp: FC<LucideProps>;
  export const ChevronLeft: FC<LucideProps>;
  export const ChevronFirst: FC<LucideProps>;
  export const ChevronLast: FC<LucideProps>;
  export const ChevronsUp: FC<LucideProps>;
  export const ChevronsDown: FC<LucideProps>;
  export const ChevronsLeft: FC<LucideProps>;
  export const ChevronsRight: FC<LucideProps>;
  export const ArrowUp: FC<LucideProps>;
  export const ArrowDown: FC<LucideProps>;
  export const ArrowLeft: FC<LucideProps>;
  export const ArrowRight: FC<LucideProps>;
  export const ArrowUpRight: FC<LucideProps>;
  export const ArrowUpLeft: FC<LucideProps>;
  export const ArrowDownRight: FC<LucideProps>;
  export const ArrowDownLeft: FC<LucideProps>;
  export const Move: FC<LucideProps>;
  export const MoveHorizontal: FC<LucideProps>;
  export const MoveVertical: FC<LucideProps>;
  export const MoveDiagonal: FC<LucideProps>;
  export const Move3d: FC<LucideProps>;
}

declare module "@radix-ui/react-avatar" {
  import { ComponentProps, ReactNode } from "react";

  interface AvatarProps extends ComponentProps<"span"> {
    className?: string;
    children?: ReactNode;
  }

  interface AvatarImageProps extends ComponentProps<"img"> {
    className?: string;
    onLoadingStatusChange?: (status: "idle" | "loading" | "loaded" | "error") => void;
  }

  interface AvatarFallbackProps extends ComponentProps<"span"> {
    className?: string;
    delayMs?: number;
    children?: ReactNode;
  }

  export const Root: React.ForwardRefExoticComponent<AvatarProps>;
  export const Image: React.ForwardRefExoticComponent<AvatarImageProps>;
  export const Fallback: React.ForwardRefExoticComponent<AvatarFallbackProps>;
}

declare module "@radix-ui/react-dialog" {
  import { ComponentProps, ReactNode } from "react";

  interface DialogOverlayProps extends ComponentProps<"div"> {
    className?: string;
    forceMount?: true;
  }

  interface DialogContentProps extends ComponentProps<"div"> {
    className?: string;
    children?: ReactNode;
    forceMount?: true;
    onOpenAutoFocus?: any;
    onCloseAutoFocus?: any;
  }

  interface DialogCloseProps extends ComponentProps<"button"> {
    className?: string;
    children?: ReactNode;
  }

  interface DialogTitleProps extends ComponentProps<"h2"> {
    className?: string;
  }

  interface DialogDescriptionProps extends ComponentProps<"p"> {
    className?: string;
  }

  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Portal: React.FC<any>;
  export const Overlay: React.ForwardRefExoticComponent<DialogOverlayProps>;
  export const Content: React.ForwardRefExoticComponent<DialogContentProps>;
  export const Close: React.ForwardRefExoticComponent<DialogCloseProps>;
  export const Title: React.ForwardRefExoticComponent<DialogTitleProps>;
  export const Description: React.ForwardRefExoticComponent<DialogDescriptionProps>;
}

declare module "@radix-ui/react-dropdown-menu" {
  import { ComponentProps, ReactNode } from "react";

  interface DropdownMenuSubTriggerProps extends ComponentProps<"div"> {
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
    textValue?: string;
  }

  interface DropdownMenuSubContentProps extends ComponentProps<"div"> {
    className?: string;
    forceMount?: true;
    loop?: any;
    onEscapeKeyDown?: any;
    onPointerDownOutside?: any;
    onFocusOutside?: any;
    onInteractOutside?: any;
  }

  interface DropdownMenuContentProps extends ComponentProps<"div"> {
    className?: string;
    sideOffset?: number;
    forceMount?: true;
    loop?: any;
    onCloseAutoFocus?: any;
    onEscapeKeyDown?: any;
    onPointerDownOutside?: any;
    onFocusOutside?: any;
    onInteractOutside?: any;
  }

  interface DropdownMenuItemProps extends ComponentProps<"div"> {
    className?: string;
    onSelect?: (event: Event) => void;
    disabled?: boolean;
    textValue?: string;
  }

  interface DropdownMenuCheckboxItemProps extends ComponentProps<"div"> {
    className?: string;
    children?: ReactNode;
    onSelect?: (event: Event) => void;
    disabled?: boolean;
    textValue?: string;
    onCheckedChange?: (checked: boolean) => void;
    checked?: boolean | "indeterminate";
  }

  interface DropdownMenuRadioItemProps extends ComponentProps<"div"> {
    className?: string;
    children?: ReactNode;
    onSelect?: (event: Event) => void;
    disabled?: boolean;
    value: string;
    textValue?: string;
  }

  interface DropdownMenuLabelProps extends ComponentProps<"div"> {
    className?: string;
  }

  interface DropdownMenuSeparatorProps extends ComponentProps<"div"> {
    className?: string;
  }

  interface DropdownMenuItemIndicatorProps extends ComponentProps<"span"> {
    children?: ReactNode;
  }

  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Portal: React.FC<any>;
  export const Sub: React.FC<any>;
  export const SubTrigger: React.ForwardRefExoticComponent<DropdownMenuSubTriggerProps>;
  export const SubContent: React.ForwardRefExoticComponent<DropdownMenuSubContentProps>;
  export const Content: React.ForwardRefExoticComponent<DropdownMenuContentProps>;
  export const Item: React.ForwardRefExoticComponent<DropdownMenuItemProps>;
  export const CheckboxItem: React.ForwardRefExoticComponent<DropdownMenuCheckboxItemProps>;
  export const RadioGroup: React.FC<any>;
  export const RadioItem: React.ForwardRefExoticComponent<DropdownMenuRadioItemProps>;
  export const ItemIndicator: React.ForwardRefExoticComponent<DropdownMenuItemIndicatorProps>;
  export const Label: React.ForwardRefExoticComponent<DropdownMenuLabelProps>;
  export const Separator: React.ForwardRefExoticComponent<DropdownMenuSeparatorProps>;
}

declare module "@radix-ui/react-label" {
  import { ComponentProps } from "react";

  interface LabelProps extends ComponentProps<"label"> {
    className?: string;
  }

  export const Root: React.ForwardRefExoticComponent<LabelProps>;
}

declare module "@radix-ui/react-progress" {
  import { ComponentProps, ReactNode } from "react";

  interface ProgressProps extends ComponentProps<"div"> {
    className?: string;
    children?: ReactNode;
    max?: number;
    getValueLabel?: (value: number, max: number) => string;
  }

  interface ProgressIndicatorProps extends ComponentProps<"div"> {
    className?: string;
  }

  export const Root: React.ForwardRefExoticComponent<ProgressProps>;
  export const Indicator: React.ForwardRefExoticComponent<ProgressIndicatorProps>;
}

declare module "@radix-ui/react-separator" {
  import { ComponentProps } from "react";

  interface SeparatorProps extends ComponentProps<"div"> {
    className?: string;
    decorative?: boolean;
    orientation?: "horizontal" | "vertical";
  }

  export const Root: React.ForwardRefExoticComponent<SeparatorProps>;
}

declare module "@radix-ui/react-tabs" {
  import { ComponentProps } from "react";

  interface TabsListProps extends ComponentProps<"div"> {
    className?: string;
    loop?: any;
  }

  interface TabsTriggerProps extends ComponentProps<"button"> {
    className?: string;
    value: string;
  }

  interface TabsContentProps extends ComponentProps<"div"> {
    className?: string;
    value: string;
    forceMount?: true;
  }

  export const Root: React.FC<any>;
  export const List: React.ForwardRefExoticComponent<TabsListProps>;
  export const Trigger: React.ForwardRefExoticComponent<TabsTriggerProps>;
  export const Content: React.ForwardRefExoticComponent<TabsContentProps>;
}

declare module "@radix-ui/react-tooltip" {
  import { ComponentProps } from "react";

  interface TooltipContentProps extends ComponentProps<"div"> {
    className?: string;
    sideOffset?: number;
    "aria-label"?: string;
    forceMount?: true;
    onEscapeKeyDown?: any;
    onPointerDownOutside?: any;
  }

  interface TooltipTriggerProps extends ComponentProps<"button"> {
    asChild?: boolean;
    children?: React.ReactNode;
  }

  export const Provider: React.FC<any>;
  export const Root: React.FC<any>;
  export const Trigger: React.ForwardRefExoticComponent<TooltipTriggerProps>;
  export const Portal: React.FC<any>;
  export const Content: React.ForwardRefExoticComponent<TooltipContentProps>;
}

declare module "@radix-ui/react-slot" {
  import { ComponentProps, ReactNode } from "react";

  interface SlotProps extends ComponentProps<"div"> {
    children?: ReactNode;
  }

  export const Slot: React.ForwardRefExoticComponent<SlotProps>;
}

declare module "sonner" {
  import { ComponentProps } from "react";

  interface ToasterProps extends ComponentProps<"div"> {
    theme?: "light" | "dark" | "system";
    position?: string;
    expand?: boolean;
    richColors?: boolean;
    closeButton?: boolean;
  }

  export const Toaster: React.ForwardRefExoticComponent<ToasterProps>;
}

// Fix for specific SheetContentProps type
interface SheetContentProps {
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children?: React.ReactNode;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Add any missing intrinsic elements here if needed
    }
  }
} 