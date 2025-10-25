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
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-6 h-6" />
          Previously Uploaded
        </CardTitle>
        <CardDescription>
          Select one of your previously used .ics files to load it instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {files.map((file) => (
            <li key={file.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileClock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Last used: {formatDistanceToNow(new Date(file.addedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
      </CardContent>
    </Card>
  );
}
