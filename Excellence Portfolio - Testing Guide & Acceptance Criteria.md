# Excellence Portfolio - Testing Guide & Acceptance Criteria

## Test Environment Setup

### Prerequisites

1. **Chrome Browser**: Version 88 or later
2. **Node.js**: Version 14 or later (for mock API server)
3. **Extension Loaded**: Follow README.md installation steps

### Starting the Mock API Server

```bash
# Install dependencies
npm install

# Start the server
npm start

# Server will run on http://localhost:3000
```

### Test Credentials

```
Email: teacher@school.edu.sa
Password: password123

Alternative Account:
Email: coordinator@school.edu.sa
Password: password123
```

---

## Test Data

### Pre-loaded Domains and Indicators

#### Domain 1: القيادة والحوكمة (Leadership & Governance)

**Standard 1: الرؤية والرسالة (Vision & Mission)**
- Indicator 1: وضوح الرؤية والرسالة (Clarity of Vision & Mission)
  - Current Level: 2
  - Target Level: 4
- Indicator 2: توافق الرؤية مع الواقع (Vision Alignment with Reality)
  - Current Level: 2
  - Target Level: 4

**Standard 2: التخطيط الاستراتيجي (Strategic Planning)**
- Indicator 3: جودة الخطة الاستراتيجية (Quality of Strategic Plan)
  - Current Level: 2
  - Target Level: 4

#### Domain 2: المناهج والتدريس (Curriculum & Teaching)

**Standard 3: تطوير المناهج (Curriculum Development)**
- Indicator 4: مواءمة المناهج مع المعايير (Curriculum Alignment with Standards)
  - Current Level: 3
  - Target Level: 4

---

## Acceptance Criteria & Test Cases

### Test Case 1: Floating Button Visibility

**Objective**: Verify that the floating button appears only on supported platforms

**Steps**:
1. Open https://madrasati.edu.sa (or any Madrasati page)
2. Look for the blue floating button labeled "+ إضافة شاهد"
3. Navigate to https://noor.moe.gov.sa
4. Verify the button is visible
5. Navigate to any other website (e.g., google.com)
6. Verify the button is NOT visible

**Expected Results**:
- ✅ Button appears on Madrasati pages
- ✅ Button appears on Noor pages
- ✅ Button does NOT appear on other websites
- ✅ Button is positioned at bottom-right corner
- ✅ Button has hover effects

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 2: Login Functionality

**Objective**: Verify authentication flow

**Steps**:
1. Click extension icon in toolbar
2. Enter email: `teacher@school.edu.sa`
3. Enter password: `password123`
4. Click "دخول" (Login) button
5. Verify dashboard appears
6. Click extension icon again
7. Verify dashboard is shown (not login screen)

**Expected Results**:
- ✅ Login form displays correctly
- ✅ Login succeeds with correct credentials
- ✅ Dashboard displays after login
- ✅ Session persists (no need to login again)
- ✅ User data displays correctly

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 3: Quick Evidence Capture - Screenshot

**Objective**: Verify screenshot capture and tagging workflow

**Steps**:
1. Login to the extension
2. Open a Madrasati page with content
3. Click the floating button "+ إضافة شاهد"
4. Select "📸 لقطة شاشة" (Screenshot)
5. Click "التقط الشاشة" (Capture Screenshot)
6. Verify screenshot preview appears
7. Add description: "صورة من تطبيق مدرستي"
8. Select Domain: "القيادة والحوكمة"
9. Select Standard: "الرؤية والرسالة"
10. Select Indicator: "وضوح الرؤية والرسالة"
11. Select Category: "تنفيذ" (Implementation)
12. Click "حفظ الشاهد" (Save Evidence)
13. Verify success message appears

**Expected Results**:
- ✅ Screenshot captures successfully
- ✅ Preview displays the captured image
- ✅ Form fields populate correctly
- ✅ Domain/Standard/Indicator dropdowns work
- ✅ Evidence saves successfully
- ✅ Success message displays: "تم حفظ الشاهد بنجاح"
- ✅ Form resets after submission

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 4: Evidence Capture - File Upload

**Objective**: Verify file upload functionality

**Steps**:
1. Click floating button
2. Select "📄 ملف" (File)
3. Click file input and select a PDF or image file
4. Verify filename displays
5. Add description
6. Select indicator
7. Click "حفظ الشاهد"

**Expected Results**:
- ✅ File input accepts PDF, images, and documents
- ✅ Filename displays after selection
- ✅ File uploads successfully
- ✅ Evidence saves with file attachment

**Status**: [ ] Pass / / Fail

---

### Test Case 5: Evidence Capture - Link

**Objective**: Verify link evidence capture

**Steps**:
1. Click floating button
2. Select "🔗 رابط" (Link)
3. Enter URL: `https://example.com`
4. Add description: "رابط مهم"
5. Select indicator
6. Click "حفظ الشاهد"

