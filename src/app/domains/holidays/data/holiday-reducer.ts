import { signalStoreFeature, type } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { customerChanged } from '../../../shared/events/global-events';
import { holidayEvents } from './holiday-events';
import { HolidayState } from './holidays-store';

export function withHolidayReducer<_>() {
  return signalStoreFeature(
    type<{ state: HolidayState }>(),
    withReducer(
      on(holidayEvents.loaded, (event) => {
        return { holidays: event.payload };
      }),
      on(holidayEvents.search, ({ payload: filter }) => ({ filter })),
      on(holidayEvents.addFavourite, ({ payload: favouriteId }) => (state) => {
        if (state.favouriteIds.includes(favouriteId)) {
          return {};
        }
        return {
          favouriteIds: [...state.favouriteIds, favouriteId],
        };
      }),
      on(
        holidayEvents.removeFavourite,
        ({ payload: favouriteId }) =>
          (state) => {
            if (!state.favouriteIds.includes(favouriteId)) {
              return {};
            }
            return {
              favouriteIds: state.favouriteIds.filter(
                (id) => favouriteId !== id,
              ),
            };
          },
      ),
      on(holidayEvents.resetFavourites, customerChanged, () => ({
        favouriteIds: [],
      })),
    ),
  );
}
