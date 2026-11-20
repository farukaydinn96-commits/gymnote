import { DayId } from "../types/workout";

export const getLocalISODate = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayDayId = (d: Date = new Date()): DayId => {
  const map: DayId[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[d.getDay()];
};

export const getMondayOfCurrentWeekISO = (d: Date = new Date()): string => {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return getLocalISODate(copy);
};
