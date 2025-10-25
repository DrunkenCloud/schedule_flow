"use client";

import { type EventRow } from "@/lib/types";
import { EventCard } from "./event-card";
import { format, addHours, startOfDay } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimelineProps {
  eventRows: EventRow[];
  viewStart: Date;
  viewEnd: Date;
  className?: string;
}

const EVENT_HEIGHT = 48;
const ROW_GAP = 8;
const HOURS_IN_VIEW = 24;

export function Timeline({ eventRows, viewStart, viewEnd, className }: TimelineProps) {
  const timelineHeight = eventRows.length * (EVENT_HEIGHT + ROW_GAP) + ROW_GAP;
  const hours = Array.from({ length: HOURS_IN_VIEW }, (_, i) => addHours(startOfDay(viewStart), i));

  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="relative p-4" style={{ minWidth: "2000px" }}>
          {/* Hour Markers */}
          <div className="relative grid grid-cols-[repeat(24,minmax(0,1fr))] h-12 border-b">
            {hours.map((hour, index) => (
              <div key={index} className="flex flex-col items-center justify-end p-2 border-r">
                <span className="text-sm font-medium text-muted-foreground">
                  {format(hour, "ha")}
                </span>
              </div>
            ))}
          </div>

          {/* Events Grid */}
          <div className="relative" style={{ height: `${timelineHeight}px` }}>
            {/* Vertical Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-[repeat(24,minmax(0,1fr))] opacity-50">
              {hours.map((_, index) => (
                <div key={`grid-${index}`} className="h-full border-r"></div>
              ))}
            </div>

            {eventRows.map((row, rowIndex) =>
              row.map((event) => (
                <EventCard
                  key={`${event.id}-${rowIndex}`}
                  event={event}
                  viewStart={viewStart}
                  viewEnd={viewEnd}
                  row={rowIndex}
                />
              ))
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
