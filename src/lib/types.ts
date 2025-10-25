export type CalendarEvent = {
  id: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
};

export type EventRow = CalendarEvent[];