**Expected Results**:
- ✅ URL field validates properly
- ✅ Link evidence saves successfully
- ✅ URL is stored in metadata

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 6: Evidence Capture - Note

**Objective**: Verify text note capture

**Steps**:
1. Click floating button
2. Select "📝 ملاحظة" (Note)
3. Enter note text: "ملاحظة مهمة عن المؤشر"
4. Select indicator
5. Click "حفظ الشاهد"

**Expected Results**:
- ✅ Text area accepts input
- ✅ Note saves successfully
- ✅ Note text is stored

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 7: Evidence Center - View & Filter

**Objective**: Verify evidence listing and filtering

**Steps**:
1. Open side panel
2. Go to "الشواهد" (Evidence) tab
3. Verify previously created evidence appears
4. Use status filter to show only "مسودة" (Draft)
5. Use domain filter
6. Use search box to find specific evidence
7. Click on an evidence item

**Expected Results**:
- ✅ Evidence list displays all created evidence
- ✅ Filters work correctly
- ✅ Search functionality works
- ✅ Evidence details display when clicked
- ✅ Status badges display correctly

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 8: Offline Support - Queue & Sync

**Objective**: Verify offline functionality and sync

**Steps**:
1. Open DevTools (F12)
2. Go to Network tab
3. Set network to "Offline"
4. Click floating button
5. Create a new evidence (screenshot)
6. Add description and select indicator
7. Click "حفظ الشاهد"
8. Verify message: "تم حفظ الشاهد محلياً وسيتم مزامنته عند توفر الإنترنت"
9. Go back online
10. Click "مزامنة" (Sync) button
11. Verify sync message shows success

**Expected Results**:
- ✅ Evidence saves locally when offline
- ✅ Offline message displays
- ✅ Evidence appears in local queue
- ✅ Sync button works when online
- ✅ Evidence syncs to server
- ✅ Success message displays

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 9: PDF Export - Full School

**Objective**: Verify PDF export functionality

**Steps**:
1. Open side panel
2. Go to "التصدير" (Export) tab
3. Select "الملف الكامل للمدرسة" (Full School File)
4. Click "تصدير PDF" (Export PDF)
5. Wait for processing (2-3 seconds)
6. Verify download starts
7. Open downloaded PDF
8. Verify content:
   - Cover page with school name
   - Index of domains
   - Indicators with evidence
   - Evidence grouped by category

**Expected Results**:
- ✅ Export form displays correctly
- ✅ Export starts successfully
- ✅ File downloads with correct name
- ✅ PDF opens and displays content
- ✅ PDF is properly formatted
- ✅ All evidence is included

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 10: PDF Export - Single Indicator

**Objective**: Verify scoped PDF export

**Steps**:
1. Go to Export tab
2. Select "مؤشر واحد" (Single Indicator)
3. Select an indicator from dropdown
4. Click "تصدير PDF"
5. Verify download

**Expected Results**:
- ✅ Indicator dropdown populates
- ✅ Export generates for selected indicator
- ✅ PDF contains only that indicator's evidence

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 11: DOCX Export - Improvement Plan

**Objective**: Verify improvement plan DOCX export with official template

**Steps**:
1. Go to Export tab
2. Scroll to "تصدير خطة التحسين" section
3. Select scope: "الملف الكامل" (Full File)
4. Click "تصدير DOCX" (Export DOCX)
5. Wait for processing
6. Download and open in Word
7. Verify document structure:
   - Basic school information section
   - Performance level section
   - Improvement actions table with exact columns:
     - المجال (Domain)
     - العنصر/المكون (Element/Component)
     - وصف الاحتياج (Need Description)
     - إجراءات التحسين (Improvement Actions)
     - أساليب وطرق التحسين (Methods & Approaches)
     - مدة الإنجاز (Duration)
     - التنفيذ والمسؤولية (Implementation & Responsibility)
   - Recommendations section
   - Signatures section

**Expected Results**:
- ✅ DOCX exports successfully
- ✅ Document opens in Word
- ✅ All sections present
- ✅ Table has exact required columns
- ✅ RTL formatting applied
- ✅ Professional appearance
- ✅ Dynamic rows if data exceeds template rows

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 12: Task Management

**Objective**: Verify task creation and management

**Steps**:
1. Go to "المهام" (Tasks) tab
2. Verify task list displays
3. Use filters: "اليوم" (Today), "هذا الأسبوع" (This Week), "متأخرة" (Overdue)
4. Verify tasks filter correctly

**Expected Results**:
- ✅ Tasks display with correct information
- ✅ Filters work correctly
- ✅ Task status displays
- ✅ Due dates display

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 13: Indicators View

**Objective**: Verify indicators listing and filtering

**Steps**:
1. Go to "المؤشرات" (Indicators) tab
2. Verify all indicators display
3. Use domain filter
4. Use search box
5. Click on an indicator

