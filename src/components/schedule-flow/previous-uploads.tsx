"use client";

import { type StoredCalendarFile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Trash2, FileClock, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PreviousUploadsProps {
  files: StoredCalendarFile[];
  onLoadFile: (file: StoredCalendarFile) => void;
  onDeleteFile: (fileName: string) => void;
}

export function PreviousUploads({ files, onLoadFile, onDeleteFile }: PreviousUploadsProps) {
  return (
    <Card className={!files || files.length === 0 ? 'hidden lg:block' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-6 h-6" />
          Previously Uploaded
        </CardTitle>
        <CardDescription>
          {files && files.length > 0 
            ? "Select one of your previously used .ics files to load it instantly."
            : "Your previously uploaded schedules will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files && files.length > 0 ? (
          <ul className="space-y-3">
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileClock className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last used: {formatDistanceToNow(new Date(file.addedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onLoadFile(file)}
                  >
                    Load
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteFile(file.name)}
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <List className="w-10 h-10 mb-3" />
            <p>No files yet!</p>
            <p className="text-sm">Upload a schedule to save it here for next time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    