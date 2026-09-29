# Admin Access Management UI – Implementation Guide

**Status**: Scaffolding and planning document (component structure and API contracts defined, UI implementation in Phase 2).

## Overview

The Admin → Access Management interface provides HR, Security, and Platform Approvers with tools to:
- Manage users and their access grants
- Create/edit/delete roles and permissions
- Approve/revoke/extend access
- Review audit and compliance logs
- Export access matrices

All changes must be audited and approved by an authorized admin.

---

## Architecture & Components

### Route Structure

```
/admin/access-management/              ← Admin landing
  /users/                              ← User management
    /[userId]/                         ← User detail + grants
    /[userId]/grant-access             ← Grant wizard
    /[userId]/revoke-access/[grantId]  ← Revocation confirmation
  /roles/                              ← Role catalog
    /[roleCode]/                       ← Role detail + permissions
    /create                            ← New role form
    /[roleCode]/edit                   ← Edit role
    /[roleCode]/clone                  ← Clone role
  /permissions/                        ← Permission reference (read-only)
    /?module=er                        ← Filter by module
  /access-grants/                      ← Grant lifecycle view
    /?status=pending                   ← Filter by status
    /[grantId]/approve                 ← Approval confirmation
    /[grantId]/suspend                 ← Suspend confirmation
    /[grantId]/extend                  ← Extend wizard
  /compliance-reports/                 ← Compliance queries
    /access-matrix                     ← User role matrix export
    /sensitive-reveals                 ← Salary/NID audit trail
    /unauthorized-attempts             ← 403 events
    /role-changes                      ← Audit trail of role assignments
```

### API Endpoints (Proposed)

#### Users API
```
GET  /api/admin/users                  ← List users with grants/roles
POST /api/admin/users                  ← Create user
GET  /api/admin/users/:userId          ← User detail
PUT  /api/admin/users/:userId          ← Update user (status, etc.)
GET  /api/admin/users/:userId/grants   ← All grants for user
```

#### Access Grants API
```
GET  /api/admin/access-grants                   ← List grants (filter: user, role, status, date range)
POST /api/admin/access-grants                   ← Create new grant
GET  /api/admin/access-grants/:grantId          ← Grant detail
PUT  /api/admin/access-grants/:grantId          ← Update grant (suspend, extend, revoke)
POST /api/admin/access-grants/:grantId/approve  ← Approve (requires dual approval for privileged)
POST /api/admin/access-grants/:grantId/revoke   ← Revoke (record reason)
POST /api/admin/access-grants/:grantId/extend   ← Extend expiry
```

#### Roles & Permissions API
```
GET  /api/admin/roles                  ← List all roles
POST /api/admin/roles                  ← Create role
GET  /api/admin/roles/:code            ← Role detail
PUT  /api/admin/roles/:code            ← Update role (name, description, scope, permissions)
DELETE /api/admin/roles/:code          ← Deactivate role
POST /api/admin/roles/:code/clone      ← Clone role
GET  /api/admin/roles/:code/users      ← Users holding this role

GET  /api/admin/permissions            ← List all permissions (filter: module)
GET  /api/admin/permissions/:code      ← Permission detail (which roles use it)
```

#### Compliance Reports API
```
GET  /api/admin/reports/access-matrix              ← CSV export
GET  /api/admin/reports/sensitive-reveals          ← Salary/NID/Passport audit trail
GET  /api/admin/reports/unauthorized-attempts      ← 403 Forbidden events
GET  /api/admin/reports/role-changes               ← Role assignment history
```

### Database Schema Extensions (Already Present)

```sql
-- Already exist in migrations/001_foundation.sql
platform.app_user
platform.role
platform.permission
platform.role_permission
platform.user_scope              (grants with valid_from/valid_to/status)
platform.team
platform.team_member
audit.audit_event                (append-only hash chain)

-- New tables (Phase 2):
platform.access_grant_approval  (maker-checker: grant_id, actor_id, approval_type, reason, timestamp)
platform.role_change_audit      (role assignment history: who, when, action, reason)
```

