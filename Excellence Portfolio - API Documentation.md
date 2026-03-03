# Excellence Portfolio - API Documentation

## Overview

This document describes the API contract required for the Excellence Portfolio Chrome Extension. The extension communicates with a backend server to manage evidence, indicators, tasks, and exports.

**Base URL**: `https://your-backend-domain.com/api`

**Authentication**: JWT Bearer Token in Authorization header

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT token.

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@school.edu.sa",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "أحمد محمد",
    "email": "teacher@school.edu.sa",
    "role": "teacher",
    "schoolId": "school-456"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

---

### GET /me

Get current authenticated user information.

**Request**:
```http
GET /api/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "id": "user-123",
  "name": "أحمد محمد",
  "email": "teacher@school.edu.sa",
  "role": "teacher",
  "schoolId": "school-456"
}
```

---

## Domain, Standard & Indicator Endpoints

### GET /domains

Get all domains with optional nested standards and indicators.

**Request**:
```http
GET /api/domains?include=standards,indicators
Authorization: Bearer [token]
```

**Query Parameters**:
- `include` (optional): Comma-separated list of nested resources
  - `standards`: Include standards in each domain
  - `indicators`: Include indicators in each standard (requires standards)

**Response** (200 OK):
```json
{
  "domains": [
    {
      "id": "domain-1",
      "name": "القيادة والحوكمة",
      "standards": [
        {
          "id": "standard-1",
          "name": "الرؤية والرسالة",
          "indicators": [
            {
              "id": "indicator-1",
              "name": "وضوح الرؤية والرسالة",
              "level": 2,
              "target": 4
            }
          ]
        }
      ]
    }
  ]
}
```

---

### GET /indicators

Get indicators with optional filtering.

**Request**:
```http
GET /api/indicators?domainId=domain-1&standardId=standard-1
Authorization: Bearer [token]
```

**Query Parameters**:
- `domainId` (optional): Filter by domain ID
- `standardId` (optional): Filter by standard ID

**Response** (200 OK):
```json
{
  "indicators": [
    {
      "id": "indicator-1",
      "name": "وضوح الرؤية والرسالة",
      "level": 2,
      "target": 4,
      "domainId": "domain-1",
      "domainName": "القيادة والحوكمة",
      "standardId": "standard-1",
      "standardName": "الرؤية والرسالة"
    }
  ]
}
```

---

## Evidence Endpoints

### POST /evidence

Upload new evidence (supports multipart file upload).

**Request**:
```http
POST /api/evidence
Authorization: Bearer [token]
Content-Type: multipart/form-data

indicatorId: "indicator-1"
type: "screenshot" | "file" | "link" | "note"
description: "صورة من تطبيق مدرستي"
category: "planning" | "implementation" | "monitoring" | "impact"
metadata: {"url": "https://madrasati.edu.sa", "platform": "Madrasati"}
file: <binary data> (only for type: "file" or "screenshot")
```

