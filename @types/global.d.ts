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
        state: { [key: string]: any },
        options?: { [key: string]: any }
      ) => void;
      updateHash: (hash: string) => void;
    };
  }
}
export {};
