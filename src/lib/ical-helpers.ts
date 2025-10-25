import { type CalendarEvent } from '@/lib/types';
import ical from 'ical';

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
