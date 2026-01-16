# LABLINC — UI + EMAIL ENHANCEMENT TASKS

## EPIC 1 — Authentication UX Improvements

### TASK 1.1 — Stylize "Forgot Password" Page (Mobile-First)
**Priority:** High  
**Type:** Frontend (UI/UX)

**Scope:**
- Improve layout, spacing, and visual hierarchy
- Match branding with signup/login pages
- Ensure accessibility (contrast, font size)

**Acceptance Criteria:**
- ✅ Responsive on mobile (≤ 390px width)
- ✅ Primary CTA clearly visible
- ✅ Error + success states visually distinct
- ✅ Consistent typography and button styles

---

### TASK 1.2 — Stylize "Change Password" Page
**Priority:** High  
**Type:** Frontend (UI/UX)

**Scope:**
- Improve form layout
- Add password strength indicator
- Improve validation feedback UI

**Acceptance Criteria:**
- ✅ Inline validation messages
- ✅ Disabled submit until valid
- ✅ Mobile-optimized spacing
- ✅ Matches overall design system

---

## EPIC 2 — SES Email Flow Integration & Simplification

### TASK 2.1 — Connect Forgot Password Flow to SES
**Priority:** Critical  
**Type:** Backend + Frontend

**Scope:**
- Ensure forgot-password OTP/email uses SES
- Handle failures gracefully
- Show success UI even if email delivery is async

**Acceptance Criteria:**
- ✅ OTP email sent via SES
- ✅ Backend logs SES Message ID
- ✅ Frontend shows confirmation screen
- ✅ No AWS credentials in env (IAM role only)

---

### TASK 2.2 — Connect Change Password Confirmation Email (Optional)
**Priority:** Medium  
**Type:** Backend

**Scope:**
- Send confirmation email after password change
- Simple, non-OTP informational email

**Acceptance Criteria:**
- ✅ SES email triggered after password update
- ✅ Email contains timestamp + IP (optional)
- ✅ No blocking UX on failure

---

## EPIC 3 — Invoice Email Integration (SES)

### TASK 3.1 — Attach Invoice PDF to Email via SES
**Priority:** High  
**Type:** Backend

**Scope:**
- Generate invoice PDF
- Send invoice via SES to user email
- Triggered on booking completion or manual resend

**Acceptance Criteria:**
- ✅ SES SendRawEmail used
- ✅ PDF attached correctly
- ✅ Email subject & body readable on mobile
- ✅ Logs include Message ID + invoice ID

---

### TASK 3.2 — Add "Send Invoice via Email" Action
**Priority:** Medium  
**Type:** Frontend + Backend

**Scope:**
- Button to resend invoice from booking details
- Loading + success feedback

**Acceptance Criteria:**
- ✅ Button disabled during send
- ✅ Success toast on completion
- ✅ Error toast on failure

---

## EPIC 4 — Email Content Simplification (Brand Consistency)

### TASK 4.1 — Simplify OTP Email Template
**Priority:** High  
**Type:** Backend (Email templates)

**Scope:**
- Reduce text clutter
- Highlight OTP clearly
- Improve mobile readability

**Acceptance Criteria:**
- ✅ OTP large and centered
- ✅ Minimal copy
- ✅ Brand colors applied
- ✅ Works in Gmail & Outlook mobile

---

### TASK 4.2 — Simplify Email Verification Template
**Priority:** High  
**Type:** Backend (Email templates)

**Scope:**
- Replace long explanations with single CTA
- Clear verification intent

**Acceptance Criteria:**
- ✅ One primary CTA (Verify Email)
- ✅ Fallback text link included
- ✅ No unnecessary paragraphs

---

### TASK 4.3 — Simplify Invoice Email Template
**Priority:** Medium  
**Type:** Backend (Email templates)

**Scope:**
- Clear invoice summary
- Focus on attachment + amount

**Acceptance Criteria:**
- ✅ Shows invoice number
- ✅ Shows total amount
- ✅ Clear download instruction

---

## EPIC 5 — Profile & Booking UI Enhancements

### TASK 5.1 — Modernize "Verify Email" UI (Mobile)
**Priority:** High  
**Type:** Frontend

**Scope:**
- Improve mobile layout under Profile page
- Replace dense text with card-based UI

**Acceptance Criteria:**
- ✅ Mobile-friendly CTA
- ✅ Clear verification status (verified / pending)
- ✅ Resend button clearly visible

---

### TASK 5.2 — Fix Total Amount Text Color (Booking Details)
**Priority:** Low  
**Type:** Frontend (UI fix)

**Scope:**
- Change total amount color to black
- Ensure visibility across light backgrounds

**Acceptance Criteria:**
- ✅ Text color = #000
- ✅ Consistent across desktop & mobile
- ✅ No regression in dark mode (if applicable)

---

## EPIC 6 — Quality & Regression Checks

### TASK 6.1 — End-to-End Email Flow Testing
**Priority:** High  
**Type:** QA / Dev

**Scope:**
- Register → OTP → Verify → Login
- Forgot password → Reset
- Invoice generation → Email

**Acceptance Criteria:**
- ✅ All emails delivered
- ✅ No SES errors in logs
- ✅ UX does not block on email latency

---

## Implementation Status

### Completed Tasks:
- ✅ TASK 1.1 - Stylize "Forgot Password" Page (Mobile-First)
- ✅ TASK 1.2 - Stylize "Change Password" Page
- ✅ TASK 4.1 - Simplify OTP Email Template
- ✅ TASK 4.2 - Simplify Email Verification Template
- ✅ TASK 4.3 - Simplify Invoice Email Template
- ✅ TASK 5.1 - Modernize "Verify Email" UI (Mobile)
- ✅ TASK 5.2 - Fix Total Amount Text Color (Booking Details)

### In Progress:
- Awaiting AWS SES credentials update for email testing

### Blocked:
- EPIC 2, 3, 6 tasks require AWS SES credentials to be updated

---

## Next Steps:
1. Update AWS SES credentials in production
2. Test registration OTP flow
3. Begin EPIC 1 - Authentication UX improvements
