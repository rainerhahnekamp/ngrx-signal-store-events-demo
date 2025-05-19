import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { mapResponse, tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalMethod,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  removeAllEntities,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { Dispatcher } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { concatMap, switchMap, tap } from 'rxjs/operators';
import { Configuration } from '../../../shared/config/configuration';
import { customerChanged } from '../../../shared/events/global-events';
import { MessageService } from '../../../shared/ui-messaging/message/message.service';
import { Customer } from '../model/customer';

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withDevtools('customer'),
  withEntities<Customer>(),
  withState({
    page: 0,
    total: 0,
    selectedId: undefined as number | undefined,
    status: 'init' as 'init' | 'loading' | 'loaded',
  }),
  withMethods((store) => {
    const httpClient = inject(HttpClient);
    const config = inject(Configuration);
    const router = inject(Router);
    const uiMessage = inject(MessageService);
    const baseUrl = '/customer';

    const _load = rxMethod<{ page: number; callback?: () => void }>(
      pipe(
        tap(() =>
          patchState(store, { status: 'loading' }, removeAllEntities()),
        ),
        switchMap(({ page, callback }) =>
          httpClient
            .get<{ content: Customer[]; total: number }>(baseUrl, {
              params: new HttpParams().set(
                'page',
                config.pagedCustomers ? page : 0,
              ),
            })
            .pipe(
              mapResponse({
                next: ({ content, total }) =>
                  patchState(store, setAllEntities(content), { total, page }),
                error: () => EMPTY,
              }),
              tap(() => (callback ? callback() : {})),
              tap(() => patchState(store, { status: 'loaded' })),
            ),
        ),
      ),
    );

    return {
      load(page: number, callback?: () => void) {
        _load({ page, callback });
      },
      add: rxMethod<Customer>(
        concatMap((customer) =>
          httpClient
            .post<{ customers: Customer[]; id: number }>(baseUrl, customer)
            .pipe(
              tapResponse({
                next: () => {
                  uiMessage.info('Customer has been updated');
                  _load({ page: 0 });
                  router.navigateByUrl('/customer');
                },
                error: () => EMPTY,
              }),
            ),
        ),
      ),
      update: rxMethod<Customer>(
        concatMap((customer) =>
          httpClient.put<Customer[]>(baseUrl, customer).pipe(
            tapResponse({
              next: () => {
                _load({ page: 0 });
                router.navigateByUrl('/customer');
              },
              error: () => EMPTY,
            }),
          ),
        ),
      ),
      remove: rxMethod<number>(
        concatMap((id) =>
          httpClient.delete<Customer[]>(`${baseUrl}/${id}`).pipe(
            tapResponse({
              next: () => {
                _load({ page: 0 });
                router.navigateByUrl('/customer');
              },
              error: () => EMPTY,
            }),
          ),
        ),
      ),
      select: rxMethod<number>(
        tap((selectedId) => patchState(store, { selectedId })),
      ),
      unselect() {
        patchState(store, { selectedId: undefined });
      },
    };
  }),
  withComputed((state) => ({
    selectedCustomer: computed(() =>
      state.entities().find((customer) => customer.id === state.selectedId()),
    ),
    pagedCustomer: computed(() => ({
      customers: state.entities().map((customer) => ({
        ...customer,
        selected: customer.id === state.selectedId(),
      })),
      pageIndex: state.page(),
      length: state.total(),
    })),
  })),
  withHooks((store) => ({
    onInit() {
      const dispatcher = inject(Dispatcher);
      signalMethod<number | undefined>((id) => {
        if (id === undefined) {
          return;
        }
        dispatcher.dispatch(customerChanged({ id }));
      })(store.selectedId);
    },
  })),
);
