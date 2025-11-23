# Firebase Database Structure - Student Management System

## 📊 Complete Database Architecture

This document describes the improved Firebase Firestore database structure for your Student Management System.

---

## 🗂️ Collections Overview

Your Firebase database now has **5 main collections**:

1. **students** - Student records
2. **stages** - Academic years/semesters
3. **courses** - Course catalog
4. **enrollments** - Student course enrollments
5. **attendance** - Attendance tracking records

---

## 📋 Detailed Collection Structures

### 1. **students** Collection

Stores all student information.

```
students/
  └── {studentId}/
      ├── id: string
      ├── name: string
      ├── age: number
      ├── email: string
      ├── phone: string (optional)
      ├── address: string (optional)
      ├── stage_id: string (references stages/{stageId})
      ├── status: string ("active" | "inactive" | "graduated")
      ├── enrollmentDate: timestamp
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

**Example Document:**
```json
{
  "id": "abc123",
  "name": "John Doe",
  "age": 20,
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "stage_id": "stage456",
  "status": "active",
  "enrollmentDate": "2024-09-01T00:00:00Z",
  "createdAt": "2024-09-01T10:30:00Z",
  "updatedAt": "2024-09-01T10:30:00Z"
}
```

---

### 2. **stages** Collection

Academic years or semesters (e.g., Year 1, Semester 2).

```
stages/
  └── {stageId}/
      ├── id: string
      ├── name: string (e.g., "First Year", "Semester 1")
      ├── level: number (1, 2, 3, 4...)
      ├── academicYear: string (e.g., "2024-2025")
      └── createdAt: timestamp
```

**Example Document:**
```json
{
  "id": "stage456",
  "name": "First Year",
  "level": 1,
  "academicYear": "2024-2025",
  "createdAt": "2024-08-15T00:00:00Z"
}
```

---

### 3. **courses** Collection

Course catalog with enhanced metadata.

```
courses/
  └── {courseId}/
      ├── id: string
      ├── name: string
      ├── code: string (e.g., "CS101")
      ├── credits: number (default: 3)
      ├── stageId: string (references stages/{stageId})
      ├── instructorName: string (optional)
      ├── description: string (optional)
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

**Example Document:**
```json
{
  "id": "course789",
  "name": "Introduction to Computer Science",
  "code": "CS101",
  "credits": 3,
  "stageId": "stage456",
  "instructorName": "Dr. Smith",
  "description": "Basic programming concepts",
  "createdAt": "2024-08-20T00:00:00Z",
  "updatedAt": "2024-08-20T00:00:00Z"
}
```

---

### 4. **enrollments** Collection

Links students to courses (many-to-many relationship).

```
enrollments/
  └── {enrollmentId}/
      ├── id: string
      ├── studentId: string (references students/{studentId})
      ├── courseId: string (references courses/{courseId})
      ├── stageId: string (references stages/{stageId})
      ├── enrolledAt: timestamp
      ├── grade: string (optional: "A", "B", "C", "D", "F")
      ├── status: string ("enrolled" | "completed" | "dropped")
      └── finalScore: number (optional)
```

**Example Document:**
```json
{
  "id": "enroll001",
  "studentId": "abc123",
  "courseId": "course789",
  "stageId": "stage456",
  "enrolledAt": "2024-09-01T00:00:00Z",
  "grade": "A",
  "status": "enrolled",
  "finalScore": 95
}
```

---

### 5. **attendance** Collection

**NEW**: Top-level collection for attendance tracking.

```
attendance/
  └── {attendanceId}/
      ├── id: string
      ├── studentId: string (references students/{studentId})
      ├── courseId: string (references courses/{courseId})
      ├── date: timestamp
      ├── status: string ("present" | "absent" | "late" | "excused")
      ├── notes: string (optional)
      ├── markedBy: string ("instructor" | "system")
      └── createdAt: timestamp
```

**Example Document:**
```json
{
  "id": "attend123",
  "studentId": "abc123",
  "courseId": "course789",
  "date": "2024-11-23T10:00:00Z",
  "status": "present",
  "notes": "",
  "markedBy": "instructor",
  "createdAt": "2024-11-23T10:05:00Z"
}
```

---