**Expected Results**:
- ✅ All indicators display with:
  - Title
  - Domain
  - Current level
  - Target level
  - Evidence count
- ✅ Filters work
- ✅ Search works
- ✅ Indicator details display

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 14: Dashboard Metrics

**Objective**: Verify dashboard displays correct metrics

**Steps**:
1. Go to "لوحة التحكم" (Dashboard) tab
2. Verify statistics display:
   - شواهد هذا الأسبوع (Weekly Evidence)
   - معلقة للمراجعة (Pending Review)
   - مهام متأخرة (Overdue Tasks)
   - آخر تصدير (Last Export)
3. Create new evidence
4. Refresh dashboard
5. Verify count updates

**Expected Results**:
- ✅ All statistics display
- ✅ Numbers are accurate
- ✅ Recent activity shows
- ✅ Metrics update after new evidence

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 15: RTL & Arabic Support

**Objective**: Verify complete Arabic RTL support

**Steps**:
1. Review all screens for RTL layout
2. Check all text is in Arabic
3. Verify buttons and controls are positioned correctly for RTL
4. Check form inputs and labels
5. Verify PDF/DOCX exports are RTL

**Expected Results**:
- ✅ All text right-aligned
- ✅ All UI elements positioned for RTL
- ✅ No English text (except technical terms)
- ✅ Arabic fonts display clearly
- ✅ Exports are RTL formatted

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 16: Error Handling

**Objective**: Verify proper error handling

**Steps**:
1. Try login with wrong credentials
2. Try to export without selecting scope
3. Try to add evidence without selecting indicator
4. Try to upload file > 50MB
5. Try to use extension without internet (offline)

**Expected Results**:
- ✅ Clear error messages display
- ✅ Form validation works
- ✅ File size limits enforced
- ✅ Offline mode handles gracefully

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 17: Performance

**Objective**: Verify extension performance

**Steps**:
1. Measure time to open side panel (should be < 1 second)
2. Measure time to load evidence list (should be < 2 seconds)
3. Measure time to export PDF (should be < 5 seconds)
4. Measure time to export DOCX (should be < 5 seconds)
5. Check memory usage in DevTools

**Expected Results**:
- ✅ Side panel opens quickly
- ✅ Data loads within acceptable time
- ✅ Exports complete within time limits
- ✅ No memory leaks
- ✅ Extension doesn't slow down browser

**Status**: [ ] Pass / [ ] Fail

---

### Test Case 18: Security

**Objective**: Verify security measures

**Steps**:
1. Check that tokens are stored securely
2. Verify HTTPS is used (in production)
3. Check that sensitive data isn't logged
4. Verify image blur/crop feature for privacy
5. Check audit logs record all actions

**Expected Results**:
- ✅ Tokens stored in chrome.storage
- ✅ No plaintext passwords stored
- ✅ API calls use HTTPS
- ✅ Audit logs functional
- ✅ Privacy controls work

**Status**: [ ] Pass / [ ] Fail

---

## Summary Checklist

- [ ] Test Case 1: Floating Button Visibility ✅
- [ ] Test Case 2: Login Functionality ✅
- [ ] Test Case 3: Screenshot Capture ✅
- [ ] Test Case 4: File Upload ✅
- [ ] Test Case 5: Link Capture ✅
- [ ] Test Case 6: Note Capture ✅
- [ ] Test Case 7: Evidence Center ✅
- [ ] Test Case 8: Offline Support ✅
- [ ] Test Case 9: PDF Export - Full ✅
- [ ] Test Case 10: PDF Export - Scoped ✅
- [ ] Test Case 11: DOCX Export ✅
- [ ] Test Case 12: Task Management ✅
- [ ] Test Case 13: Indicators View ✅
- [ ] Test Case 14: Dashboard ✅
- [ ] Test Case 15: RTL & Arabic ✅
- [ ] Test Case 16: Error Handling ✅
- [ ] Test Case 17: Performance ✅
- [ ] Test Case 18: Security ✅

**Overall Status**: [ ] All Pass / [ ] Some Failures

**Notes**:
```
[Add testing notes here]
```

---

## Bug Report Template

If you find issues, please report them with:

```
Title: [Brief description]
Severity: Critical / High / Medium / Low
Steps to Reproduce:
1. 
2. 
3. 

Expected Result:

Actual Result:

Screenshots/Videos:

Browser Version:
Extension Version:
```

---

## Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| Side Panel Open | < 1s | [ ] |
| Evidence List Load | < 2s | [ ] |
| PDF Export | < 5s | [ ] |
| DOCX Export | < 5s | [ ] |
| Screenshot Capture | < 2s | [ ] |
| File Upload | < 10s | [ ] |

---

## Sign-off

**Tested By**: ___________________  
**Date**: ___________________  
**Status**: ✅ Ready for Production / ❌ Issues Found  
**Comments**: ___________________

