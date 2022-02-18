import { addDays, addMinutes } from "date-fns";
import { IsoDayString, LocalParts, OpeningTimes, Space, Time } from "./types";

// This didn't need to be configurable but I would put it on the Space object
const SLOT_LENGTH = 15;

// Baffles me that you can't do weekday: "numeric"...either way we are fixing locale for format to en-GB so we can rely on these names.
const WEEKDAY_LONG_TO_NUMERIC: Record<string, IsoDayString> = {
  Monday: "1",
  Tuesday: "2",
  Wednesday: "3",
  Thursday: "4",
  Friday: "5",
  Saturday: "6",
  Sunday: "7",
};

/**
 * Take a Date from anywhere and given a timezone, return localised parts.
 * @param date Date to find parts for, any timezone.
 * @param timeZone IANA timezone that we want to localise to
 * @returns LocalParts object representing the parts of the date we will need
 */
function getLocalDateTimeParts(date: Date, timeZone: string): LocalParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(date);

  // Doesn't need to be an arrow function, I just like indicating closures this way
  const part = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((part) => part.type === type);
    if (part === undefined)
      throw new Error(`Error retrieving part from formatted ${type}`);

    return part.value;
  };

  return {
    weekday: WEEKDAY_LONG_TO_NUMERIC[part("weekday")],
    year: part("year"),
    month: part("month"),
    day: part("day"),
    hour: parseInt(part("hour"), 10),
    minute: parseInt(part("minute"), 10),
  };
}

/**
 * Get an arbitrary UTC date to do same-day time based operations and comparisons
 * @param Time a time object
 * @returns Date my mum's birthday, with fixed time.
 */
function arbitraryDate({ hour, minute }: Time) {
  return new Date(Date.UTC(1954, 4, 22, hour, minute));
}

/**
 * Quick utility to get a Time from a Date object
 * @param date date to get Time object
 * @returns Time object
 */
function timeFromDate(date: Date): Time {
  return {
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

/**
 * Find the soonest open slots for current day. This function is effectively tz unaware.
 * @param space The space to fetch the availability for
 * @param parts A LocalParts object that represents the current time in local form
 * @param slotInterval How frequent are our slots
 * @returns OpeningTimes object representing open/close time, or empty object if no slots.
 */
function getTimesForDay(
  space: Space,
  parts: LocalParts,
  slotInterval: number
): OpeningTimes {
  const { weekday } = parts;
  const day = space.openingTimes[weekday];

  if (!day?.open || !day?.close) return {};

  const close = arbitraryDate(day.close);

  const minimumStart = addMinutes(
    arbitraryDate(parts),
    space.minimumNotice ?? 0
  );

  // This loop could be avoided perhaps by doing modulus on the slotInterval, and finding the next possible slot based on a ceiling'd minimumStart, however one would have to also take into account the day.open, which could be any weird time.

  for (
    let start = arbitraryDate(day.open);
    start < close;
    start = addMinutes(start, slotInterval)
  ) {
    if (start >= minimumStart) {
      return {
        close: day.close,
        open: timeFromDate(start),
      };
    }
  }

  return {};
}

/**
 * Fetches upcoming availability for a space
 * @param space The space to fetch the availability for
 * @param numberOfDays The number of days from `now` to fetch availability for
 * @param now The time now
 */
export const fetchAvailability = (
  space: Space,
  numberOfDays: number,
  now: Date
): Record<string, OpeningTimes> => {
  // You could build this immutably with a reduce, but it is needless here.
  const availablity: Record<string, OpeningTimes> = {};

  for (let offset = 0; offset < numberOfDays; offset++) {
    const parts = getLocalDateTimeParts(addDays(now, offset), space.timeZone);

    // Subsequent days do not need to take into account current time
    if (offset !== 0) {
      parts.hour = 0;
      parts.minute = 0;
    }

    const times = getTimesForDay(space, parts, SLOT_LENGTH);
    availablity[`${parts.year}-${parts.month}-${parts.day}`] = times;
  }

  return availablity;
};
