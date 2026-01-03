# LabLinc — Production Readiness
Developer Task Breakdown (Pre-AWS Deployment)

## 🔹 EPIC 1: Email System Migration (SMTP → AWS SES)

### TASK 1.1 — Remove SMTP Implementation
**Type:** Backend **Priority:** High  
**Description:** Remove all SMTP-based email logic and credentials from the codebase.

**Steps:**
- Delete Nodemailer SMTP transport
- Remove Gmail/SMTP configs from .env
- Remove any SMTP fallback logic
- Remove test email scripts

**Acceptance Criteria:**
- No SMTP code exists
- App does not reference SMTP env variables
- Only SES is used for email delivery

### TASK 1.2 — Implement AWS SES Email Service
**Type:** Backend **Priority:** High  
**Description:** Create a centralized AWS SES email service using AWS SDK v3.

**Implementation:**
- Create `src/services/email/ses.service.js`
- Support:
  - `sendEmail(to, subject, html)`
  - Retry on transient failures
  - Load credentials from env / AWS Secrets Manager

**Acceptance Criteria:**
- Emails are sent using SES
- No email logic inside controllers
- Service reusable across auth & notifications

### TASK 1.3 — Email Templates System
**Type:** Backend **Priority:** Medium  
**Description:** Centralize all email templates.

**Steps:**
- Create `/email/templates/`
- Templates:
  - Verify Email
  - Forgot Password
  - OTP
  - Booking Confirmation
- Use variables (name, links, OTP)

**Acceptance Criteria:**
- No inline HTML in controllers
- Templates reusable and maintainable

### TASK 1.4 — SES Configuration Validation (NEW)
**Type:** Backend **Priority:** High  
**Description:** Ensure SES configuration is production-safe and region-correct.

**Steps:**
- Validate SES region is ap-south-1
- Validate EMAIL_FROM uses verified domain (noreply@lablinc.in)
- Handle SES sandbox vs production mode gracefully
- Add fallback logging if SES throttles or rejects

**Acceptance Criteria:**
- Emails fail gracefully if SES quota exceeded
- No hardcoded region or sender values

## 🔹 EPIC 2: Authentication & Security Completion

### TASK 2.1 — Email Verification After Signup
**Type:** Backend + Frontend **Priority:** High

**Backend:**
- Add fields to User model:
  - `emailVerified`
  - `emailVerifyToken`
  - `emailVerifyExpires`
- Generate verification token on signup
- Hash token before storing
- Send verification email via SES
- Block login if `emailVerified === false`

**Frontend:**
- Create `/verify-email` page
- Handle success / failure states

**Acceptance Criteria:**
- User cannot log in without verifying email
- Verification link expires correctly

### TASK 2.2 — Resend Verification Email
**Type:** Backend **Priority:** Medium

**Steps:**
- Endpoint: `POST /auth/resend-verification`
- Rate limit requests
- Regenerate verification token (hashed)

**Acceptance Criteria:**
- Resend works
- Abuse prevention enabled

### TASK 2.3 — Forgot Password Flow
**Type:** Backend + Frontend **Priority:** High

**Backend:**
- Fields:
  - `passwordResetToken`
  - `passwordResetExpires`
