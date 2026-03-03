# NORCET Nursing Exam Prep

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full NORCET nursing exam prep web app (mobile-first, responsive)
- 15 nursing subjects per official NORCET syllabus
- Per-subject: topics list, video lectures (via URL), optional text notes
- Admin panel: add/edit/remove subjects, topics, video links, notes
- Student features: search by subject/topic, recently watched, bookmarks/favorites
- Video playback with last-watched position memory (localStorage)
- Dark mode toggle
- Authorization system: admin vs student roles

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- Subject type: id, name, description, order
- Topic type: id, subjectId, title, videoUrl, notes, order
- CRUD for subjects and topics (admin only)
- Query: getAllSubjects, getTopicsBySubject, searchTopics
- User progress: bookmarks (userId + topicId), recently watched (userId + topicId + timestamp)
- Authorization: admin role check on mutating calls

### Frontend
- Mobile-first layout, large touch targets, light nursing theme (soft blues/greens)
- Dark mode toggle persisted in localStorage
- Home screen: subject grid cards with icons
- Subject detail: topic list with video/notes indicators
- Topic detail: video player (iframe embed), notes section, bookmark toggle
- Recently watched page
- Bookmarks/favorites page
- Search bar on home (filters subjects and topics)
- Admin panel: subject manager, topic manager with video URL input
- Video position saved to localStorage keyed by topicId
