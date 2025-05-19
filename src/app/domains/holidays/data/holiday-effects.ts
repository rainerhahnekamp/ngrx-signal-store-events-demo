import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { mapResponse } from '@ngrx/operators';
import { signalStoreFeature, type } from '@ngrx/signals';
import { Events, withEffects } from '@ngrx/signals/events';
import { exhaustMap, map } from 'rxjs';
import { customerChanged, log } from '../../../shared/events/global-events';
import { Holiday } from '../model/holiday';
import { holidayEvents } from './holiday-events';
import { HolidayState } from './holidays-store';

export function withHolidayEffects() {
  return signalStoreFeature(
    type<{ state: HolidayState }>(),
    withEffects((store) => {
      const events = inject(Events);
      const httpClient = inject(HttpClient);

      return {
        load$: events.on(holidayEvents.load).pipe(
          exhaustMap(() =>
            httpClient.get<Holiday[]>('/holiday').pipe(
              mapResponse({
                next: (holidays) => holidayEvents.loaded(holidays),
                error: console.error,
              }),
            ),
          ),
        ),
        customerChanged$: events
          .on(customerChanged)
          .pipe(map(() => holidayEvents.resetFavourites())),

        favouriteTracking$: events
          .on(holidayEvents.addFavourite, holidayEvents.removeFavourite)
          .pipe(
            map(() =>
              log({
                message: `favourites ${store.favouriteIds().join(',')}`,
                type: 'info',
              }),
            ),
          ),
      };
    }),
  );
}