---

## Component Design (Wireframes)

### 1. Users List (`/admin/access-management/users`)
```
┌─ Admin › Access Management › Users ────────────────────────────────┐
│                                                                      │
│  Filter: [ Status ▼ ]  [ Last Login ▼ ]  [ Role ▼ ]  [ Access ▼ ] │
│  Search: [_________________]  [Create User]  [Import CSV]           │
│                                                                      │
│  User                    | Role(s)           | Scope    | Status    │
│  ─────────────────────────────────────────────────────────────────  │
│  azwa.moosa@...          | PLATFORM_OWNER    | BANK     | ACTIVE ● │
│  maiz@...                | PC_DIRECTOR       | BANK     | ACTIVE ● │
│  shai@...                | HEAD_TR_ER        | BANK     | ACTIVE ● │
│  rayya@...               | ER_ENGAGEMENT_MGR | BANK     | ACTIVE ● │
│  humaam@...              | TR_MANAGER        | BANK     | EXPIRED ✕ │
│  anj@...                 | TR_OFFICER        | BANK     | ACTIVE ● │
│                                                                      │
│  [< Prev]  Page 1 of 12  [Next >]  Showing 1-6 of 237 users       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2. User Detail (`/admin/access-management/users/[userId]`)
```
┌─ User: Shai (shai@synthetic.local) ────────────────────────────────┐
│                                                                      │
│ Basic Info                          Active Roles & Scopes           │
│ ─────────────────────────────────   ────────────────────────────── │
│ Display Name: Shai                  Role: HEAD_TR_ER                │
│ UPN: shai@synthetic.local           Scope: BANK (all employees)     │
│ Status: [ACTIVE ▼]                  Valid: 2025-01-01 →            │
│ Last Login: 2 hours ago             Granted by: azwa.moosa          │
│ Employee UID: [Link to S00234]      Reason: Leadership appointment  │
│                                     Status: APPROVED ✓              │
│ [Edit]  [Reset Password]  [View Audit]                             │
│                                                                      │
│ ──────────────────────────────────────────────────────────────────  │
│                                                                      │
│                                    [+ Add Another Role]             │
│                                                                      │
│ Grants History                                                       │
│ ─────────────────────────────────────────────────────────────────   │
│ 2026-01-01 | HEAD_TR_ER (BANK)  | APPROVED | azwa.moosa            │
│ 2026-01-01 | DIVISION_HEAD (DIV01) | REVOKED | azwa.moosa | Reason │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3. Grant Access Wizard (`/admin/access-management/users/[userId]/grant-access`)
```
Step 1: Select Role
┌─ Select Role ──────────────────────────────────────────────────────┐
│                                                                      │
│ Available Roles:                                                     │
│ ☐ ER_OFFICER_ISH              · Case-scoped ER access              │
│ ☐ ER_MANAGER                  · Portfolio ER access                │
│ ☐ TR_OFFICER                  · Total Rewards operational          │
│ ↓ [Filter by module...]                                            │
│                                                                      │
│ [← Back]  [Next →]                                                  │
└──────────────────────────────────────────────────────────────────────┘

Step 2: Configure Scope
┌─ Scope for TR_OFFICER ─────────────────────────────────────────────┐
│                                                                      │
│ Allowed Scopes: [BANK, ORG_UNIT]                                    │
│                                                                      │
│ ○ BANK (Full organization access)                                  │
│   └─ Includes all employees across all org units                   │
│                                                                      │
│ ◉ ORG_UNIT (Specific org unit + descendants)                       │
│   └─ Select Org: [ DIV01 – Division Retail ▼ ]                    │
│   └─ Include descendants? ☑ (Sections, Departments)                │
│                                                                      │
│ Role will have access to: DIV01 + 4 Sections + 12 Departments      │
│                                                                      │
│ [← Back]  [Next →]                                                  │
└──────────────────────────────────────────────────────────────────────┘

Step 3: Set Dates & Reason
┌─ Duration & Reason ────────────────────────────────────────────────┐
│                                                                      │
│ Effective From:  [2026-01-01] (today)                              │
│ Expires:        ◉ Never                                             │
│                 ○ On date: [________________]                       │
│                           (leave blank or pick future date)         │
│                                                                      │
│ Reason for Grant:                                                    │
│ [________________________________________________________]          │
│ [Example: Increased TR admin workload, seasonal staffing]          │
│                                                                      │
│ Privileged Role? NO                                                 │
│ (This role requires single approver)                                │
│                                                                      │
│ [← Back]  [Create Grant]  [Cancel]                                  │
└──────────────────────────────────────────────────────────────────────┘

Step 4: Confirmation
┌─ Review & Confirm ─────────────────────────────────────────────────┐
│                                                                      │
│ Summary:                                                             │
│ User:       Humaam (humaam@synthetic.local)                        │
│ Role:       TR_OFFICER                                              │
│ Scope:      ORG_UNIT = DIV01 (+ descendants)                       │
│ Valid From: 2026-01-01                                              │
│ Expires:    Never                                                    │
│ Reason:     "[reason text]"                                         │
│                                                                      │
│ ⚠️ This is NOT a privileged role.                                   │
│    Grant will be auto-approved by the system.                       │
│                                                                      │
│ ⚠️ Humaam's role is active and takes effect on next login.          │
│    No need to restart their session.                                │
│                                                                      │
│ [← Back]  [✓ Confirm & Create]  [Cancel]                           │
└──────────────────────────────────────────────────────────────────────┘
```

