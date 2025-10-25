"use client";

import React, { useState, useMemo } from 'react';
import { processEventsForLayout, getDayFromEvents, getEventTimeRange } from '@/lib/events';
import { type CalendarEvent, type EventRow } from '@/lib/types';
import { FileUploader } from '@/components/schedule-flow/file-uploader';
import { Timeline } from '@/components/schedule-flow/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarDays, GanttChartSquare, ZoomIn, ZoomOut, StretchVertical, StretchHorizontal } from 'lucide-react';
import { parseIcsString } from './actions';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [eventRows, setEventRows] = useState<EventRow[]>([]);
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [heightZoomLevel, setHeightZoomLevel] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
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
        setSelectedEvents(new Set());
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
  
  const handleEventSelect = (eventId: string) => {
    setSelectedEvents(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(eventId)) {
        newSelected.delete(eventId);
      } else {
        newSelected.add(eventId);
      }
      return newSelected;
    });
  };

  const { viewStart, viewEnd } = useMemo(() => {
    return getEventTimeRange(allEvents, eventDate);
  }, [allEvents, eventDate]);

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
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays />
                Your Schedule
              </CardTitle>
              <p className="text-muted-foreground">Displaying events for: {format(eventDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
          </CardHeader>
          <CardContent>
             <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground"><StretchHorizontal/> Horizontal Zoom</Label>
                  <div className="flex items-center gap-4">
                    <ZoomOut className="text-muted-foreground" />
                    <Slider
                      min={1}
                      max={8}
                      step={0.1}
                      value={[zoomLevel]}
                      onValueChange={(value) => setZoomLevel(value[0])}
                      className="max-w-xs"
                    />
                    <ZoomIn className="text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground"><StretchVertical /> Vertical Zoom</Label>
                   <div className="flex items-center gap-4">
                    <ZoomOut className="text-muted-foreground" />
                    <Slider
                      min={1}
                      max={4}
                      step={0.1}
                      value={[heightZoomLevel]}
                      onValueChange={(value) => setHeightZoomLevel(value[0])}
                      className="max-w-xs"
                    />
                    <ZoomIn className="text-muted-foreground" />
                  </div>
                </div>
            </div>
            <Timeline 
              eventRows={eventRows} 
              viewStart={viewStart} 
              viewEnd={viewEnd} 
              zoomLevel={zoomLevel} 
              heightZoomLevel={heightZoomLevel}
              selectedEvents={selectedEvents}
              onEventSelect={handleEventSelect}
            />
          </CardContent>
        </Card>
      ) : (
        <FileUploader onFileSelect={handleFileSelect} />
      )}
    </main>
  );
}
