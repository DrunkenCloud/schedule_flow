# **App Name**: ScheduleFlow

## Core Features:

- ICS File Upload: Allow users to upload .ics files containing calendar event data entirely on the client side.
- Event Parsing: Parse the uploaded .ics file to extract individual event details such as start time, end time, and description, all client-side.
- Timeline Layout: Visually represent the events on a horizontal timeline, with time progressing from left to right, rendered client-side.
- Overlap Detection: Detect and flag any overlapping events in the schedule using client-side logic.
- Conflict Resolution: Automatically shift overlapping events vertically onto separate rows to visually resolve conflicts and improve readability. Display any events going outside the time displayed to another line, rather than showing overlaps. All processing happens client-side.
- Event Details Display: Display event details when hovering over the event representation on the timeline. Allow user to filter time by clicking certain periods. All UI interactions are handled client-side.

## Style Guidelines:

- Primary color: Light blue (#ADD8E6) to convey a sense of clarity and organization.
- Background color: Very light gray (#F0F0F0) to provide a clean and neutral backdrop.
- Accent color: Soft green (#90EE90) to highlight selected events or time slots.
- Body and headline font: 'PT Sans', a humanist sans-serif for a modern, readable style.
- Horizontal timeline layout with clear time markers. Vertical stacking for overlapping events.
- Use simple, geometric icons to represent different types of events (e.g., meetings, appointments, reminders).
- Subtle animations to highlight event details on hover.