### 4. Roles List (`/admin/access-management/roles`)
```
┌─ Roles Catalog ────────────────────────────────────────────────────┐
│                                                                      │
│ Filter: [By Module ▼]  Status: [All ▼]  [Create Role]              │
│                                                                      │
│ Role Code                 | Users | Permissions  | Scope(s)        │
│ ──────────────────────────────────────────────────────────────────  │
│ PLATFORM_OWNER            | 1     | 85 (all)    | BANK           │
│ PC_DIRECTOR               | 1     | 42          | BANK           │
│ HEAD_TR_ER                | 1     | 38          | BANK, ORG_UNIT │
│ ER_ENGAGEMENT_MANAGER     | 1     | 32          | BANK, ORG_UNIT │
│ ER_OFFICER_ISH            | 1     | 15          | CASE_TEAM      │
│ TR_MANAGER                | 1     | 24          | BANK, ORG_UNIT │
│ TR_OFFICER                | 2     | 12          | BANK, ORG_UNIT │
│ AUDIT_REVIEWER_BISH       | 1     | 4           | NONE           │
│                                                                      │
│ [< Prev]  Page 1  [Next >]                                         │
└──────────────────────────────────────────────────────────────────────┘
```

### 5. Role Detail (`/admin/access-management/roles/[code]`)
```
┌─ Role: ER_ENGAGEMENT_MANAGER ──────────────────────────────────────┐
│                                                                      │
│ Summary                          | Permissions                      │
│ ──────────────────────────────   | ──────────────────────────────   │
│ Code: ER_ENGAGEMENT_MANAGER      | ✓ me.read                        │
│ Name: Manager – ER, Engagement   | ✓ er.case.create                 │
│        & Analytics               | ✓ er.case.view                   │
│                                  | ✓ er.case.view_all               │
│ Description:                     | ✓ er.case.edit                   │
│ "Rayya – Full ER case..."        | ✓ er.investigation.manage        │
│                                  | ✓ engagement.survey.create       │
│ Default Scope: BANK              | ✓ analytics.dashboard.read       │
│ Allowed Scopes:                  | ✓ analytics.upload               │
│ - BANK                           | ✓ analytics.process              │
│ - ORG_UNIT                       | ✓ actions.create                 │
│                                  | ... (32 total)                   │
│ Users with this role: 1          |                                  │
│ • Rayya (rayya@...)              | [Full Permissions List]          │
│                                  |                                  │
│ Status: Active                   | [- Remove Permission]            │
│                                  | [+ Add Permission]               │
│ [Edit]  [Clone]  [Deactivate]    |                                  │
│                                  |                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 6. Access Grants List (`/admin/access-management/access-grants`)
```
┌─ Access Grants (Lifecycle View) ────────────────────────────────────┐
│                                                                      │
│ Status: [All ▼]  User: [_________]  Role: [_________]  Date: [▼]   │
│ [Export CSV]  [Refresh]                                             │
│                                                                      │
│ User        | Role          | Scope    | Status    | Expires  | Act │
│ ────────────────────────────────────────────────────────────────── │
│ rayya@...   | ER_ENG_MGR    | BANK     | APPROVED▲ | Never    | ···│
│ shai@...    | HEAD_TR_ER    | BANK     | APPROVED▲ | Never    | ···│
│ humaam@...  | TR_MANAGER    | BANK     |EXPIRED✕   | 2026-01-01| ···│
│ azwa.moosa. | PLATFORM_OWN  | BANK     | APPROVED▲ | Never    | ···│
│ azwa.moosa  | TR_MANAGER    | DIV02    | PENDING◐  | Never    | ···│
│             |               |          | Awaiting: ziyad.shakir     │
│                                                                      │
│ Legend: ▲ = Approved  ✕ = Expired  ◐ = Pending Approval             │
│ Clicking "···" shows  [Approve] [Suspend] [Extend] [Revoke]        │
│                                                                      │
│ [< Prev]  Page 1 of 5  [Next >]  Showing 1-5 of 42 grants         │
└──────────────────────────────────────────────────────────────────────┘
```

### 7. Compliance Reports (`/admin/access-management/compliance-reports`)
```
┌─ Compliance Reports & Exports ─────────────────────────────────────┐
│                                                                      │
│ ▶ Access Matrix Export                                              │
│   Download User × Role × Permission × Scope matrix as CSV           │
│   [Export]  (Last run: 2026-09-29 by azwa.moosa)                   │
│                                                                      │
│ ▶ Sensitive Field Reveals                                           │
│   All salary, NID, passport reveals (audited access log)            │
│   Date Range: [2026-09-01] to [2026-09-29]                         │
│   [Run Report] [Export CSV]                                         │
│   Sample: 142 reveals found (Anj: 78, Arif: 64)                    │
│                                                                      │
│ ▶ Unauthorized Access Attempts (403s)                               │
│   All API 403 Forbidden responses with context                      │
│   Date Range: [2026-09-01] to [2026-09-29]                         │
│   [Run Report] [Export CSV]                                         │
│   Sample: 12 attempts found                                         │
│            - azwa.moosa.2 accessing ER-2026-0001 (10 times)        │
│            - other.user accessing case outside scope                │
│                                                                      │
│ ▶ Role Assignment Changes                                           │
│   Audit trail of all role grants, revocations, extensions           │
│   Date Range: [2026-09-01] to [2026-09-29]                         │
│   [Run Report] [Export CSV]                                         │
│   Sample: 24 changes (15 granted, 3 revoked, 6 extended)           │
│                                                                      │
│ ▶ Privileged Role Approvals                                         │
│   Dual-approval trail for sensitive roles (PLATFORM_OWNER, etc.)    │
│   Date Range: [2026-09-01] to [2026-09-29]                         │
│   [Run Report] [Export CSV]                                         │
│   Sample: 2 approvals (1 current employee, 1 historical)            │
│            PLATFORM_OWNER granted 2026-01-01, approved by azwa+... │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## API Response Examples

