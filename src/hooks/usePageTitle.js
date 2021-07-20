import { useEffect } from 'react';
import { useConfig } from './useConfig';

export const usePageTitle = (title, suffix = 'Qwant Maps') => {
  const envName = useConfig('envName');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = [title, suffix, envName].filter(i => i).join(' - ');

    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix, envName]);
};
