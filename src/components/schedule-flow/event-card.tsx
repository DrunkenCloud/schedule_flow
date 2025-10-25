"use client";

import { CalendarEvent } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, differenceInMilliseconds } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CalendarEvent;
  viewStart: Date;
  viewEnd: Date;
  row: number;
}

const EVENT_HEIGHT = 48; // h-12
const ROW_GAP = 8; // gap-2

export function EventCard({ event, viewStart, viewEnd, row }: EventCardProps) {
  const totalViewDuration = differenceInMilliseconds(viewEnd, viewStart);

  const leftOffset = Math.max(event.start.getTime(), viewStart.getTime());
  const rightOffset = Math.min(event.end.getTime(), viewEnd.getTime());
  
  const width = ((rightOffset - leftOffset) / totalViewDuration) * 100;
  const left = ((leftOffset - viewStart.getTime()) / totalViewDuration) * 100;

  const top = row * (EVENT_HEIGHT + ROW_GAP);

  // Simple hashing for color variety from theme's chart colors
  const colorIndex = (event.summary.charCodeAt(0) || 0) % 5 + 1;
  const colorClass = `bg-chart-${colorIndex}`;
  const textClass = 'text-primary-foreground';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute rounded-lg px-3 py-1 text-sm shadow-md transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer flex items-center gap-2 overflow-hidden",
              colorClass,
              textClass
            )}
            style={{
              top: `${top}px`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${EVENT_HEIGHT}px`,
              minWidth: '20px'
            }}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="truncate font-semibold">{event.summary}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs z-50 bg-popover text-popover-foreground rounded-lg shadow-lg p-4">
          <p className="font-bold text-lg mb-2">{event.summary}</p>
          <p className="text-sm text-muted-foreground">
            {format(event.start, "EEE, MMM d, h:mm a")} -{" "}
            {format(event.end, "h:mm a")}
          </p>
          {event.location && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              {event.location}
            </p>
          )}
          {event.description && (
             <p className="mt-2 text-sm whitespace-pre-wrap">{event.description}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