### Create Access Grant (POST /api/admin/access-grants)
```json
Request:
{
  "userId": "uuid-humaam",
  "roleCode": "TR_MANAGER",
  "scopeType": "ORG_UNIT",
  "orgUnitId": "uuid-div01",
  "includeDescendants": true,
  "validFrom": "2026-01-01T00:00:00Z",
  "validTo": null,
  "grantReason": "Increased TR admin responsibilities"
}

Response (201):
{
  "id": "grant-uuid-123",
  "userId": "uuid-humaam",
  "roleCode": "TR_MANAGER",
  "status": "APPROVED",  // auto-approved (non-privileged)
  "validFrom": "2026-01-01T00:00:00Z",
  "validTo": null,
  "createdBy": "uuid-azwa",
  "approvedBy": "uuid-system",  // auto
  "createdAt": "2026-09-29T14:22:00Z",
  "auditEventId": "audit-uuid-456"
}
```

### Approve Grant (POST /api/admin/access-grants/:grantId/approve)
```json
Request:
{
  "approverId": "uuid-ziyad",
  "approvalReason": "Verified with Humaam's manager. Correct."
}

Response (200):
{
  "id": "grant-uuid-123",
  "status": "APPROVED",
  "approvedBy": "uuid-ziyad",
  "approvalReason": "Verified with Humaam's manager...",
  "approvedAt": "2026-09-29T14:25:00Z",
  "auditEventId": "audit-uuid-789"
}
```

