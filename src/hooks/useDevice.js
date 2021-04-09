import { useContext } from 'react';
import { DeviceContext } from 'src/libs/device';

export const useDevice = () => useContext(DeviceContext);
