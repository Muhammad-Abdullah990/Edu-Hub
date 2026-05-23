# Task Progress Checklist

## Issue 1: WhatsApp Button Position
- [x] Investigate component code (packages/ui/src/components/ui/whatsapp-button.tsx)
- [x] Check Layout.tsx for rendering context
- [ ] Fix bottom spacing (bottom-24 -> bottom-6 on mobile)
- [ ] Verify positioning

## Issue 2: New Students Not in Attendance
- [x] Trace create-student flow (Users tab -> POST /users -> users service -> students table)
- [x] Trace attendance flow (AttendancePanel -> GET /api/attendance/all -> attendance repo -> students table)
- [x] Identify root cause
- [ ] Fix data flow
- [ ] Verify after fix

## Issue 3: Reports Only Show Pre-created Students
- [x] Trace reports flow
- [x] Identify root cause
- [ ] Fix data flow

## Issue 4: Dashboard Student Count
- [x] Identify dashboard metrics component
- [ ] Fix count logic

## Verification
- [ ] Start backend server
- [ ] Start frontend
- [ ] Test all fixes
- [ ] Verify DB consistency
- [ ] Generate final report