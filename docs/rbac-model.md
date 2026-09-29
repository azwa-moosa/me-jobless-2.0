# RBAC Model – BML People & ER Platform (Sept 2026)

**Status**: Implemented as production-ready configuration (not code).

## Overview

This document describes the complete Role-Based Access Control (RBAC) system that replaced hard-coded, user-name-based permissions.

### Core Principle

**Access = Role Permission ∧ Organisational Scope ∧ Resource-Level Authorization ∧ Database/RLS Policy**

Every request is evaluated **server-side** on these axes:
1. Does the user hold a role with this permission? (role → permission_code)
2. Is the permission scoped to an org unit they have access to? (user_scope: BANK / ORG_UNIT / SELF / etc.)
3. Can they access this specific resource? (e.g., case team membership for ER cases)
4. Does the database RLS policy allow the row? (final defense in depth)

**No UI-only permission checks. All denials are audited.**

---

## 1. Organizational Structure – 10 Personas

The platform ships with **10 primary demo personas** representing the organizational roles:

### 1.1 Azwa Moosa – Platform Owner / Super Admin
- **Role Code**: `PLATFORM_OWNER`
- **Access Level**: FULL
- **Scope**: BANK (all data)
- **Purpose**: Complete platform administration and access to all modules/data
- **Key Capabilities**:
  - Full access to all ER cases, Employee Relations workflows
  - All employee data including sensitive fields
  - Total Rewards and compensation administration
  - Analytics, Engagement, People Analytics
  - User management, role management, access grant approval
  - Feature flag configuration
  - Audit log access (full)
- **Includes**: All module admin permissions
- **Login (DEV)**: azwa.moosa@dev.synthetic.local

### 1.2 Maiz – People & Culture Director
- **Role Code**: `PC_DIRECTOR`
- **Access Level**: Executive
- **Scope**: BANK (all of People & Culture function)
- **Purpose**: Executive oversight across all P&C modules
- **Key Capabilities**:
  - View ER dashboards, case summaries (not full case details)
  - Employee analytics and dashboards
  - Engagement survey results and action plans
  - Compensation/Total Rewards management
  - Reports and dashboards
  - Manager oversight
  - Sensitive field access (salary, NID) – audited
- **Restrictions**: Cannot directly edit ER cases or close them (manager case approval required)
- **Login (DEV)**: maiz@dev.synthetic.local

### 1.3 Shai – Head of Total Rewards & Employee Relations
- **Role Code**: `HEAD_TR_ER`
- **Access Level**: Leadership (TR + ER)
- **Scope**: BANK (can also be assigned ORG_UNIT for functional scope)
- **Purpose**: Lead roles in Total Rewards and Employee Relations
- **Key Capabilities**:
  - Full ER case management (view all, create, edit, close, override close)
  - Manage ER case teams and assignments
  - Total Rewards and compensation administration
  - Salary/NID/Passport-level access (audited reveals)
  - Analytics dashboards and recommendations
  - Engagement action plan management
  - HR action center
- **Restrictions**: Cannot manage users or platform config
- **Login (DEV)**: shai@dev.synthetic.local

### 1.4 Rayya – Manager of ER, Engagement & Analytics
- **Role Code**: `ER_ENGAGEMENT_MANAGER`
- **Access Level**: Management (functional)
- **Scope**: BANK (can also be ORG_UNIT for team management)
- **Purpose**: Day-to-day management of ER cases, engagement program, analytics
- **Key Capabilities**:
  - Full ER case management within scope
  - Engagement survey administration and action plan management
  - Analytics uploads, processing, and dashboard management
  - My Work: manage team's actions and tasks
  - Case team reassignment
  - ER investigations, grievances, disciplinary matters
- **Restrictions**: No compensation/salary administration (unless separately assigned)
- **Login (DEV)**: rayya@dev.synthetic.local

### 1.5 Humaam – Manager of Total Rewards
- **Role Code**: `TR_MANAGER`
- **Access Level**: Management (functional)
- **Scope**: BANK or ORG_UNIT (for divisional TR responsibility)
- **Purpose**: Total Rewards administration and oversight
- **Key Capabilities**:
  - Full compensation and benefits data access
  - Salary management and publishing
  - Allowances and benefits configuration
  - Employee compensation information access (audited reveals)
  - Reports on compensation and benefits
