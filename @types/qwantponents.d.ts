// @TODO: @qwant/qwant-ponents need his own typings in Phoenix
declare module '@qwant/qwant-ponents' {
  import React = require('react');
  type SvgReactComponent = React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      className?: string;
      size?: number;
      color?: string;
      style?: React.CSSProperties;
    }
  >;

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
    column?: boolean;
    takeAvailableSpace?: boolean;
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
  export const IconDoubleChevronDown: SvgReactComponent;
  export const IconMinus: SvgReactComponent;
  export const IconPlayCircle: SvgReactComponent;
  export const IconPlus: SvgReactComponent;
  export const IconShoppingBadEmpty: SvgReactComponent;
  export const IconSort: SvgReactComponent;
  export const IconTripAdvisor: SvgReactComponent;
  export const AiOutlineExclamationCircle: SvgReactComponent;
  export const IconAppleFill: SvgReactComponent;
  export const IconApps: SvgReactComponent;
  export const IconArrowDown: SvgReactComponent;
  export const IconArrowDownSLine: SvgReactComponent;
  export const IconArrowDropDownLine: SvgReactComponent;
  export const IconArrowLeftDownLine: SvgReactComponent;
  export const IconArrowLeftLine: SvgReactComponent;
  export const IconArrowLeftRight: SvgReactComponent;
  export const IconArrowLeftRightFill: SvgReactComponent;
  export const IconArrowLeftRightLine: SvgReactComponent;
  export const IconArrowLeftSLine: SvgReactComponent;
  export const IconArrowLeftUpLine: SvgReactComponent;
  export const IconArrowRightLine: SvgReactComponent;
  export const IconArrowRightSLine: SvgReactComponent;
  export const IconArrowUpSLine: SvgReactComponent;
  export const IconBell: SvgReactComponent;
  export const IconBuilding: SvgReactComponent;
  export const IconCalendar: SvgReactComponent;
  export const IconCamera: SvgReactComponent;
  export const IconCheck: SvgReactComponent;
  export const IconCheckCircle: SvgReactComponent;
  export const IconCheckCircleFill: SvgReactComponent;
  export const IconClock: SvgReactComponent;
  export const IconClose: SvgReactComponent;
  export const IconCloseCircle: SvgReactComponent;
  export const IconCloseCircleFill: SvgReactComponent;
  export const IconCopy: SvgReactComponent;
  export const IconDirection: SvgReactComponent;
  export const IconEarth: SvgReactComponent;
  export const IconEmpty: SvgReactComponent;
  export const IconEmptyFill: SvgReactComponent;
  export const IconErrorWarningLine: SvgReactComponent;
  export const IconExternalLink: SvgReactComponent;
  export const IconEye: SvgReactComponent;
  export const IconEyeClose: SvgReactComponent;
  export const IconEyeClosed: SvgReactComponent;
  export const IconFileList: SvgReactComponent;
  export const IconFileText: SvgReactComponent;
  export const IconFilter: SvgReactComponent;
  export const IconFlag: SvgReactComponent;
  export const IconFlagFill: SvgReactComponent;
  export const IconFullScreen: SvgReactComponent;
  export const IconGlobe: SvgReactComponent;
  export const IconGlobeStand: SvgReactComponent;
  export const IconHeart: SvgReactComponent;
  export const IconHearts: SvgReactComponent;
  export const IconHome: SvgReactComponent;
  export const IconInformation: SvgReactComponent;
  export const IconLight: SvgReactComponent;
  export const IconLock: SvgReactComponent;
  export const IconLogoutCircle: SvgReactComponent;
  export const IconMail: SvgReactComponent;
  export const IconMailSend: SvgReactComponent;
  export const IconMapPinLine: SvgReactComponent;
  export const IconMenu: SvgReactComponent;
  export const IconMovie: SvgReactComponent;
  export const IconMusic: SvgReactComponent;
  export const IconPhone: SvgReactComponent;
  export const IconPlaneLanding: SvgReactComponent;
  export const IconPlaneTakeoff: SvgReactComponent;
  export const IconPlay: SvgReactComponent;
  export const IconPlayFill: SvgReactComponent;
  export const IconRiArticleLine: SvgReactComponent;
  export const IconRiGlobalLine: SvgReactComponent;
  export const IconRiImage2Line: SvgReactComponent;
  export const IconRiMapPin2Line: SvgReactComponent;
  export const IconRiVideoLine: SvgReactComponent;
  export const IconSearch: SvgReactComponent;
  export const IconSettings: SvgReactComponent;
  export const IconShare: SvgReactComponent;
  export const IconShareBox: SvgReactComponent;
  export const IconShoppingBag: SvgReactComponent;
  export const IconStar: SvgReactComponent;
  export const IconStarFill: SvgReactComponent;
  export const IconStarHalf: SvgReactComponent;
  export const Icontablet: SvgReactComponent;
  export const IconTemperature: SvgReactComponent;
  export const IconThumbDown: SvgReactComponent;
  export const IconThumbUp: SvgReactComponent;
  export const IconTime: SvgReactComponent;
  export const IconTimerLine: SvgReactComponent;
  export const IconUmbrellaLine: SvgReactComponent;
  export const IconUser: SvgReactComponent;
  export const IconVideoPlayer: SvgReactComponent;
  export const IconVolumeOffVibrate: SvgReactComponent;
  export const IconWater: SvgReactComponent;
  export const RiArrowLeftLine: SvgReactComponent;
  export const RiArrowLeftSLine: SvgReactComponent;
  export const RiArrowRightLine: SvgReactComponent;
  export const RiArrowRightSLine: SvgReactComponent;
  export const RiCloseCircleLine: SvgReactComponent;
  export const RiCloseLine: SvgReactComponent;
  export const RiFile3Fill: SvgReactComponent;
  export const RiLock2Fill: SvgReactComponent;
  export const RiLogoutCircleRLine: SvgReactComponent;
  export const RiSettingsLine: SvgReactComponent;
}
