import { type } from '@ngrx/signals';
import { event } from '@ngrx/signals/events';

export const customerChanged = event(
  '[Global] Customer Changed',
  type<{ id: number }>(),
);

export const log = event('[Log]', type<{ message: string; type: string }>());
