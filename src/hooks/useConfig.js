import nconf from '@qwant/nconf-getter';

const config = nconf.get();

export const useConfig = subSet => {
  if (subSet) {
    return config[subSet] || {};
  }
  return config;
};
