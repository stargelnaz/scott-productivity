# Project Plan: Manual Email Triage Tool

## Goal
Build a high-performance, keyboard-driven triage tool for processing large volumes of work emails that are manually "cut and pasted" from Outlook.

## Architecture
- **Framework:** React + Vite (TypeScript)
- **Styling:** Vanilla CSS (focused on high density and speed)
- **State:** LocalStorage for persistence (no backend needed initially)

## Key Features
1. **Inbox Parser:**
   - A dedicated input area to paste raw text from Outlook.
   - Robust parsing logic to extract Sender, Subject, and Date from common Outlook copy-paste formats.
2. **Triage Interface:**
   - Single-item focused view ("Zen mode") for rapid decision making.
   - High-density list view for scanning.
   - **Keyboard Shortcuts:**
     - `j`/`k`: Navigate next/previous.
     - `a`: Mark as "Actioned/Done".
     - `d`: Mark for "Delete/Archive".
     - `s`: Mark for "Follow-up/Snooze".
3. **Progress Tracking:**
   - Visual indicator of remaining vs. processed emails (e.g., "12/900").
   - Categorized buckets (Done, Delete, Follow-up).
4. **Export/Reporting:**
   - Copy a list of "Follow-up" items back to clipboard.

## Visual Design
- Minimalist, dark mode optimized.
- High-contrast focus states.
- Clean typography for readability.

## Implementation Steps
1. **Step 1:** Create the "Capture" component for pasting and parsing.
2. **Step 2:** Implement the core state management (storing the list in LocalStorage).
3. **Step 3:** Build the Triage UI with keyboard shortcut listeners.
4. **Step 4:** Add filtering and "Buckets" (Done, Trash, Follow-up).
5. **Step 5:** Final styling and polish.
