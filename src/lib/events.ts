import { type CalendarEvent, type EventRow } from '@/lib/types';
import { startOfDay, endOfDay, startOfHour, endOfHour, addHours, subHours } from 'date-fns';

export const processEventsForLayout = (
  events: CalendarEvent[],
  viewStart: Date,
  viewEnd: Date
): EventRow[] => {
  if (!events) return [];

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

export const getEventTimeRange = (
  allEvents: CalendarEvent[],
  eventDate: Date
): { viewStart: Date; viewEnd: Date } => {
  if (allEvents.length === 0) {
    return { viewStart: startOfDay(eventDate), viewEnd: endOfDay(eventDate) };
  }

  const eventsOnDate = allEvents.filter(
    (event) =>
      startOfDay(event.start).getTime() === startOfDay(eventDate).getTime()
  );

  if (eventsOnDate.length === 0) {
    return {
      viewStart: startOfDay(eventDate),
      viewEnd: endOfDay(eventDate),
    };
  }

  const firstEvent = eventsOnDate.reduce((earliest, current) =>
    current.start < earliest.start ? current : earliest
  );
  const lastEvent = eventsOnDate.reduce((latest, current) =>
    current.end > latest.end ? current : latest
  );
  
  const viewStart = subHours(startOfHour(firstEvent.start), 1);
  const viewEnd = addHours(endOfHour(lastEvent.end), 1);

  return { viewStart, viewEnd };
};