- **Restrictions**: No access to ER cases or confidential investigation records
- **Note**: Testable with expired grant to show "No active access" state
- **Login (DEV)**: humaam@dev.synthetic.local

### 1.6 Anj – Total Rewards Officer
- **Role Code**: `TR_OFFICER`
- **Access Level**: Operational
- **Scope**: BANK or ORG_UNIT
- **Purpose**: Operational Total Rewards and compensation support
- **Key Capabilities**:
  - View compensation and salary information
  - Reveal sensitive fields (salary, NID, passport) – **audited with full context**
  - Process compensation transactions
  - Reports within scope
- **Restrictions**: No case editing, no strategic access
- **Audit Trail**: Every salary/NID reveal includes username, timestamp, session, employee ID
- **Login (DEV)**: anj@dev.synthetic.local

### 1.7 Arif – Total Rewards Officer (Second)
- **Role Code**: `TR_OFFICER_2`
- **Access Level**: Operational
- **Scope**: BANK or ORG_UNIT
- **Purpose**: Same as Anj (multiple officers with identical permission sets)
- **Key Capabilities**: Identical to Anj
- **Audit Trail**: All reveals tracked separately by user
- **Login (DEV)**: arif@dev.synthetic.local

### 1.8 Ish – Employee Relations Officer (Case-Scoped)
- **Role Code**: `ER_OFFICER_ISH`
- **Access Level**: Operational (case-scoped)
- **Scope**: CASE_TEAM / ASSIGNED (NOT automatic access to all ER cases)
- **Purpose**: Day-to-day ER case work for assigned cases only
- **Key Capabilities**:
  - View Home and assigned/overdue ER tasks
  - Open authorized source records within case context
  - Access authorized case chronology (may be restricted by ER policy)
  - Create new ER case
  - Add and amend chronology entries
  - Manage assigned case tasks
  - Only where authorized as case team member or case owner
- **Access Control**: 
  - Cannot see other ER officers' cases
  - RLS returns 403 Forbidden if attempting direct URL access to unauthorized case
  - Dashboard shows only assigned cases
- **Critical**: Must NOT auto-grant access to all ER cases merely for being in the ER function
- **Login (DEV)**: ish@dev.synthetic.local

### 1.9 Azwa Moosa Number 2 – Restricted ER Test User
- **Role Code**: `ER_OFFICER_RESTRICTED`
- **Access Level**: Operational (restricted test)
- **Scope**: NONE (no automatic case assignment)
- **Purpose**: Security and RLS testing
- **Test Scenario**:
  1. Sign in as Ish, open an ER case Ish is authorized for
  2. Copy the case URL
  3. Sign out
  4. Sign in as Azwa Moosa Number 2
  5. Paste the case URL → **Expected: 403 Forbidden**
  6. No case data leaked (not even case reference, number, allegations)
- **Audit**: Unauthorized access attempt recorded in audit log
- **Login (DEV)**: azwa.moosa.2@dev.synthetic.local

### 1.10 Bishwajit – Audit Reviewer
- **Role Code**: `AUDIT_REVIEWER_BISH`
- **Access Level**: Read-only Compliance
- **Scope**: BANK (audit access across all modules)
- **Purpose**: Audit and compliance review
- **Key Capabilities**:
  - Read audit events across all modules
  - Run hash-chain verification (Verify Chain feature)
  - Export audit logs for compliance
  - View organizational history (as-of dates)
- **Restrictions**: 
  - READ-ONLY (cannot edit anything)
  - Cannot see employee data, ER case contents, or sensitive information
  - Cannot manage access or approve grants
- **Access Model**: Audit modules marked with `auditModules: '*'` means full audit read
- **Login (DEV)**: bishwajit@dev.synthetic.local

---

## 2. Permission Catalogue

Permissions are **granular** and grouped by module. All permissions are defined in code but granted/revoked through **database configuration only** (no code changes needed).

### Permission Hierarchy

