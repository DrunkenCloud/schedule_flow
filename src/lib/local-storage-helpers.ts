"use client";

import { type StoredCalendarFile } from "./types";

const STORAGE_KEY = "scheduleFlow_savedFiles";

// Helper to safely parse JSON from localStorage
function safeJsonParse<T>(jsonString: string | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON from localStorage:", error);
    return null;
  }
}

/**
 * Retrieves all saved calendar files from localStorage.
 */
export function getSavedCalendarFiles(): StoredCalendarFile[] {
  if (typeof window === "undefined") return [];
  const filesJson = window.localStorage.getItem(STORAGE_KEY);
  const files = safeJsonParse<StoredCalendarFile[]>(filesJson);
  // Sort by most recently added
  return files ? files.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()) : [];
}

/**
 * Saves a new calendar file to localStorage.
 * If a file with the same name already exists, it will be updated.
 * @param fileName - The name of the file (e.g., 'my-schedule.ics').
 * @param content - The raw string content of the .ics file.
 */
export function saveCalendarFile(fileName: string, content: string): void {
  if (typeof window === "undefined") return;
  const files = getSavedCalendarFiles();
  const existingIndex = files.findIndex(f => f.name === fileName);

  const newFile: StoredCalendarFile = {
    name: fileName,
    content: content,
    addedAt: new Date().toISOString(),
  };

  if (existingIndex > -1) {
    // Update existing file to refresh its `addedAt` timestamp and content
    files.splice(existingIndex, 1);
    files.unshift(newFile);
  } else {
    // Add new file to the beginning
    files.unshift(newFile);
  }

  // Optional: Limit the number of saved files to prevent excessive storage use
  const MAX_FILES = 10;
  if (files.length > MAX_FILES) {
    files.length = MAX_FILES;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

/**
 * Removes a calendar file from localStorage.
 * @param fileName - The name of the file to remove.
 */
export function removeCalendarFile(fileName: string): void {
  if (typeof window === "undefined") return;
  const files = getSavedCalendarFiles();
  const updatedFiles = files.filter(f => f.name !== fileName);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
}
