# StudyFlow - Study Tracker & Productivity App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Stopwatch with Start / Pause / Stop / Reset controls
- Daily session tracking: total study duration, total break time, number of stops (pauses)
- To-do list: add tasks, mark complete (strikethrough), delete tasks
- Daily motivational quote displayed prominently (rotates each day from a curated list)
- Analytics dashboard: bar/line charts for study duration broken down by Day, Week, Month
- All data persisted in the backend (sessions, to-do items)

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- `StudySession` record: date (Text), studySeconds (Nat), breakSeconds (Nat), stopCount (Nat)
- `TodoItem` record: id (Nat), text (Text), completed (Bool), createdAt (Int)
- `saveDailySession(date, studySeconds, breakSeconds, stopCount)` - upsert daily session
- `getDailySessions()` - return all sessions sorted by date
- `addTodo(text)` - add new to-do item
- `toggleTodo(id)` - toggle completed flag
- `deleteTodo(id)` - remove to-do item
- `getTodos()` - return all to-do items

### Frontend
- Layout: sidebar nav with tabs: Timer | Tasks | Reports
- Timer page: large stopwatch display, mode indicator (Studying / Break), action buttons, today's stats (study time, break time, stops)
- Tasks page: input to add task, list of tasks with checkbox (strikethrough on complete), delete button
- Reports page: toggle between Daily / Weekly / Monthly view, bar chart of study hours using recharts
- Motivational quote banner at the top of every page, changes daily based on date hash from a curated list of 30+ quotes
- Vibrant color scheme with gradients, bold typography, animated elements