```
Platform Layer
├── me.read                           Sign in and view own profile
├── admin.*                           User/role/permission/config management
├── audit.*                           Audit log access and verification
├── config.lookups.read               Lookup values and state machines

Employee & Organization Layer
├── employee.*                        Employee data (view, search, sensitive reveals)
├── org.read                          Org hierarchy browsing

Employee Relations (ER) Module
├── er.case.*                         Case lifecycle
├── er.investigation.*                Investigation management
├── er.grievance.*                    Grievance handling
├── er.disciplinary.*                 Disciplinary actions

Total Rewards & Compensation
├── compensation.*                    Compensation management
├── salary.*                          Salary information and management

Action Centre (My Work)
├── actions.*                         My Work and team actions

Engagement & Analytics
├── analytics.*                       Analytics dashboards and data
├── engagement.*                      Engagement surveys and results
├── fwt.*                             Fun with Teams

People Manager & Voice
├── manager.*                         Manager intake and tasks
├── voice.*                           Voice submissions and triage

Document Studio
├── documents.*                       Document requests and approval
```

### Full Permission List

See below section 4 for the complete matrix.

---

## 3. Data Scopes

Permissions apply **within** a scope. Scopes define the organizational boundary of access.

| Scope | Meaning | Example |
|---|---|---|
| `BANK` | All employees and records in the entire organization | HR Director sees all ER cases |
| `ORG_UNIT` | Specific organization unit and descendants | Division Head sees only DIV01 and its departments |
| `CASE_TEAM` | Only ER cases where the user is a case team member | ER Officer can only access assigned cases |
| `ASSIGNED` | Only records assigned to the user | Manager sees only their own team's actions |
| `SELF` |Only the user's own data | Employee sees only own action items |
| `NONE` | No organizational scope (admin-only, audit-only, config-only) | Platform Approver has no employee data access |

**Scope Resolution** happens on every authentication:
1. Database query finds all active role assignments for the user
2. Each role has allowed scopes (e.g., TR_MANAGER → [`BANK`, `ORG_UNIT`])
3. Scope expanded to include descendants (ORG_UNIT with `include_descendants=true`)
4. SecurityContext contains resolved `orgUnitIds` set
5. On each request, handler checks `canInOrg(ctx, permission, unitId)`

---

## 4. Complete Permission Matrix (by Persona)

### Legend
- ✅ = Has permission
- 📋 = Has permission with audit/logging
- ❌ = Does not have permission
- ⚠️ = Conditional / restricted

### Matrix (10 Personas × Key Permissions)

| Permission | Azwa (Owner) | Maiz (Dir) | Shai (Head-TR/ER) | Rayya (ER Mgr) | Humaam (TR Mgr) | Anj (TR Off) | Arif (TR Off) | Ish (ER Off) | Azwa2 (Test) | Bishwajit (Audit) |
|---|---|---|---|---|---|---|---|---|---|---|
| **Platform** |
| me.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin.users.manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| admin.roles.manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| admin.access_grants.manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| admin.feature_flags.manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Audit** |
| audit.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| audit.verify | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| audit.export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Employee Data** |
| employee.search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| employee.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| employee.salary.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| employee.salary.reveal | 📋 | 📋 | 📋 | ❌ | 📋 | 📋 | 📋 | ❌ | ❌ | ❌ |
| employee.nid.reveal | 📋 | 📋 | 📋 | ❌ | 📋 | 📋 | 📋 | ❌ | ❌ | ❌ |
| employee.passport.reveal | 📋 | 📋 | 📋 | ❌ | 📋 | 📋 | 📋 | ❌ | ❌ | ❌ |
| **ER Cases** |
| er.case.create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| er.case.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (case-team only) | ✅ (no data) | ❌ |
| er.case.view_all | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| er.case.edit | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| er.case.close | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| er.case.close_override | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| er.case.access_log.read | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Total Rewards** |
| compensation.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| compensation.edit | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| salary.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| salary.reveal | 📋 | 📋 | 📋 | ❌ | 📋 | 📋 | 📋 | ❌ | ❌ | ❌ |
| salary.edit | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| total_rewards.manage | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** |
| analytics.dashboard.read | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| analytics.upload | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| analytics.manage | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Engagement** |
| engagement.read | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| engagement.manage | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **My Work (Actions)** |
| actions.use | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| actions.create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| actions.reassign | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| actions.manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Documents** |
| documents.request | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| documents.approve | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| documents.manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Voice** |
| voice.submit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Notes:**
- 📋 = Audited reveal (user_id, timestamp, session, reason logged; sensitive value NOT logged)
- ⚠️ = Conditional (e.g., case-team scoped access for Ish)
- Multiple roles: Azwa (Owner) + Maiz (Director) can both have permissions overlapping; effective = union

