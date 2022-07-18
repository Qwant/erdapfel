import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createUiSlice, UiSlice } from './slices/ui';

export type AppState = UiSlice;

export const useStore = create<AppState>(
  persist(
    devtools((set, get) => ({
      ...createUiSlice(set, get),
    })),
    {
      name: 'qmaps-persist',
      // Store isn't persisted by default in localStorage
      // The partialize method indicates which state entries should persist:
      partialize: state => ({ defaultVehicle: state.defaultVehicle }),
    }
  )
);
