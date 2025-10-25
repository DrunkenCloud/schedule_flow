import { type CalendarEvent, type EventRow } from '@/lib/types';
import ical from 'ical';
import { startOfDay } from 'date-fns';

export const parseIcsFile = (icsContent: string): CalendarEvent[] => {
  const data = ical.parseICS(icsContent);
  const events: CalendarEvent[] = [];

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const event = data[key];
      if (event.type === 'VEVENT') {
        if (!event.start) continue;

        const endDate = event.end || event.start;

        events.push({
          id: event.uid || key,
          start: new Date(event.start),
          end: new Date(endDate),
          summary: event.summary?.val || 'No Title',
          description: event.description?.val || '',
          location: event.location?.val || '',
        });
      }
    }
  }
  return events;
};

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