---

## 5. Sensitive Field Access Policy

### Restricted Fields
- **Salary** (employee.salary.view, employee.salary.reveal)
- **NID** (employee.nid.view, employee.nid.reveal)
- **Passport** (employee.passport.view, employee.passport.reveal)
- **Bank Account** (not yet in v0.1)
- **Disciplinary Records** (ER case details, unless on case team)
- **Investigation Notes** (ER case details, unless authorized)

### Reveal Auditing
When a user reveals a sensitive field (e.g., clicks "Show Salary"):
1. **Check**: Does the user have `employee.salary.reveal` permission?
2. **Check**: Is the employee within their authorized scope?
3. **If allowed**:
   - Unmask field in UI
   - Log audit event: `field_revealed` with:
     - event_type: `field.sensitive_reveal`
     - actor_user_id: the user who revealed it
     - target_employee_id: whose field was revealed
     - field_code: `salary` / `nid` / `passport`
     - timestamp: moment of reveal
     - session_id: current session
     - correlation_id: request tracking
   - **DO NOT log**: The actual salary value, NID value, or any PII detail
4. **Audit trail**: Tamper-evident (hash chain), append-only

### Scope Enforcement
- A TR Officer can only reveal salary for employees within their assigned scope
- Cross-scope reveal attempts → 403 Forbidden, audit logged as denied access

---

## 6. ER Case Access Control (Case-Scoped Example)

### Scenario: Ish (ER Officer) vs. Azwa Moosa Number 2

**Case**: ER-2026-0001 (Disciplinary Investigation)

**Setup**:
- Case team: Ish (Lead), Shai (Reviewer)
- Ish has explicit case team membership

**Ish's access**:
```
Permission check: er.case.view? ✅ (has it)
Scope check:     CASE_TEAM ✅ (on the team)
Resource check:  case_id in case_team_member? ✅ (yes)
RLS check (DB):  where case_id = any(current_user_case_ids)? ✅
Result:          ACCESS GRANTED
```

**Azwa Moosa #2's access**:
```
Permission check: er.case.view? ✅ (has it)
Scope check:      NONE ❌ (not assigned to case)
Resource check:   case_id in case_team_member? ❌ (no)
RLS check (DB):   where case_id = any(current_user_case_ids)? ❌ (empty set)
Result:           403 FORBIDDEN (API) / No row (RLS)
```

**Important**: Azwa #2 will NOT be told "case ER-2026-0001 does not exist" (which would leak information). Instead:
- API returns generic 403 (permission denied)
- RLS policy returns no row
- Audit logs unauthorized access attempt (without case details)

---

## 7. Access Grant Lifecycle

[Grants stored in `platform.user_scope`]

### States
- **PENDING**: Awaiting approval
- **APPROVED**: Active and enforced
- **SUSPENDED**: Temporarily inactive (user sees "no active access")
- **EXPIRED**: `valid_to` timestamp has passed
- **REVOKED**: Explicitly canceled by approver

### Grant Approval Process
1. Admin/HR creates grant: User + Role + Scope + ValidFrom + ValidTo + Reason
2. If role is **privileged** (e.g., PLATFORM_OWNER, ACCESS_APPROVER):
   - **Maker-checker** required
   - Approver ≠ Creator
   - Audit trail shows both parties
3. Non-privileged roles: Can be auto-approved or require approval (configurable)
4. User sees no access until grant is APPROVED
5. Expiry is automatic (no code deployment needed)

### Revocation
- Grant status → REVOKED
- On next login: Grant no longer included in SecurityContext
- Immediate effect (no session timeout needed)
- Audit: who revoked, when, reason

---

## 8. Multiple Roles Per User

Users can hold **multiple active roles simultaneously**.