### Revoke Grant (PUT /api/admin/access-grants/:grantId)
```json
Request:
{
  "action": "REVOKE",
  "revokedBy": "uuid-azwa",
  "revocationReason": "Employee transferred to Finance (out of scope)"
}

Response (200):
{
  "id": "grant-uuid-123",
  "status": "REVOKED",
  "revokedBy": "uuid-azwa",
  "revocationReason": "...",
  "revokedAt": "2026-09-29T15:00:00Z",
  "auditEventId": "audit-uuid-999"
}
```

---

## Permission Requirements (for Admin UI Access)

The admin UI itself requires permissions:
- `admin.users.manage` – Manage users and grants
- `admin.roles.manage` – Edit roles and permissions
- `admin.access_grants.manage` – Approve/revoke grants
- `audit.read` – View audit reports

**Typical admins**:
- Azwa Moosa (PLATFORM_OWNER) – Full access to all admin functions
- HR Leadership (with custom admin role) – User management only
- Access Approver (ACCESS_APPROVER role) – Approve/revoke only

---

## Security Considerations

1. **Dual Approval**: Granting privileged roles (PLATFORM_OWNER, ACCESS_APPROVER) requires two authorized approvers
2. **Self-Grant Prevention**: Admin cannot approve their own grants
3. **Audit Trail**: Every admin action recorded with actor, timestamp, reason
4. **Rate Limiting**: Grant approvals limited to prevent mass revocation attacks
5. **MFA Required**: Access to admin UI requires multi-factor authentication (future phase)
6. **Session Logs**: Admin sessions logged and can be reviewed/revoked

---

## Implementation Roadmap

### Phase 1 (Current – Sprint 1)
- UI scaffolding (components, routes, forms)
- API endpoints (create, read, update grants)
- Basic listing and filtering
- Read-only compliance reports

### Phase 2
- Role creation/editing UI
- Permission management UI
- Approval workflows and dual-approval
- Advanced reporting and exports
- User bulk import

### Phase 3
- Temporary access with notification to approver
- Access request workflows (user requests → approver reviews)
- Role templates and role inheritance
- Scheduled access (grant starting future date)
- Revocation automation (on employee termination/transfer)

---

## Conclusion

This admin UI provides a complete, auditable access management system that ensures:
- **No hard-coded user permissions** (fully configurable)
- **Full audit trail** (who did what when and why)
- **Maker-checker** enforcement for sensitive roles
- **HR can manage access** without code deployment
- **Security team can review** all access via compliance reports
