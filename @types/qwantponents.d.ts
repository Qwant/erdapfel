// @TODO: @qwant/qwant-ponents need his own typings in Phoenix
declare module '@qwant/qwant-ponents' {
  // Hooks
  export const useLockBodyScroll: (enabled: boolean, ref: HTMLElement | null) => void;
  export const usePushAlert: () => (key: string) => void;

  // Components
  export const Head: React.FunctionComponent;
  export const HeadExtractor: React.FunctionComponent;
  export const Price: React.FunctionComponent;
  export const Box: React.FunctionComponent;
  export const Flex: React.FunctionComponent<{
    className?: string;
    alignCenter?: boolean;
    as?: string | object | React.Component;
    center?: boolean;
    between?: boolean;
    type?: string;
    onClick?: () => void;
    href?: string;
    rel?: string;
    target?: string;
    variant?: string;
    style?: React.CSSProperties;
    mt?: string;
    py?: string;
    px?: string;
  }>;
  export const Stack: React.FunctionComponent<{
    gap?: string;
    py?: string;
    px?: string;
    alignCenter?: boolean;
  }>;
  export const Alert: React.FunctionComponent;
  export const AlertsProvider: React.FunctionComponent;
  export const Avatar: React.FunctionComponent;
  export const Button: React.FunctionComponent;
  export const CardButton: React.FunctionComponent;
  export const Card: React.FunctionComponent;
  export const CardFooter: React.FunctionComponent;
  export const Carousel: React.FunctionComponent;
  export const Collapse: React.FunctionComponent;
  export const Drawer: React.FunctionComponent;
  export const Ghost: React.FunctionComponent;
  export const Image: React.FunctionComponent;
  export const VideoImage: React.FunctionComponent;
  export const List: React.FunctionComponent;
  export const ListItem: React.FunctionComponent;
  export const ListItemSeparator: React.FunctionComponent;
  export const Loader: React.FunctionComponent;
  export const Modal: React.FunctionComponent;
  export const MosaicExpand: React.FunctionComponent;
  export const Notification: React.FunctionComponent;
  export const QwantLogo: React.FunctionComponent;
  export const Ripple: React.FunctionComponent;
  export const StarRating: React.FunctionComponent;
  export const Tab: React.FunctionComponent;
  export const Tabs: React.FunctionComponent;
  export const Tooltip: React.FunctionComponent;
  export const AutocompleteField: React.FunctionComponent;
  export const Checkbox: React.FunctionComponent;
  export const ColorCheckbox: React.FunctionComponent;
  export const ColorCheckboxMore: React.FunctionComponent;
  export const DatePicker: React.FunctionComponent;
  export const Field: React.FunctionComponent;
  export const Filter: React.FunctionComponent;
  export const Radio: React.FunctionComponent;
  export const Switch: React.FunctionComponent;
  export const Heading: React.FunctionComponent;
  export const Paragraph: React.FunctionComponent;
  export const Text: React.FunctionComponent<{
    center?: boolean;
    bold?: boolean;
    typo?:
      | 'heading-0'
      | 'heading-0-1'
      | 'heading-0-2'
      | 'heading-1'
      | 'heading-2'
      | 'heading-3'
      | 'heading-4'
      | 'heading-5'
      | 'heading-6'
      | 'body-1'
      | 'body-2'
      | 'caption-1'
      | 'caption-2';
    html?: string;
    raw?: boolean;
  }>;
  export const AnimatePresence: React.FunctionComponent;
  export const Slide: React.FunctionComponent;
  export const DateHelpers: React.FunctionComponent;
  export const IconDoubleChevronDown: React.FunctionComponent;
  export const IconMinus: React.FunctionComponent;
  export const IconPlayCircle: React.FunctionComponent;
  export const IconPlus: React.FunctionComponent;
  export const IconShoppingBadEmpty: React.FunctionComponent;
  export const IconSort: React.FunctionComponent;
  export const IconTripAdvisor: React.FunctionComponent;
  export const AiOutlineExclamationCircle: React.FunctionComponent;
  export const IconAppleFill: React.FunctionComponent;
  export const IconApps: React.FunctionComponent<{
    className?: string;
  }>;
  export const IconArrowDown: React.FunctionComponent;
  export const IconArrowDownSLine: React.FunctionComponent;
  export const IconArrowDropDownLine: React.FunctionComponent;
  export const IconArrowLeftDownLine: React.FunctionComponent;
  export const IconArrowLeftLine: React.FunctionComponent<{ size?: number }>;
  export const IconArrowLeftRight: React.FunctionComponent;
  export const IconArrowLeftRightFill: React.FunctionComponent;
  export const IconArrowLeftRightLine: React.FunctionComponent;
  export const IconArrowLeftSLine: React.FunctionComponent;
  export const IconArrowLeftUpLine: React.FunctionComponent;
  export const IconArrowRightLine: React.FunctionComponent;
  export const IconArrowRightSLine: React.FunctionComponent;
  export const IconArrowUpSLine: React.FunctionComponent;
  export const IconBell: React.FunctionComponent;
  export const IconBuilding: React.FunctionComponent;
  export const IconCalendar: React.FunctionComponent;
  export const IconCamera: React.FunctionComponent;
  export const IconCheck: React.FunctionComponent;
  export const IconCheckCircle: React.FunctionComponent;
  export const IconCheckCircleFill: React.FunctionComponent;
  export const IconClock: React.FunctionComponent;
  export const IconClose: React.FunctionComponent;
  export const IconCloseCircle: React.FunctionComponent;
  export const IconCloseCircleFill: React.FunctionComponent;
  export const IconCopy: React.FunctionComponent;
  export const IconDirection: React.FunctionComponent;
  export const IconEarth: React.FunctionComponent<{ size?: number; fill?: string }>;
  export const IconEmpty: React.FunctionComponent;
  export const IconEmptyFill: React.FunctionComponent;
  export const IconErrorWarningLine: React.FunctionComponent;
  export const IconExternalLink: React.FunctionComponent<{ style?: React.CSSProperties }>;
  export const IconEye: React.FunctionComponent;
  export const IconEyeClose: React.FunctionComponent;
  export const IconEyeClosed: React.FunctionComponent;
  export const IconFileList: React.FunctionComponent;
  export const IconFileText: React.FunctionComponent;
  export const IconFilter: React.FunctionComponent;
  export const IconFlag: React.FunctionComponent;
  export const IconFlagFill: React.FunctionComponent;
  export const IconFullScreen: React.FunctionComponent;
  export const IconGlobe: React.FunctionComponent;
  export const IconGlobeStand: React.FunctionComponent;
  export const IconHeart: React.FunctionComponent;
  export const IconHearts: React.FunctionComponent;
  export const IconHome: React.FunctionComponent;
  export const IconInformation: React.FunctionComponent;
  export const IconLight: React.FunctionComponent;
  export const IconLock: React.FunctionComponent;
  export const IconLogoutCircle: React.FunctionComponent;
  export const IconMail: React.FunctionComponent<{ size?: number; fill?: string }>;
  export const IconMailSend: React.FunctionComponent;
  export const IconMapPinLine: React.FunctionComponent<{ size?: number; fill?: string }>;
  export const IconMenu: React.FunctionComponent<{ size?: number }>;
  export const IconMovie: React.FunctionComponent;
  export const IconMusic: React.FunctionComponent;
  export const IconPhone: React.FunctionComponent<{ size?: number; fill?: string }>;
  export const IconPlaneLanding: React.FunctionComponent;
  export const IconPlaneTakeoff: React.FunctionComponent;
  export const IconPlay: React.FunctionComponent;
  export const IconPlayFill: React.FunctionComponent;
  export const IconRiArticleLine: React.FunctionComponent;
  export const IconRiGlobalLine: React.FunctionComponent;
  export const IconRiImage2Line: React.FunctionComponent;
  export const IconRiMapPin2Line: React.FunctionComponent;
  export const IconRiVideoLine: React.FunctionComponent;
  export const IconSearch: React.FunctionComponent;
  export const IconSettings: React.FunctionComponent;
  export const IconShare: React.FunctionComponent;
  export const IconShareBox: React.FunctionComponent;
  export const IconShoppingBag: React.FunctionComponent;
  export const IconStar: React.FunctionComponent;
  export const IconStarFill: React.FunctionComponent;
  export const IconStarHalf: React.FunctionComponent;
  export const Icontablet: React.FunctionComponent;
  export const IconTemperature: React.FunctionComponent;
  export const IconThumbDown: React.FunctionComponent;
  export const IconThumbUp: React.FunctionComponent;
  export const IconTime: React.FunctionComponent<{
    className?: string;
    size?: number;
    fill?: string;
  }>;
  export const IconTimerLine: React.FunctionComponent;
  export const IconUmbrellaLine: React.FunctionComponent;
  export const IconUser: React.FunctionComponent;
  export const IconVideoPlayer: React.FunctionComponent;
  export const IconVolumeOffVibrate: React.FunctionComponent;
  export const IconWater: React.FunctionComponent;
  export const RiArrowLeftLine: React.FunctionComponent;
  export const RiArrowLeftSLine: React.FunctionComponent;
  export const RiArrowRightLine: React.FunctionComponent;
  export const RiArrowRightSLine: React.FunctionComponent;
  export const RiCloseCircleLine: React.FunctionComponent;
  export const RiCloseLine: React.FunctionComponent;
  export const RiFile3Fill: React.FunctionComponent;
  export const RiLock2Fill: React.FunctionComponent;
  export const RiLogoutCircleRLine: React.FunctionComponent;
  export const RiSettingsLine: React.FunctionComponent;
}
