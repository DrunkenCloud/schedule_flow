"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { processEventsForLayout, getDayFromEvents, getEventTimeRange } from '@/lib/events';
import { type CalendarEvent, type EventRow, type StoredCalendarFile } from '@/lib/types';
import { FileUploader } from '@/components/schedule-flow/file-uploader';
import { Timeline } from '@/components/schedule-flow/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarDays, GanttChartSquare, ZoomIn, ZoomOut, StretchVertical, StretchHorizontal, Github } from 'lucide-react';
import { parseIcsString } from './actions';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { saveCalendarFile, getSavedCalendarFiles, removeCalendarFile } from '@/lib/local-storage-helpers';
import { PreviousUploads } from '@/components/schedule-flow/previous-uploads';
import { ExampleSchedules } from '@/components/schedule-flow/example-schedules';

export default function Home() {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [eventRows, setEventRows] = useState<EventRow[]>([]);
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [heightZoomLevel, setHeightZoomLevel] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [savedFiles, setSavedFiles] = useState<StoredCalendarFile[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load saved files from local storage on initial render
    setSavedFiles(getSavedCalendarFiles());
  }, []);

  const handleParseEvents = useCallback(async (content: string, fileName?: string) => {
    try {
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
      
      if (fileName) {
        saveCalendarFile(fileName, content);
        setSavedFiles(getSavedCalendarFiles()); // Refresh file list
        toast({
          title: "Success!",
          description: `Loaded ${parsedEvents.length} events from ${fileName}.`,
        });
      } else {
        toast({
          title: "Success!",
          description: `Loaded ${parsedEvents.length} events.`,
        });
      }

    } catch (error) {
      console.error("Error parsing ICS file:", error);
      toast({
        title: "Parsing Error",
        description: "Could not read or parse the selected .ics file. Please ensure it is valid.",
        variant: "destructive"
      });
      setAllEvents([]);
    }
  }, [toast]);


  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      await handleParseEvents(content, file.name);
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

  const handleExampleFileLoad = async (filePath: string) => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const content = await response.text();
      const fileName = filePath.split('/').pop();
      await handleParseEvents(content, fileName);
    } catch (error) {
      console.error("Error loading example file:", error);
      toast({
        title: "Load Error",
        description: "Could not load the selected example schedule.",
        variant: "destructive"
      });
    }
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

  const handleLoadFile = (file: StoredCalendarFile) => {
    handleParseEvents(file.content, file.name);
  };

  const handleDeleteFile = (fileName: string) => {
    removeCalendarFile(fileName);
    setSavedFiles(getSavedCalendarFiles());
    toast({
      title: "File Removed",
      description: `${fileName} has been removed from your saved list.`,
    });
  };

  const { viewStart, viewEnd } = useMemo(() => {
    return getEventTimeRange(allEvents, eventDate);
  }, [allEvents, eventDate]);

  useEffect(() => {
    if (allEvents.length > 0) {
      const rows = processEventsForLayout(allEvents, viewStart, viewEnd);
      setEventRows(rows);
    } else {
      setEventRows([]);
    }
  }, [allEvents, viewStart, viewEnd]);
  
  const hasEvents = allEvents.length > 0;

  return (
    <>
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
                        max={15}
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
                        max={15}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <FileUploader onFileSelect={handleFileSelect} />
              <ExampleSchedules onFileSelect={handleExampleFileLoad} />
            </div>
            <PreviousUploads 
              files={savedFiles}
              onLoadFile={handleLoadFile}
              onDeleteFile={handleDeleteFile}
            />
          </div>
        )}
      </main>
      <footer className="py-8 text-center text-muted-foreground">
        <a 
          href="https://github.com/DrunkenCloud/schedule_flow" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
        >
          Made with Firebase Studio by DrunkenCloud <Github className="w-5 h-5" />
        </a>
      </footer>
    </>
  );
}

    