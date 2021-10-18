export interface Time {
  hour: number;
  minute: number;
}

export interface OpeningTimes {
  open?: Time;
  close?: Time;
}

export type AvailabilityCalendar = Record<string, OpeningTimes>;

export interface Space {
  /** An object containing the opening times for this space, where the key is an ISO weekday number. */
  openingTimes: Record<string, OpeningTimes>;
  /** The number of minutes notice this space requires for bookings. */
  minimumNotice: number;
  /** The IANA timezone name of this space. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones*/
  timeZone: string;
}
