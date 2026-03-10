# StudyFlow

## Current State
- Planner (subjects/topics) uses localStorage keyed by principal — does not survive if browser storage is cleared; not truly server-side
- TimerTab has no alarm when break exceeds 15 minutes
- TasksTab shows task list but has no summary stats

## Requested Changes (Diff)

### Add
- Backend: Subject and Topic types + CRUD functions stored per-user in the canister
- Frontend: new hooks for planner backend queries
- TimerTab: break-exceed-15min alarm with toast + audio beep
- TasksTab: stats panel showing total/completed/pending/completion rate

### Modify
- useSubjectPlanner.ts: rewrite to use backend queries instead of localStorage

### Remove
- localStorage-based planner persistence

## Implementation Plan
1. Add Subject/Topic backend functions to main.mo
2. Add planner query hooks to useQueries.ts
3. Rewrite useSubjectPlanner.ts to use React Query + backend
4. Add break alarm logic to TimerTab
5. Add task stats panel to TasksTab