## 🔗 Relationship Diagram

```
┌─────────────┐
│   STAGES    │
│  (Years)    │
├─────────────┤
│ • id        │
│ • name      │◄─────────┐
│ • level     │          │
│ • year      │          │ References
└─────────────┘          │
       ▲                 │
       │                 │
       │ References      │
       │                 │
┌──────┴──────┐   ┌──────┴──────┐
│  STUDENTS   │   │   COURSES   │
├─────────────┤   ├─────────────┤
│ • id        │   │ • id        │
│ • name      │   │ • name      │
│ • email     │   │ • code      │
│ • stageId   │   │ • stageId   │
│ • status    │   │ • credits   │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 │
       │  ┌──────────────┘
       │  │
       │  │ Both reference
       │  │
    ┌──▼──▼──────┐
    │ ENROLLMENTS│
    ├────────────┤
    │ • studentId│
    │ • courseId │
    │ • stageId  │
    │ • grade    │
    └──────┬─────┘
           │
           │ Both reference
           │
    ┌──────▼─────┐
    │ ATTENDANCE │
    ├────────────┤
    │ • studentId│
    │ • courseId │
    │ • date     │
    │ • status   │
    └────────────┘
```

---

## 🎯 Key Improvements Made

### ✅ Better Organization
- **Stages** now have level and academicYear for better sorting
- **Courses** linked to stages for academic structure
- **Courses** include code, credits, instructor, and description

### ✅ Improved Attendance
- **Top-level collection** (no subcollections - easier to query)
- Track attendance by student + course + date
- Multiple status options (present/absent/late/excused)
- Optional notes for each attendance record

### ✅ Enhanced Courses
- Course codes (CS101, MATH202, etc.)
- Credit hours tracking
- Stage assignment
- Instructor information

### ✅ Scalable Structure
- Easy to query all students in a stage
- Easy to query all courses for a stage
- Easy to generate attendance reports
- Easy to calculate student statistics

---

## 📝 Common Queries

### Get all students in a specific stage
```javascript
const students = await studentService.getStudentsByStage(stageId);
```

### Get all courses for a specific stage
```javascript
const courses = await courseService.getCoursesByStage(stageId);
```

### Get attendance for a student in a course
```javascript
const attendance = await attendanceService.getStudentAttendance(studentId, courseId);
```

### Get all attendance for a course on a date
```javascript
const records = await attendanceService.getCourseAttendance(courseId, date);
```

### Get attendance statistics
```javascript
const stats = await attendanceService.getAttendanceStats(studentId, courseId);
// Returns: { total, present, absent, late, excused, percentage }
```

---

## 🚀 Pages Updated/Created

### New Pages:
1. **ManageStages.vue** - Manage academic stages/years

### Updated Pages:
1. **ManageCourses.vue** - Now includes stage, code, credits, instructor
2. **AttendanceTracking.vue** - Already existed, now uses new attendance structure
3. **AddStudent.vue** - Already had stage selection

### Navigation:
- Route added: `/manage-stages`
- Access from main navigation (admin only)

---

## 🎨 How to Visualize for Submission

### Option 1: Using draw.io
1. Go to https://app.diagrams.net/
2. Create 5 boxes for each collection
3. Add fields inside each box
4. Draw arrows showing relationships
5. Export as PNG or PDF

### Option 2: Using Lucidchart
1. Go to https://www.lucidchart.com/
2. Use Entity-Relationship Diagram template
3. Create entities for each collection
4. Add relationships with labeled arrows
5. Export as image

### Option 3: Text-based (for documentation)
Use the ASCII diagram provided in this document

---

## 📊 Summary Statistics

- **Collections**: 5 main collections
- **Relationships**: 4 key relationships
- **Fields per Collection**: 7-10 fields average
- **Query Patterns**: Optimized for common operations
- **Scalability**: Designed for growth

---

## ✨ Next Steps

1. **Populate Stages** - Add your academic years/semesters
2. **Update Courses** - Add stage, code, and credits to existing courses
3. **Test Attendance** - Mark attendance for a course
4. **Generate Reports** - Use the new queries to create reports

---

**Database Structure Version**: 2.0
**Last Updated**: November 23, 2024
**Status**: Production Ready ✅
