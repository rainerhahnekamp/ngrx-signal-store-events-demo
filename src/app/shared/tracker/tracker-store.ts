import { inject } from '@angular/core';
import {
  patchState,
  signalMethod,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Events, withEffects } from '@ngrx/signals/events';
import { tap } from 'rxjs';
import { log } from '../events/global-events';

export type Log = {
  id: number;
  message: string;
  type: string;
  timestamp: Date;
};

let currentId = 0;

export const TrackerStore = signalStore(
  { providedIn: 'root' },
  withState({
    logs: [] as Log[],
  }),
  withMethods((store) => ({
    log: signalMethod<{ message: string; type: string }>(
      ({ message, type }) => {
        const newLog = {
          id: ++currentId,
          message,
          type,
          timestamp: new Date(),
        };
        patchState(store, ({ logs }) => ({ logs: [...logs, newLog] }));
        console.log(newLog);
      },
    ),
  })),
  withEffects((store) => {
    const events = inject(Events);

    return {
      log$: events.on(log).pipe(tap((event) => store.log(event.payload))),
    };
  }),
  withHooks((store) => ({
    onInit: () =>
      store.log({ message: 'TrackerStore initialized', type: 'info' }),
  })),
);
