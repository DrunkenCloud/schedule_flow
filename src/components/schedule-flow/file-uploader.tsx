"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export function FileUploader({ onFileSelect, className }: FileUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.ics')) {
      onFileSelect(file);
    }
  };
  
  const handleLabelClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload Your Schedule</CardTitle>
        <CardDescription>
          Select or drag and drop your .ics calendar file to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label
          htmlFor="ics-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleLabelClick}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLabelClick(); }}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">.ICS files only</p>
          </div>
          <Input
            id="ics-upload"
            type="file"
            className="hidden"
            accept=".ics"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </Label>
      </CardContent>
    </Card>
  );
}
