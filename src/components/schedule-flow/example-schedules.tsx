"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

interface ExampleSchedulesProps {
  onFileSelect: (filePath: string) => void;
}

const exampleFiles = [
  { name: "Devfest Chennai", path: "/schedules/Devfest_Chennai.ics" },
];

export function ExampleSchedules({ onFileSelect }: ExampleSchedulesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="w-6 h-6" />
          Try an Example
        </CardTitle>
        <CardDescription>
          Don't have an .ics file handy? Try one of these samples to see how it works.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {exampleFiles.map((file) => (
            <li key={file.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{file.name}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onFileSelect(file.path)}
                >
                  Load Example
                </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
