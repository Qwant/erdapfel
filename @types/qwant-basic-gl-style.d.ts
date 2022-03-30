declare module '@qwant/qwant-basic-gl-style' {
  export function getPoiIcon(_props: {
    className?: string;
    subClassName?: string;
    type?: string;
  }): { iconClass: string; color: string };
}
