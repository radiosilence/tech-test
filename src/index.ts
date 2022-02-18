import { addMinutes } from "date-fns";
import { OpeningTimes, Space } from "./types";

const SLOT_LENGTH = 15;

type IsoDayString = "1" | "2" | "3" | "4" | "5" | "6" | "7";
const longIsoToNumeric: Record<string, IsoDayString> = {
  Monday: "1",
  Tuesday: "2",
  Wednesday: "3",
  Thursday: "4",
  Friday: "5",
  Saturday: "6",
  Sunday: "7",
};

interface LocalParts {
  hour: number;
  minute: number;
  year: string;
  month: string;
  day: string;
  weekday: IsoDayString;
}

export function getLocalDateTimeParts(
  date: Date,
  timeZone: string
): LocalParts {
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
  const part = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((part) => part.type === type);
    if (part === undefined)
      throw new Error(`Error retrieving part from formatted ${type}`);

    return part.value;
  };
  return {
    hour: parseInt(part("hour"), 10),
    minute: parseInt(part("minute"), 10),
    year: part("year"),
    month: part("month"),
    day: part("day"),
    weekday: longIsoToNumeric[part("weekday")],
  };
}

interface Time {
  hour: number;
  minute: number;
}

function arbitraryDate({ hour, minute }: Time) {
  // We use an arbitrary date to do time based operations and comparisons
  // This happens to be my mum's birthday :)
  return new Date(Date.UTC(1954, 4, 22, hour, minute));
}

function timeFromDate(date: Date) {
  return {
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

/**
 * Find the soonest open slots for current day.
 * @param space The space to fetch the availability for
 * @param parts A LocalParts object that represents the current time in local form
 * @param slotInterval How frequent are our slots
 * @returns An OpeningTimes object representing open/close time, or empty object if no slots.
 */
function getTimesForDay(
  space: Space,
  parts: LocalParts,
  slotInterval: number
): OpeningTimes {
  const { weekday } = parts;
  const day = space.openingTimes[weekday];

  if (!day?.open || !day?.close) return {};

  let currentSlot = arbitraryDate(day.open);
  const close = arbitraryDate(day.close);

  const startTime = addMinutes(arbitraryDate(parts), space.minimumNotice ?? 0);
  let open: Time | undefined;

  while (currentSlot < close) {
    if (currentSlot >= startTime) {
      open = timeFromDate(currentSlot);
      return {
        close: day.close,
        open,
      };
    }
    currentSlot = addMinutes(currentSlot, slotInterval);
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
  // const now = new Date();
  const availablity: Record<string, OpeningTimes> = {};
  let daysLeft = numberOfDays;

  while (daysLeft > 0) {
    const parts = getLocalDateTimeParts(now, space.timeZone);
    const times = getTimesForDay(space, parts, SLOT_LENGTH);
    availablity[`${parts.year}-${parts.month}-${parts.day}`] = times;
    daysLeft -= 1;
  }

  return availablity;
};
