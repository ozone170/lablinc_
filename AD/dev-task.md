# LabLinc — Auth, Email Verification & OTP Stabilization

## Scope
This task list addresses OTP verification, email verification, password reset, refresh-token errors, and UI gaps identified during testing. It is written for direct execution by developers.

## 🔹 EPIC A: Backend – Email Verification & OTP Reliability

### TASK A1 — Fix Registration Email Verification Trigger
**Type:** Backend **Priority:** Critical

**Problem:** Users can register and log in without receiving verification email or OTP.

**Required Changes:**
On successful registration:
- Set `emailVerified = false`
- Generate verification token
- Hash token before storing
- Set expiry (15 minutes)
- Trigger SES verification email automatically
Note:
- If email OTP verification succeeds, set `emailVerified = true` immediately.
- Verification email link serves as fallback if OTP is not used.

**Acceptance Criteria:**
- New user always receives verification email
- No login allowed until verified (except limited session if required)
- Unverified users may authenticate but are restricted from protected routes
- Backend returns explicit error code for unverified access



### TASK A2 — Stabilize /auth/resend-verification Endpoint
**Type:** Backend **Priority:** Critical

**Problem:** Endpoint returns 500 Internal Server Error.

**Required Fixes:**
- Wrap SES call in try/catch
- Validate:
  - User exists
  - `emailVerified === false`
- Regenerate verification token (hashed)
- Return meaningful error responses

**Acceptance Criteria:**
- Endpoint never crashes
- Returns 200 on success, 400 on logical errors

### TASK A3 — Implement Email OTP Generation & Verification
**Type:** Backend **Priority:** Critical

**Endpoints:**
- `POST /auth/send-email-otp`
- `POST /auth/verify-email-otp`
- Rate limit OTP generation per email/IP
- Cooldown before resend (e.g., 60 seconds)


**Required Logic:**
- Generate 6-digit OTP
- Hash OTP before storing
- Set expiry (10 minutes)
- Limit attempts (max 3)
- Invalidate OTP after success

**Acceptance Criteria:**
- OTP emailed successfully
- OTP cannot be reused
- Expired OTP rejected

### TASK A4 — Fix Password Change with OTP Flow
**Type:** Backend **Priority:** High

**Endpoints:**
- `POST /auth/request-password-change-otp`
- `POST /auth/verify-password-change-otp`


**Required Fixes:**
- Ensure OTP email is sent
- Hash OTP before storing
- Revoke refresh tokens after password change
- Rate limit OTP generation per email/IP
- Cooldown before resend (e.g., 60 seconds)


**Acceptance Criteria:**
- Password change only possible after valid OTP
- Existing sessions invalidated

## 🔹 EPIC B: Frontend – Verification & OTP UX Completion

### TASK B1 — Registration Page: Email OTP Verification UI
**Type:** Frontend **Priority:** Critical

**UI Additions:**
- Button next to email: "Send OTP"
- OTP input field (6 digits)
- Button: "Verify OTP"
- Disable final submit until OTP verified

**Acceptance Criteria:**
- User cannot register without email OTP verification

### TASK B2 — Profile Page: Email Verification Controls
**Type:** Frontend **Priority:** High

**UI Logic:**
If `emailVerified === false`:
- Show warning badge
- Show "Resend Verification Email" button
- Optional: Verify via OTP

**Acceptance Criteria:**
- User can re-trigger verification without errors

### TASK B3 — Change Password Page: OTP-Based Flow
**Type:** Frontend **Priority:** High

**UX Flow:**
1. Click "Send OTP"
2. Enter OTP + New Password
3. Submit

**UI Requirements:**
- Countdown timer
- Resend OTP disabled until timeout
- Error feedback

### TASK B4 — Forgot Password Page Enhancements
**Type:** Frontend **Priority:** Medium

### TASK B5 — Login Guard for Unverified Users
Type: Frontend
Priority: High

Behavior:
- On login, if `emailVerified === false`:
  - Block dashboard access
  - Show verification prompt
  - Offer resend/OTP options


**Improvements:**
- Clear instructions
- Disable submit after click
- Generic success message
- Resend cooldown

## 🔹 EPIC C: Auth Session & Refresh Token Fixes

### TASK C1 — Fix Refresh Token Handling on Login
**Type:** Backend **Priority:** Critical

**Required Fixes:**
- Ensure refresh token hash stored in DB
- Set cookie flags correctly:
  - `httpOnly`
  - `secure`
  - `sameSite: strict`
- Graceful logout on refresh failure
- Invalidate refresh tokens on:
  - Password change
  - Email verification
  - Manual logout


**Acceptance Criteria:**
- No refresh-token crash
- Session rotation works

## 🔹 EPIC D: Admin Panel Enhancements

### TASK D1 — Admin Email Verification Override
**Type:** Full-stack **Priority:** Medium

**Backend:**
- Endpoint: `PATCH /admin/users/:id/verify-email`

**Frontend:**
- Admin panel button: "Mark Email as Verified"
- Confirmation modal

**Acceptance Criteria:**
- Admin can verify stuck users
- Action logged

## 🔹 FINAL VALIDATION CHECKLIST

- [ ] Registration requires OTP
- [ ] Verification email delivered
- [ ] OTP flows stable
- [ ] Password change secure
- [ ] Refresh token stable
- [ ] Admin override works

## ✅ FINAL OUTCOME

After completing these tasks:
- All auth-related 500 errors resolved
- Email & OTP flows production-safe
- UX aligned with security requirements
- Platform ready for AWS go-live