- Store hashed token only
- Endpoints:
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`

**Frontend:**
- `/forgot-password`
- `/reset-password?token=`

**Acceptance Criteria:**
- Token expires ≤ 15 min
- Token invalidated after use
- No account existence leakage

### TASK 2.4 — Change Password with OTP
**Type:** Backend + Frontend **Priority:** High

**Backend:**
- Fields:
  - `passwordChangeOTP`
  - `passwordChangeOTPExpires`
- Store hashed OTP
- Endpoints:
  - Request OTP
  - Verify OTP & update password
- Rules:
  - OTP valid 10 minutes
  - Max 3 attempts
  - Rate limited

**Acceptance Criteria:**
- OTP required before password change
- Clear success / failure handling

### TASK 2.5 — Refresh Token Rotation & Revocation (NEW)
**Type:** Backend **Priority:** High  
**Description:** Secure session management via refresh token rotation.

**Steps:**
- Store refresh token hash in DB
- Rotate token on use
- Invalidate on logout & password change

**Acceptance Criteria:**
- Old refresh tokens cannot be reused
- Session hijacking mitigated

⚠️ **If refresh tokens are NOT used, explicitly document this decision.**

## 🔹 EPIC 3: Cleanup & Code Hygiene

### TASK 3.1 — Remove Dev & Test Scripts
**Type:** Backend **Priority:** High

**Steps:**
- Remove:
  - Seed scripts
  - Reset-admin scripts
  - Test utilities
- Guard dev scripts explicitly:
```javascript
if (process.env.NODE_ENV === 'production') {
  throw new Error('This script is disabled in production');
}
```

**Acceptance Criteria:**
- No script can mutate prod DB
- Dev scripts blocked in production

### TASK 3.2 — Remove Unused Integrations
**Type:** Backend **Priority:** Medium

**Steps:**
- Remove unused SDKs (Cloudinary if unused)
- Remove env variables
- Remove upload logic

**Acceptance Criteria:**
- No unused external dependencies
- Clean dependency graph

### TASK 3.3 — Environment Hygiene
**Type:** DevOps **Priority:** High

**Steps:**
- Create:
  - `.env.example`
  - `.env.production`
- Remove hardcoded secrets
- Validate env loading at startup

**Acceptance Criteria:**
- App fails fast if env missing
- No secrets committed

## 🔹 EPIC 4: Production Hardening & Stability

### TASK 4.1 — Security Middleware & Proxy Hardening
**Type:** Backend **Priority:** High

**Steps:**
- Enable `app.set('trust proxy', 1)`
- Ensure Helmet is active
- Enforce strict CORS allowlist
- Rate limit auth routes
- Configure secure cookies:
  - `secure: true`
  - `sameSite: 'strict'`
- Respect X-Forwarded-Proto

**Acceptance Criteria:**
- App safe behind AWS ALB / CloudFront
- Cookies work correctly over HTTPS

### TASK 4.2 — Error Handling Standardization
**Type:** Backend **Priority:** High

**Steps:**
- Global error handler
- No stack traces in prod
- Consistent error format

**Acceptance Criteria:**
- Clean API responses
- No sensitive leakage

### TASK 4.3 — Health Check Endpoint
**Type:** Backend **Priority:** Medium  
**Description:** Add `/health` endpoint.

**Acceptance Criteria:**
- Returns 200 OK
- No auth required

### TASK 4.4 — Logging Cleanup
**Type:** Backend **Priority:** Medium

**Steps:**
- Remove console.log from prod paths
- Add structured logging (Winston/Pino)
- Mask sensitive fields

**Acceptance Criteria:**
- Logs usable in CloudWatch
- No PII exposure

## 🔹 EPIC 5: Frontend Authentication & Account Management

### TASK 5.1 — Verify Email Page
**Type:** Frontend **Priority:** High

**Route:** `/verify-email?token=`

**UI States:**
- Loading
- Success
- Failure
- Resend option

### TASK 5.2 — Resend Verification UI
**Type:** Frontend **Priority:** Medium

**Placement:**
- Login page
- Profile banner

### TASK 5.3 — Forgot Password Page
**Type:** Frontend **Priority:** High

**Route:** `/forgot-password`

### TASK 5.4 — Reset Password Page
**Type:** Frontend **Priority:** High

**Route:** `/reset-password?token=`

### TASK 5.5 — Profile / Account Settings Page
**Type:** Frontend **Priority:** High

**Sections:**
- User info (read-only)
- Verification status
- Change password

### TASK 5.6 — Change Password with OTP UI
**Type:** Frontend **Priority:** High

**UI:**
- OTP input (6 digits)
- Countdown timer
- Resend OTP

### TASK 5.7 — Login Guard for Unverified Users
**Type:** Frontend **Priority:** High

### TASK 5.8 — Global Auth Error Handling
**Type:** Frontend **Priority:** Medium

### TASK 5.9 — Auth State Persistence
**Type:** Frontend **Priority:** High

### TASK 5.10 — Route Protection & Redirects
**Type:** Frontend **Priority:** High

## 🔹 FINAL MILESTONE

### TASK 6.1 — Pre-AWS Deployment Validation
**Type:** Full-stack **Priority:** High

**Checklist:**
- SES sandbox banner removed
- Sending quota > 200
- Test email sent to unverified external email
- Email flows tested end-to-end
- Auth flows complete
- Frontend guards working
- `.env.production` validated

**Acceptance Criteria:**
- App ready for ECS / EC2 deployment
- Zero blockers for AWS launch

## ✅ FINAL VERDICT

This document is now:
- ✔ Security-complete 
- ✔ Frontend + Backend aligned 
- ✔ AWS-ready 
- ✔ Production-grade