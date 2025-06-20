import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { injectDispatch } from '@ngrx/signals/events';
import { holidayEvents } from '../data/holiday-events';
import { HolidayStore } from '../data/holidays-store';
import { HolidayCardComponent } from '../ui/holiday-card/holiday-card.component';

@Component({
  selector: 'app-holidays',
  template: `<h2>Choose among our Holidays</h2>
    <form (ngSubmit)="handleSearch()">
      <div class="flex items-baseline">
        <mat-form-field>
          <mat-label>Search</mat-label>
          <input
            data-testid="inp-search"
            [(ngModel)]="search"
            matInput
            name="search"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-radio-group
          [(ngModel)]="type"
          name="type"
          color="primary"
          class="mx-4"
        >
          <mat-radio-button value="0">All</mat-radio-button>
          <mat-radio-button value="1">City</mat-radio-button>
          <mat-radio-button value="2">Country</mat-radio-button>
        </mat-radio-group>
        <button color="primary" mat-raised-button>Search</button>
      </div>
    </form>

    <button (click)="removeAllFavourites()" mat-raised-button>
      Remove All Favourites
    </button>

    <div class="flex flex-wrap justify-evenly">
      @for (holiday of holidays(); track holiday.id) {
        <app-holiday-card
          [holiday]="holiday"
          (addFavourite)="addFavourite($event)"
          (removeFavourite)="removeFavourite($event)"
        >
        </app-holiday-card>
      }
    </div> `,
  imports: [
    HolidayCardComponent,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioGroup,
    MatRadioButton,
    MatButton,
    HolidayCardComponent,
  ],
})
export class HolidaysComponent implements OnInit {
  readonly #holidaysStore = inject(HolidayStore);
  readonly #events = injectDispatch(holidayEvents);

  protected holidays = this.#holidaysStore.holidaysWithFavourite;
  protected search = '';
  protected type = '0';

  ngOnInit(): void {
    this.#events.load();
  }

  addFavourite(id: number) {
    this.#events.addFavourite(id);
  }

  removeFavourite(id: number) {
    this.#events.removeFavourite(id);
  }

  handleSearch() {
    this.#events.search({ query: this.search, type: Number(this.type) });
  }

  removeAllFavourites() {
    this.holidays()
      .filter((holiday) => holiday.isFavourite)
      .forEach((holiday) => this.#events.removeFavourite(holiday.id));
  }
}
