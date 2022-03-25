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
      // Store isn't persisted by default - you need to do it case by case
      // Add here portion of state that should be persisted
      partialize: () => ({}),
    }
  )
);
