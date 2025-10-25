export type CalendarEvent = {
  id: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
};

export type EventRow = CalendarEvent[];

export type StoredCalendarFile = {
  name: string;
  content: string; // The raw string content of the .ics file
  addedAt: string; // ISO date string
};
