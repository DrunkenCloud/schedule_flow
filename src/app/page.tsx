"use client";

import React, { useState, useMemo } from 'react';
import { processEventsForLayout, getDayFromEvents } from '@/lib/events';
import { type CalendarEvent, type EventRow } from '@/lib/types';
import { FileUploader } from '@/components/schedule-flow/file-uploader';
import { Timeline } from '@/components/schedule-flow/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay, setHours, format } from 'date-fns';
import { CalendarDays, GanttChartSquare, ZoomIn, ZoomOut } from 'lucide-react';
import { parseIcsString } from './actions';
import { Slider } from '@/components/ui/slider';

type ViewPeriod = 'all' | 'morning' | 'afternoon' | 'evening';

const PERIODS: { id: ViewPeriod; label: string; startHour: number; endHour: number }[] = [
  { id: 'all', label: 'All Day', startHour: 0, endHour: 24 },
  { id: 'morning', label: 'Morning (6-12)', startHour: 6, endHour: 12 },
  { id: 'afternoon', label: 'Afternoon (12-18)', startHour: 12, endHour: 18 },
  { id: 'evening', label: 'Evening (18-24)', startHour: 18, endHour: 24 },
];

export default function Home() {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [eventRows, setEventRows] = useState<EventRow[]>([]);
  const [activePeriod, setActivePeriod] = useState<ViewPeriod>('all');
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("File is empty.");
        
        const parsedEventsResult = await parseIcsString(content);
        
        const parsedEvents: CalendarEvent[] = parsedEventsResult.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        
        if (parsedEvents.length === 0) {
          toast({
            title: "No Events Found",
            description: "The selected .ics file does not contain any valid events.",
            variant: "destructive"
          });
          return;
        }

        setAllEvents(parsedEvents);
        const firstEventDate = getDayFromEvents(parsedEvents);
        setEventDate(firstEventDate);
        toast({
          title: "Success!",
          description: `Loaded ${parsedEvents.length} events.`,
        });
      } catch (error) {
        console.error("Error parsing ICS file:", error);
        toast({
          title: "Parsing Error",
          description: "Could not read or parse the selected .ics file. Please ensure it is valid.",
          variant: "destructive"
        });
        setAllEvents([]);
      }
    };
    reader.onerror = () => {
       toast({
          title: "File Read Error",
          description: "Could not read the selected file.",
          variant: "destructive"
        });
    }
    reader.readAsText(file);
  };

  const { viewStart, viewEnd } = useMemo(() => {
    const period = PERIODS.find(p => p.id === activePeriod) || PERIODS[0];
    const start = setHours(startOfDay(eventDate), period.startHour);
    const end = period.endHour === 24 ? endOfDay(eventDate) : setHours(startOfDay(eventDate), period.endHour);
    return { viewStart: start, viewEnd: end };
  }, [activePeriod, eventDate]);

  React.useEffect(() => {
    if (allEvents.length > 0) {
      const rows = processEventsForLayout(allEvents, viewStart, viewEnd);
      setEventRows(rows);
    } else {
      setEventRows([]);
    }
  }, [allEvents, viewStart, viewEnd]);
  
  const hasEvents = allEvents.length > 0;

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold font-headline flex items-center justify-center gap-3">
          <GanttChartSquare className="w-10 h-10 text-primary" />
          ScheduleFlow
        </h1>
        <p className="text-lg text-muted-foreground">
          Visualize your calendar events from an .ics file on a clean, interactive timeline.
        </p>
      </header>
      
      {hasEvents ? (
         <Card>
          <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays />
                Your Schedule
              </CardTitle>
              <p className="text-muted-foreground">Displaying events for: {format(eventDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {PERIODS.map(period => (
                <Button 
                  key={period.id} 
                  variant={activePeriod === period.id ? 'default' : 'outline'}
                  onClick={() => setActivePeriod(period.id)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-4 mb-4">
              <ZoomOut className="text-muted-foreground" />
              <Slider
                min={1}
                max={4}
                step={0.1}
                value={[zoomLevel]}
                onValueChange={(value) => setZoomLevel(value[0])}
                className="max-w-xs"
              />
              <ZoomIn className="text-muted-foreground" />
            </div>
            <Timeline eventRows={eventRows} viewStart={viewStart} viewEnd={viewEnd} zoomLevel={zoomLevel} />
          </CardContent>
        </Card>
      ) : (
        <FileUploader onFileSelect={handleFileSelect} />
      )}
    </main>
  );
}
