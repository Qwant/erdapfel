import nconf from '@qwant/nconf-getter';

const config = nconf.get();

export const useConfig = subSet => {
  if (subSet) {
    const configSub = config[subSet];
    return configSub === undefined ? {} : configSub;
  }
  return config;
};
