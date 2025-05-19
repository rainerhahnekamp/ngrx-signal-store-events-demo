import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { Holiday } from '../model/holiday';

export const holidayEvents = eventGroup({
  source: 'holidays',
  events: {
    load: type<void>(),
    loaded: type<Holiday[]>(),
    search: type<{ query: string; type: number }>(),
    addFavourite: type<number>(),
    removeFavourite: type<number>(),
    resetFavourites: type<void>(),
  },
});