### Example: Shai holds two roles
```
User: Shai
Active Grants:
  1. HEAD_TR_ER (BANK scope)        ← Full ER + TR leadership
  2. DIVISION_HEAD (ORG_UNIT=DIV01) ← Can also manage DIV01 as a division head
```

### Effective Permissions
- **Union** of all active roles' permissions
- Scope combined: Shai sees DIV01 + BANK-level data
- No conflict resolution needed (additive model)

### UI Indication
- "Roles" field in /me response lists all active roles
- Navigation shows union of capabilities across roles
- "Scope" shows resolved org units from all scopes

---

## 9. Admin Access Management UI (Roadmap)

### Planned Admin Screens

#### Users & Access (Admin → Access Management → Users)
- List all users (synthesis + real + disabled)
- Filter by: Status, Last Login, Roles, Scope, Access Grant Status
- **Create User**: UPN, Display Name, Email, Employee UID
- **Edit User**: Status (ACTIVE/DISABLED), employee link
- **View Grants**: All active/expired/revoked grants for the user
- **Grant Access**: Add role + scope + effective_from + valid_to + reason
  - If privileged role: Show "Awaiting approval from [approver names]"
  - Non-privileged: Show "This will be auto-approved" (if configured)
- **Revoke Access**: Immediate removal + reason logged
- **Extend Expiry**: Extend existing grant

#### Roles (Admin → Access Management → Roles)
- List all roles with counts (e.g., "PLATFORM_OWNER: 1 user")
- **View Role**: Code, Name, Description, Default Scope, Allowed Scopes
- **View Permissions**: All permissions bundled in this role
- **Clone Role**: Create new role from existing template
- **Deactivate Role**: Archive legacy roles
- **Edit Role Permissions**: Add/remove permissions (audit logged)

#### Permissions (Admin → Access Management → Permissions)
- List all granular permissions (100+ codes)
- Filter by module: Platform, Employee, ER, Analytics, etc.
- **View Permission**: Code, Module, Description, Restricted Field? (Y/N)
- Denormalized info showing "used by X roles"

#### Access Grants (Admin → Access Management → Access Grants)
- List all grants (active, pending, suspended, expired, revoked)
- Filter by: User, Role, Status, Approver, Created Date Range
- **Approve**: (if pending and you are the approver)
  - Shows maker + reason, requires you to enter approver reason
  - Audit: both parties logged
- **Suspend**: Temporarily disable without revoking (recoverable)
- **Revoke**: Permanent removal + reason
- **Extend Expiry**: Add time to existing grant

#### Compliance Reports (Admin → Reports → Access)
- **Access Matrix Export**: CSV showing User | Role(s) | Permissions | Scope for compliance review
- **Sensitive Data Access**: All salary/NID reveals for a date range
- **Unauthorized Access Attempts**: All 403 audit events
- **Role Change History**: Who assigned/removed roles and when
- **Privilege Elevation Log**: All privileged role grants + approvals

---

## 10. Build-Time & Runtime Checks

### Build-Time (CI/CD)
- ✅ All role permissions must exist in PERMISSIONS catalogue
- ✅ All role codes must be unique
- ✅ All permission codes must be unique
- ✅ All routes must declare access rules (@Public, @Authenticated, @Requires)
- ✅ All permission codes in routes must exist in catalogue
- ✅ No DEFAULT_SCOPE without allowed_scopes
- ✅ PII scanner: Reject any "real" NID/Passport formats (TEST-* required)

### Runtime (Every Request)
1. Token verified (Entra or mock IdP)
2. User loaded from DB
3. Active role assignments fetched (filtered by valid_from/valid_to/status=APPROVED)
4. Permissions resolved from role_permission table
5. Org scope expanded (ltree query for descendants)
6. SecurityContext built + injected into request
7. Route access rule checked (@Requires permissions)
8. Handler calls can() / assertCan() / canInOrg()
9. Resource-level handler checks (e.g., canSeeCase)
10. SQL executed with app.user_id setting (RLS applied at DB)
11. Audit event recorded (same transaction, outbox pattern)
12. Response serialized (sensitive fields masked)

---

## 11. Security Best Practices

