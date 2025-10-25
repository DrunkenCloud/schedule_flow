import { type CalendarEvent } from '@/lib/types';
import ical from 'ical';

// Helper to get value from ical property which can be string or object
const getIcalValue = (prop: any): string => {
    if (typeof prop === 'string') {
        return prop;
    }
    if (prop && typeof prop === 'object' && prop.val) {
        return prop.val;
    }
    return '';
};


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
          id: getIcalValue(event.uid) || key,
          start: new Date(event.start),
          end: new Date(endDate),
          summary: getIcalValue(event.summary) || 'No Title',
          description: getIcalValue(event.description) || '',
          location: getIcalValue(event.location) || '',
        });
      }
    }
  }
  return events;
};
