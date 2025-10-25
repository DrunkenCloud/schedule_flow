'use server';

import { parseIcsFile } from '@/lib/events';
import { type CalendarEvent } from '@/lib/types';

export async function parseIcsString(
  content: string
): Promise<CalendarEvent[]> {
  try {
    const events = parseIcsFile(content);
    // We need to serialize the dates to send them from the server to the client.
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error parsing ICS on server:', error);
    // In a real app, you might want more specific error types.
    throw new Error('Failed to parse the ICS file on the server.');
  }
}
