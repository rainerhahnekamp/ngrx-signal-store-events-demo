import {
  patchState,
  signalMethod,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

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
  withHooks((store) => ({
    onInit: () =>
      store.log({ message: 'TrackerStore initialized', type: 'info' }),
  })),
);
