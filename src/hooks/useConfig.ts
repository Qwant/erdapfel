import { QmapsConfig } from '../../@types/config';
import nconf from '@qwant/nconf-getter';

export const useConfig = (subSet?: keyof QmapsConfig): QmapsConfig => {
  const config = nconf.get();

  if (subSet) {
    return config?.[subSet as keyof QmapsConfig] ?? {};
  }

  return config;
};
