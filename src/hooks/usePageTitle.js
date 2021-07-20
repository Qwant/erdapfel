import { useEffect } from 'react';

export const usePageTitle = (title, suffix = 'Qwant Maps') => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = [title, suffix].filter(i => i).join(' - ');

    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};