**Response** (201 Created):
```json
{
  "id": "evidence-123",
  "userId": "user-123",
  "indicatorId": "indicator-1",
  "type": "screenshot",
  "description": "صورة من تطبيق مدرستي",
  "category": "implementation",
  "metadata": {
    "url": "https://madrasati.edu.sa",
    "platform": "Madrasati",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "fileUrl": "/uploads/evidence-123.png",
  "status": "draft",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "auditLog": [
    {
      "action": "created",
      "userId": "user-123",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /evidence

Get evidence list with optional filtering.

**Request**:
```http
GET /api/evidence?indicatorId=indicator-1&status=draft&weekOnly=true
Authorization: Bearer [token]
```

**Query Parameters**:
- `indicatorId` (optional): Filter by indicator
- `status` (optional): Filter by status (draft, submitted, reviewed, approved)
- `weekOnly` (optional): Only evidence from last 7 days
- `domainId` (optional): Filter by domain
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200 OK):
```json
{
  "evidence": [
    {
      "id": "evidence-123",
      "userId": "user-123",
      "indicatorId": "indicator-1",
      "type": "screenshot",
      "description": "صورة من تطبيق مدرستي",
      "status": "draft",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### PATCH /evidence/{id}

Update evidence status or details.

**Request**:
```http
PATCH /api/evidence/evidence-123
Authorization: Bearer [token]
Content-Type: application/json

{
  "status": "submitted" | "reviewed" | "approved",
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "id": "evidence-123",
  "status": "submitted",
  "description": "Updated description",
  "updatedAt": "2024-01-15T11:00:00Z",
  "auditLog": [
    {
      "action": "created",
      "userId": "user-123",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "action": "status_changed",
      "userId": "user-456",
      "newStatus": "submitted",
      "timestamp": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

## Task Endpoints

### POST /tasks

Create a new task.

**Request**:
```http
POST /api/tasks
Authorization: Bearer [token]
Content-Type: application/json

{
  "title": "تحسين الرؤية والرسالة",
  "description": "يجب تحديث الرؤية والرسالة لتعكس الواقع الحالي",
  "indicatorId": "indicator-1",
  "dueDate": "2024-02-15",
  "assignee": "user-456",
  "priority": "high" | "medium" | "low"
}
```

**Response** (201 Created):
```json
{
  "id": "task-123",
  "userId": "user-123",
  "title": "تحسين الرؤية والرسالة",
  "description": "يجب تحديث الرؤية والرسالة لتعكس الواقع الحالي",
  "indicatorId": "indicator-1",
  "dueDate": "2024-02-15",
  "assignee": "user-456",
  "priority": "high",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### GET /tasks

Get tasks with optional filtering.

**Request**:
```http
GET /api/tasks?status=pending&overdue=false
Authorization: Bearer [token]
```

**Query Parameters**:
- `status` (optional): Filter by status (pending, in_progress, completed)
- `overdue` (optional): Only overdue tasks
- `assignee` (optional): Filter by assignee user ID
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": "task-123",
      "title": "تحسين الرؤية والرسالة",
      "dueDate": "2024-02-15",
      "assignee": "user-456",
      "priority": "high",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

## Export Endpoints

### POST /export/pdf

Initiate PDF export job.

**Request**:
```http
POST /api/export/pdf
Authorization: Bearer [token]
Content-Type: application/json

{
  "scope": "full" | "domain" | "indicator",
  "domainId": "domain-1",      // required if scope is "domain"
  "indicatorId": "indicator-1" // required if scope is "indicator"
}
```

**Response** (202 Accepted):
```json
{
  "id": "export-job-123",
  "userId": "user-123",
  "type": "pdf",
  "scope": "full",
  "status": "processing",
  "createdAt": "2024-01-15T10:30:00Z",
  "url": null
}
```

**Poll for completion**:
```http
GET /api/export/export-job-123
Authorization: Bearer [token]
```

**Response when completed** (200 OK):
```json
{
  "id": "export-job-123",
  "type": "pdf",
  "scope": "full",
  "status": "completed",
  "url": "https://your-domain.com/exports/export-job-123.pdf",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:32:00Z"
}
```

---

### POST /export/improvement-plan-docx

Initiate improvement plan DOCX export job.

**Request**:
```http
POST /api/export/improvement-plan-docx
Authorization: Bearer [token]
Content-Type: application/json

{
  "scope": "full" | "domain",
  "domainId": "domain-1" // required if scope is "domain"
}
```

**Response** (202 Accepted):
```json
{
  "id": "export-job-456",
  "userId": "user-123",
  "type": "docx",
  "scope": "full",
  "status": "processing",
  "createdAt": "2024-01-15T10:30:00Z",
  "url": null
}
```

**Response when completed** (200 OK):
```json
{
  "id": "export-job-456",
  "type": "docx",
  "scope": "full",
  "status": "completed",
  "url": "https://your-domain.com/exports/export-job-456.docx",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:00Z"
}
```

---

### GET /export/{jobId}

Get export job status and download URL.

**Request**:
```http
GET /api/export/export-job-123
Authorization: Bearer [token]
```

**Response** (200 OK):
```json
{
  "id": "export-job-123",
  "type": "pdf",
  "scope": "full",
  "status": "completed",
  "url": "https://your-domain.com/exports/export-job-123.pdf",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:32:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": {
    "field": "indicatorId",
    "message": "indicatorId is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Evidence not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Limit**: 1000 requests per hour per user
- **Headers**:
  - `X-RateLimit-Limit`: 1000
  - `X-RateLimit-Remaining`: 999
  - `X-RateLimit-Reset`: 1705334400

---

## Pagination

For list endpoints, use `limit` and `offset` parameters:

```http
GET /api/evidence?limit=20&offset=0
```

Response includes:
```json
{
  "evidence": [...],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

---

## File Upload

### Supported File Types
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`
- Maximum file size: 50MB

### Upload Response
```json
{
  "fileUrl": "/uploads/evidence-123.pdf",
  "fileName": "evidence-123.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

---

## Data Models

### User
```json
{
  "id": "user-123",
  "name": "أحمد محمد",
  "email": "teacher@school.edu.sa",
  "role": "teacher|coordinator|leader|deputy|counselor|activity_leader",
  "schoolId": "school-456",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Domain
```json
{
  "id": "domain-1",
  "name": "القيادة والحوكمة",
  "description": "...",
  "standards": [...]
}
```

### Standard
```json
{
  "id": "standard-1",
  "name": "الرؤية والرسالة",
  "domainId": "domain-1",
  "indicators": [...]
}
```

### Indicator
```json
{
  "id": "indicator-1",
  "name": "وضوح الرؤية والرسالة",
  "standardId": "standard-1",
  "level": 2,
  "target": 4,
  "description": "..."
}
```

### Evidence
```json
{
  "id": "evidence-123",
  "userId": "user-123",
  "indicatorId": "indicator-1",
  "type": "screenshot|file|link|note",
  "description": "...",
  "category": "planning|implementation|monitoring|impact",
  "status": "draft|submitted|reviewed|approved",
  "fileUrl": "/uploads/...",
  "metadata": {
    "url": "...",
    "platform": "Madrasati|Noor",
    "timestamp": "..."
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "auditLog": [...]
}
```

### Task
```json
{
  "id": "task-123",
  "userId": "user-123",
  "title": "...",
  "description": "...",
  "indicatorId": "indicator-1",
  "dueDate": "2024-02-15",
  "assignee": "user-456",
  "priority": "high|medium|low",
  "status": "pending|in_progress|completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Implementation Notes

1. **Authentication**: All endpoints (except `/auth/login`) require a valid JWT token
2. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
3. **Pagination**: Default limit is 50, maximum is 100
4. **Filtering**: Multiple filters can be combined
5. **Sorting**: Default sort is by creation date (descending)
6. **CORS**: Enable CORS headers for browser requests
7. **HTTPS**: All production endpoints must use HTTPS

---

## Testing

Use the mock API server included in the project:

```bash
npm install
npm start
```

The mock server will run on `http://localhost:3000` with test data pre-loaded.

