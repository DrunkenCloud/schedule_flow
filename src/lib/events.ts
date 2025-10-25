import { type CalendarEvent, type EventRow } from '@/lib/types';
import { startOfDay } from 'date-fns';

export const processEventsForLayout = (
  events: CalendarEvent[],
  viewStart: Date,
  viewEnd: Date
): EventRow[] => {
  const filteredEvents = events.filter(
    (event) =>
      event.start < viewEnd && event.end > viewStart
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.start.getTime() !== b.start.getTime()) {
      return a.start.getTime() - b.start.getTime();
    }
    return (b.end.getTime() - b.start.getTime()) - (a.end.getTime() - a.start.getTime());
  });

  const rows: EventRow[] = [];

  for (const event of sortedEvents) {
    let placed = false;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const hasOverlap = row.some(
        (existingEvent) =>
          event.start < existingEvent.end && event.end > existingEvent.start
      );
      if (!hasOverlap) {
        row.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      rows.push([event]);
    }
  }

  return rows;
};

export const getDayFromEvents = (events: CalendarEvent[]): Date => {
  if (events.length === 0) {
    return new Date();
  }
  // Sort events by start time to find the earliest one
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  return startOfDay(sortedEvents[0].start);
};
