import { signalStore, withComputed, withState } from '@ngrx/signals';

import { computed } from '@angular/core';
import { Holiday } from '../model/holiday';
import { withHolidayEffects } from './holiday-effects';
import { withHolidayReducer } from './holiday-reducer';

export interface HolidayState {
  holidays: Holiday[];
  favouriteIds: number[];
  filter: { query: string; type: number };
}

const initialState: HolidayState = {
  holidays: [],
  favouriteIds: [],
  filter: { query: '', type: 0 },
};

export const HolidayStore = signalStore(
  { providedIn: 'root' },
  // withDevtools('holidays'),
  withState(initialState),
  withHolidayEffects(),
  withHolidayReducer(),
  withComputed((state) => {
    const filteredHolidays = computed(() => {
      const { query, type } = state.filter();
      return state
        .holidays()
        .filter((holiday) => holiday.title.includes(query))
        .filter((holiday) => !type || holiday.typeId === type);
    });

    return {
      filteredHolidays,
      holidaysWithFavourite: computed(() =>
        filteredHolidays().map((holiday) => ({
          ...holiday,
          isFavourite: state.favouriteIds().includes(holiday.id),
        })),
      ),
    };
  }),
);
