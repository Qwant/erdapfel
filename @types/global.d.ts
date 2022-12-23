declare global {
  interface Window {
    app: {
      router: {
        baseUrl: string;
        routeDefs: {
          match: string;
          name: string;
          render: () => void;
        }[];
      };
      initMap: () => void;
      navigateBack: () => void;
      navigateTo: (
        url: string,
        state?: { [key: string]: unknown } | unknown,
        options?: { [key: string]: unknown } | unknown
      ) => void;
      updateHash: (hash: string) => void;
    };

    getLang: () => { locale: string; code: string; fallback?: string };
    baseUrl: string;
    location: Location;
  }
}
export {};
