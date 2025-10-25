"use client";

import React from 'react';
import { type CalendarEvent, type EventRow } from "@/lib/types";
import { EventCard } from "./event-card";
import { format, addHours, differenceInHours } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimelineProps {
  eventRows: EventRow[];
  viewStart: Date;
  viewEnd: Date;
  zoomLevel: number;
  heightZoomLevel: number;
  selectedEvents: Set<string>;
  onEventSelect: (eventId: string) => void;
  className?: string;
}

const BASE_EVENT_HEIGHT = 28; // h-7
const PADDING_Y = 8; // py-2
const ROW_GAP = 8;
const BASE_HOUR_WIDTH = 100;

export function Timeline({ eventRows, viewStart, viewEnd, zoomLevel, heightZoomLevel, selectedEvents, onEventSelect, className }: TimelineProps) {
  const [rowDimensions, setRowDimensions] = React.useState<{ height: number; top: number }[]>([]);
  
  const timelineRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const newRowDimensions: { height: number; top: number }[] = [];
    const baseRowHeight = (BASE_EVENT_HEIGHT + PADDING_Y) * heightZoomLevel;
    const rowGap = ROW_GAP * heightZoomLevel;
    let cumulativeTop = rowGap;

    for (let i = 0; i < eventRows.length; i++) {
      const row = eventRows[i];
      if (!row || row.length === 0) continue;
      
      const rowHeight = baseRowHeight;

      newRowDimensions.push({
        height: rowHeight,
        top: cumulativeTop,
      });
      cumulativeTop += rowHeight + rowGap;
    }
    
    setRowDimensions(newRowDimensions);
  }, [eventRows, zoomLevel, heightZoomLevel]);
  

  const timelineHeight = rowDimensions.length > 0 
    ? rowDimensions[rowDimensions.length - 1].top + rowDimensions[rowDimensions.length - 1].height + (ROW_GAP * heightZoomLevel)
    : 0;

  const hoursInView = Math.ceil(differenceInHours(viewEnd, viewStart));
  const hours = Array.from({ length: hoursInView }, (_, i) => addHours(viewStart, i));

  const hourWidth = BASE_HOUR_WIDTH * zoomLevel;
  const totalWidth = hourWidth * hoursInView;

  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div ref={timelineRef} className="relative p-4" style={{ minWidth: `${totalWidth}px` }}>
          {/* Hour Markers */}
          <div
            className="relative grid h-12 border-b"
            style={{
              gridTemplateColumns: `repeat(${hoursInView}, minmax(0, 1fr))`,
            }}
          >
            {hours.map((hour, index) => (
              <div key={index} className="flex flex-col items-start justify-end p-2 border-r">
                <span className="text-sm font-medium text-muted-foreground">
                  {format(hour, "ha")}
                </span>
              </div>
            ))}
          </div>

          {/* Events Grid */}
          <div className="relative" style={{ height: `${timelineHeight}px` }}>
            {/* Vertical Grid Lines */}
            <div
              className="absolute inset-0 grid opacity-50"
              style={{
                gridTemplateColumns: `repeat(${hoursInView}, minmax(0, 1fr))`,
              }}
            >
              {hours.map((_, index) => (
                <div key={`grid-${index}`} className="h-full border-r"></div>
              ))}
            </div>

            {eventRows.map((row, rowIndex) =>
              row.map((event) => {
                const dims = rowDimensions[rowIndex];
                if (!dims) return null;
                const isSelected = selectedEvents.has(event.id);
                return (
                  <EventCard
                    key={`${event.id}-${rowIndex}`}
                    event={event}
                    viewStart={viewStart}
                    viewEnd={viewEnd}
                    top={dims.top}
                    height={dims.height}
                    isSelected={isSelected}
                    onSelect={onEventSelect}
                  />
                );
              })
            )}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {eventRows.length === 0 && (
        <div className="flex items-center justify-center h-48 text-muted-foreground border border-dashed rounded-md mt-4">
          No events to display for the selected period.
        </div>
      )}
    </div>
  );
}