### DO ✅
- ✅ Check permissions on EVERY request
- ✅ Enforce scope at the SQL layer
- ✅ Use RLS as final defense
- ✅ Audit sensitive operations
- ✅ Log authorization denials (403s)
- ✅ Mask sensitive fields at response time
- ✅ Audit field reveals with context (not value)
- ✅ Deny by default; whitelist permissions
- ✅ Use database transactions for audit
- ✅ Hash-chain audit logs
- ✅ Support temporary access with expiry
- ✅ Require multi-factor for privileged roles
- ✅ Maker-checker for sensitive grants (dual approval)

### DON'T ❌
- ❌ Check permissions only in UI (always check API)
- ❌ Rely on frontend permission hiding for security
- ❌ Skip scope checks for users in "the same department"
- ❌ Cache permissions for more than one request
- ❌ Use direct SQL bypassing RLS
- ❌ Log actual sensitive data values
- ❌ Hardcode user names in permission logic
- ❌ Allow self-approval for privileged roles
- ❌ Trust X-User-Id headers from client
- ❌ Leak case references in 404 responses
- ❌ Give "Platform Admin" business data access
- ❌ Assume role changes are instantaneous (cache invalidation)

---

## 12. Migration from Hard-Coded to RBAC (Sept 2026)

### Old Model (Removed)
```
if (user.displayName === 'Raifa Shareef') {
  if (caseId in his assigned cases) allow();
}
```

### New Model
```
canSeeCase(ctx, {caseId, caseTeam}) // checks: perm + scope + team membership + RLS
```

### Seed Data Changes
- Old personas in synthetic-data removed (kept as legacy for backward compat testing)
- New personas created with proper role assignments
- Permissions → role_permission table (not embedded in code)
- Scope grants in user_scope table (with valid_from/valid_to)

### Database Migration
- None (seed runs fresh on `db:reset`)
- If migrating real data: Export user→role mappings, import via seed logic

---

## 13. Test Scenarios (Security Matrix)

**10 Core Test Cases** (implemented in `tests/security/run-matrix.mjs`):

1. ✅ Azwa (Owner) can see all ER cases
2. ✅ Ish can see only assigned ER cases
3. ✅ Azwa #2 gets 403 on unassigned case URL
4. ✅ Anj can reveal salary (audited)
5. ✅ Anj cannot close ER cases
6. ✅ Rayya can reassign actions across team
7. ✅ Humaam with expired grant sees "No active access"
8. ✅ Bishwajit can read audit, not ER data
9. ✅ Azwa (Owner) cannot edit feature flags with herself as approver (must be second person)
10. ✅ Cross-division employee search returns 403 for Division Head viewing non-DIV01 staff

---

## 14. Audit Event Types (Security-Relevant)

All events below are recorded with full context (no sensitive values):

```
auth.login.succeeded              <- MFA? Session ID? Duration?
auth.login.failed_auth            <- Reason? Attempt count?
auth.logout
auth.token.revoked
me.profile.view
employee.search
employee.detail.view
employee.field.salary_reveal      ← user_id, employee_id, timestamp, session, NOT value
employee.field.nid_reveal
employee.field.passport_reveal
case.created
case.view                          ← case_id, actor, scope_check_result
case.edit.chronology_added
case.edit.chronology_amended
case.status_changed
case.team_member.added
case.team_member.removed
case.closed
case.close_override               ← Reason? Override reason?
access_denied (403)               ← Permission? Scope check? Resource? RLS?
role_assigned                      ← user_id, role_code, granted_by, reason
role_revoked                       ← user_id, role_code, revoked_by, reason
role_grant_expired
scope_expanded                     ← user_id, scope_type, org_units, expires
feature_flag_changed              ← flag_code, before, after, changed_by
configuration_updated
```

---

## Conclusion

This RBAC model provides:
- **Granular** permission control (100+ codes)
- **Flexible** organizational scopes (BANK / ORG_UNIT / CASE_TEAM / SELF / NONE)
- **Configurable** without code changes (all in DB)
- **Audited** at every sensitive point
- **Defense-in-depth** (role + scope + resource + RLS)
- **Tested** against security matrix
- **Documented** and reviewed by HR, ER, IS, IT

All authorization decisions are **server-side only**, **audited**, and **RLS-protected at the database level**.
