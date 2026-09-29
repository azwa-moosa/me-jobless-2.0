/**
 * Permission catalogue and role bundles.
 *
 * RBAC Refactoring (Sept 2026): Implements new org-structure access model with granular permissions,
 * support for multiple roles per user, data scopes (BANK/ORG_UNIT/SELF/CASE_TEAM/ASSIGNED),
 * sensitive field reveals, temporary access with expiry, and audit logging. All data-driven (not code).
 */

export interface PermissionDef {
  code: string;
  module: string;
  description: string;
  restrictedField?: boolean;
}

export const PERMISSIONS: PermissionDef[] = [
  // ================================================================ Platform & Identity
  { code: 'me.read', module: 'platform', description: 'Sign in and view own profile' },

  // ================================================================ Employee & Org Data
  { code: 'employee.search', module: 'employee', description: 'Search employees within scope (summary fields)' },
  { code: 'employee.read', module: 'employee', description: 'View employee profile within scope (restricted fields masked)' },
  { code: 'employee.positions.read', module: 'employee', description: 'View position history' },
  { code: 'employee.salary.view', module: 'employee', description: 'View salary within scope (restricted field)', restrictedField: true },
  { code: 'employee.salary.reveal', module: 'employee', description: 'Reveal salary to UI (audited, restricted field)', restrictedField: true },
  { code: 'employee.nid.view', module: 'employee', description: 'View NID within scope (restricted field)', restrictedField: true },
  { code: 'employee.nid.reveal', module: 'employee', description: 'Reveal NID to UI (audited, restricted field)', restrictedField: true },
  { code: 'employee.passport.view', module: 'employee', description: 'View passport within scope (restricted field)', restrictedField: true },
  { code: 'employee.passport.reveal', module: 'employee', description: 'Reveal passport to UI (audited, restricted field)', restrictedField: true },
  { code: 'org.read', module: 'org', description: 'Browse organisation hierarchy (as-of any date)' },

  // ================================================================ Configuration & Platform Admin
  { code: 'config.lookups.read', module: 'config', description: 'Read configured lookups and state machines' },
  { code: 'admin.feature_flags.manage', module: 'admin', description: 'View and change feature flags' },
  { code: 'admin.users.read', module: 'admin', description: 'View users and their access grants' },
  { code: 'admin.users.manage', module: 'admin', description: 'Create/edit/delete users, assign roles, manage access grants' },
  { code: 'admin.roles.read', module: 'admin', description: 'View role definitions' },
  { code: 'admin.roles.manage', module: 'admin', description: 'Create/edit/delete roles and permissions' },
  { code: 'admin.access_grants.manage', module: 'admin', description: 'Approve/revoke/extend access grants' },
  { code: 'admin.org_structure.manage', module: 'admin', description: 'Configure organization hierarchy' },

  // ================================================================ Audit & Compliance
  { code: 'audit.read', module: 'audit', description: 'Read audit events for permitted modules' },
  { code: 'audit.verify', module: 'audit', description: 'Run audit hash-chain verification (Verify Chain feature)' },
  { code: 'audit.export', module: 'audit', description: 'Export audit logs for compliance' },

  // ================================================================ Action Centre (My Work)
  { code: 'actions.use', module: 'actions', description: 'My Work: own actions and tasks' },
  { code: 'actions.create', module: 'actions', description: 'Create ad-hoc actions' },
  { code: 'actions.team.read', module: 'actions', description: 'Team Work view for own teams' },
  { code: 'actions.reassign', module: 'actions', description: 'Reassign/delegate actions' },
  { code: 'actions.reopen', module: 'actions', description: 'Reopen completed actions' },
  { code: 'actions.manage', module: 'actions', description: 'Full action management (admin)' },

  // ================================================================ Employee Relations (ER)
  { code: 'er.dashboard.read', module: 'er', description: 'ER dashboard within authorized scope' },
  { code: 'er.case.create', module: 'er', description: 'Create ER case' },
  { code: 'er.case.view', module: 'er', description: 'View ER cases where assigned or on case team (scope-scoped)' },
  { code: 'er.case.view_all', module: 'er', description: 'View all ER cases (portfolio override – requires er.case.view_all_override)' },
  { code: 'er.case.view_all_override', module: 'er', description: 'Manager-level override to view all ER cases' },
  { code: 'er.case.edit', module: 'er', description: 'Add chronology entries, update case details' },
  { code: 'er.case.amend_chronology', module: 'er', description: 'Amend existing chronology entries (if policy permits)' },
  { code: 'er.case.status_change', module: 'er', description: 'Change case status per state machine' },
  { code: 'er.case.team.manage', module: 'er', description: 'Manage case team membership' },
  { code: 'er.case.close', module: 'er', description: 'Close case with reason' },
  { code: 'er.case.close_override', module: 'er', description: 'Close case with override (blocked by open mandatory tasks, requires reason)' },
  { code: 'er.case.access_log.read', module: 'er', description: 'View case access audit log' },
  { code: 'er.investigation.manage', module: 'er', description: 'Manage investigations (ER function)' },
  { code: 'er.grievance.manage', module: 'er', description: 'Manage grievances (ER function)' },
  { code: 'er.disciplinary.manage', module: 'er', description: 'Manage disciplinary matters (ER function)' },

  // ================================================================ People Analytics
  { code: 'analytics.dashboard.read', module: 'analytics', description: 'View published analytics dashboards' },
  { code: 'analytics.upload', module: 'analytics', description: 'Upload analytics datasets' },
  { code: 'analytics.process', module: 'analytics', description: 'Validate and process analytics data' },
  { code: 'analytics.manage', module: 'analytics', description: 'Periods, uploads, validation, metrics, publication' },
  { code: 'analytics.export', module: 'analytics', description: 'Export analytics data' },
  { code: 'analytics.recommendations.view', module: 'analytics', description: 'View analytics recommendations' },

  // ================================================================ Engagement & Fun with Teams
  { code: 'engagement.read', module: 'engagement', description: 'View engagement survey results (thresholded)' },
  { code: 'engagement.survey.create', module: 'engagement', description: 'Create and launch survey cycles' },
  { code: 'engagement.action_plan.manage', module: 'engagement', description: 'Manage action plans from survey results' },
  { code: 'engagement.manage', module: 'engagement', description: 'Full engagement administration' },
  { code: 'fwt.manage', module: 'engagement', description: 'Fun with Teams activities and claims management' },
  { code: 'fwt.claims', module: 'engagement', description: 'Submit/view Fun with Teams activities' },

  // ================================================================ Total Rewards & Compensation
  { code: 'compensation.view', module: 'total_rewards', description: 'View compensation information within scope' },
  { code: 'compensation.edit', module: 'total_rewards', description: 'Edit compensation/salary information' },
  { code: 'salary.view', module: 'total_rewards', description: 'View salary information (restricted field)' },
  { code: 'salary.reveal', module: 'total_rewards', description: 'Reveal salary to UI (audited, restricted field)', restrictedField: true },
  { code: 'salary.edit', module: 'total_rewards', description: 'Edit salary information' },
  { code: 'allowances.manage', module: 'total_rewards', description: 'Manage allowances and benefits' },
  { code: 'total_rewards.manage', module: 'total_rewards', description: 'Full Total Rewards administration' },

  // ================================================================ People Manager
  { code: 'manager.intake', module: 'manager', description: 'People Manager guided intake (own team)' },
  { code: 'manager.tasks', module: 'manager', description: 'View assigned manager tasks' },

  // ================================================================ Employee Voice
  { code: 'voice.submit', module: 'voice', description: 'Submit identified Voice report' },
  { code: 'voice.anonymous', module: 'voice', description: 'Submit anonymous Voice report (if enabled)' },
  { code: 'voice.triage', module: 'voice', description: 'Triage and manage Voice submissions' },
  { code: 'voice.manage', module: 'voice', description: 'Full Voice administration' },

  // ================================================================ Document Studio & Letter Management
  { code: 'documents.request', module: 'documents', description: 'Create document/letter requests' },
  { code: 'documents.approve', module: 'documents', description: 'Approve document requests' },
  { code: 'documents.generate', module: 'documents', description: 'Generate and issue documents' },
  { code: 'documents.manage', module: 'documents', description: 'Full document administration' },

  // ================================================================ Reports & Dashboards
  { code: 'reports.read', module: 'reports', description: 'View reports within scope' },
  { code: 'reports.manage', module: 'reports', description: 'Create and manage reports' },
];

export type ScopeType = 'BANK' | 'ORG_UNIT' | 'CASE_TEAM' | 'ASSIGNED' | 'SELF' | 'NONE';

export interface RoleDef {
  code: string;
  name: string;
  description: string;
  defaultScope: ScopeType;
  allowedScopes: ScopeType[];
  permissions: string[];
  /** Which audit modules this role may read ('*' = all). */
  auditModules?: string[] | '*';
  privileged?: boolean;
  status?: string;
}

// ================================================================ Permission sets (combined for role definitions)
const BASE = ['me.read', 'actions.use'];
const EMP_VIEW = ['employee.search', 'employee.read', 'employee.positions.read', 'org.read', 'config.lookups.read'];
const EMP_SENSITIVE_VIEW = ['employee.salary.view', 'employee.nid.view', 'employee.passport.view'];
const EMP_SENSITIVE_REVEAL = ['employee.salary.reveal', 'employee.nid.reveal', 'employee.passport.reveal'];
const AUDIT_BASE = ['audit.read', 'audit.verify', 'audit.export'];

const ER_OFFICER_BASE = [
  ...BASE, ...EMP_VIEW, 'actions.create', 'actions.team.read',
  'er.dashboard.read', 'er.case.create', 'er.case.view', 'er.case.edit', 'er.case.amend_chronology',
  'er.case.status_change', 'er.investigation.manage', 'er.grievance.manage', 'er.disciplinary.manage',
];

export const ROLES: RoleDef[] = [
  // ================================================================ NEW: Azwa Moosa – Platform Owner / Super Admin (Full Access)
  {
    code: 'PLATFORM_OWNER',
    name: 'Platform Owner / Super Admin',
    description: 'Azwa Moosa – Full application and data access, all modules, audit of all actions',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'ORG_UNIT', 'SELF', 'NONE'],
    permissions: [
      // All platform, admin, audit
      ...BASE, 'me.read', 'admin.users.manage', 'admin.roles.manage', 'admin.access_grants.manage',
      'admin.feature_flags.manage', 'admin.org_structure.manage', 'config.lookups.read',
      // All employee data
      ...EMP_VIEW, ...EMP_SENSITIVE_VIEW, ...EMP_SENSITIVE_REVEAL, 'org.read',
      // All ER
      'er.dashboard.read', 'er.case.create', 'er.case.view', 'er.case.view_all', 'er.case.view_all_override',
      'er.case.edit', 'er.case.amend_chronology', 'er.case.status_change', 'er.case.team.manage',
      'er.case.close', 'er.case.close_override', 'er.case.access_log.read',
      'er.investigation.manage', 'er.grievance.manage', 'er.disciplinary.manage',
      // All analytics, engagement, total rewards
      'analytics.dashboard.read', 'analytics.upload', 'analytics.process', 'analytics.manage', 'analytics.export',
      'analytics.recommendations.view',
      'engagement.read', 'engagement.survey.create', 'engagement.action_plan.manage', 'engagement.manage',
      'fwt.manage', 'fwt.claims',
      'compensation.view', 'compensation.edit', 'salary.view', 'salary.reveal', 'salary.edit', 
      'allowances.manage', 'total_rewards.manage',
      // People Manager, Voice, Documents
      'manager.intake', 'manager.tasks',
      'voice.submit', 'voice.anonymous', 'voice.triage', 'voice.manage',
      'documents.request', 'documents.approve', 'documents.generate', 'documents.manage',
      'reports.read', 'reports.manage',
      // Audit
      ...AUDIT_BASE,
      'actions.create', 'actions.team.read', 'actions.reassign', 'actions.reopen', 'actions.manage',
    ],
    auditModules: '*',
    privileged: true,
    status: 'Active',
  },

  // ================================================================ NEW: Maiz – People & Culture Director (Executive Access)
  {
    code: 'PC_DIRECTOR',
    name: 'People & Culture Director',
    description: 'Maiz – Executive-level visibility across all P&C modules, dashboards, reports, sensitive data',
    defaultScope: 'BANK',
    allowedScopes: ['BANK'],
    permissions: [
      ...BASE, ...EMP_VIEW, ...EMP_SENSITIVE_VIEW,
      'org.read', 'config.lookups.read',
      'er.dashboard.read', 'er.case.view', 'er.case.view_all', 'er.case.access_log.read',
      'analytics.dashboard.read', 'analytics.recommendations.view',
      'engagement.read',
      'compensation.view', 'salary.view', 'total_rewards.manage',
      'manager.intake', 'manager.tasks',
      'voice.submit',
      'documents.request', 'documents.approve',
      'reports.read',
      'audit.read', 'actions.use', 'actions.create', 'actions.team.read',
    ],
    status: 'Active',
  },

  // ================================================================ NEW: Shai – Head of TR & ER
  {
    code: 'HEAD_TR_ER',
    name: 'Head – Total Rewards & Employee Relations',
    description: 'Shai – Full TR + ER function leadership, case management, compensation oversight, team access',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'ORG_UNIT'],
    permissions: [
      ...BASE, ...EMP_VIEW, ...EMP_SENSITIVE_VIEW, ...EMP_SENSITIVE_REVEAL,
      'org.read', 'config.lookups.read', 'actions.create', 'actions.team.read', 'actions.reassign',
      // ER leadership
      'er.dashboard.read', 'er.case.create', 'er.case.view', 'er.case.view_all', 'er.case.view_all_override',
      'er.case.edit', 'er.case.amend_chronology', 'er.case.status_change', 'er.case.team.manage',
      'er.case.close', 'er.case.close_override', 'er.case.access_log.read',
      'er.investigation.manage', 'er.grievance.manage', 'er.disciplinary.manage',
      // Total Rewards
      'compensation.view', 'compensation.edit', 'salary.view', 'salary.reveal', 'salary.edit',
      'allowances.manage', 'total_rewards.manage',
      // Analytics, Engagement
      'analytics.dashboard.read', 'analytics.recommendations.view',
      'engagement.read', 'engagement.action_plan.manage',
      'manager.intake', 'manager.tasks',
      'reports.read',
      'audit.read', 'actions.reopen',
    ],
    auditModules: ['er', 'total_rewards'],
    status: 'Active',
  },

  // ================================================================ NEW: Rayya – ER / Engagement / Analytics Manager
  {
    code: 'ER_ENGAGEMENT_MANAGER',
    name: 'Manager – Employee Relations, Engagement & Analytics',
    description: 'Rayya – Full ER case management, engagement administration, analytics dashboards, team management',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'ORG_UNIT'],
    permissions: [
      ...BASE, ...EMP_VIEW, 'org.read', 'config.lookups.read',
      'actions.create', 'actions.team.read', 'actions.reassign', 'actions.reopen',
      // ER management
      'er.dashboard.read', 'er.case.create', 'er.case.view', 'er.case.view_all', 'er.case.view_all_override',
      'er.case.edit', 'er.case.amend_chronology', 'er.case.status_change', 'er.case.team.manage',
      'er.case.close', 'er.case.close_override', 'er.case.access_log.read',
      'er.investigation.manage', 'er.grievance.manage', 'er.disciplinary.manage',
      // Engagement
      'engagement.read', 'engagement.survey.create', 'engagement.action_plan.manage', 'engagement.manage',
      'fwt.manage',
      // Analytics
      'analytics.dashboard.read', 'analytics.upload', 'analytics.process', 'analytics.recommendations.view',
      'manager.intake', 'manager.tasks',
      'reports.read',
      'audit.read',
    ],
    auditModules: ['er', 'engagement', 'analytics'],
    status: 'Active',
  },

  // ================================================================ NEW: Humaam – Total Rewards Manager
  {
    code: 'TR_MANAGER',
    name: 'Manager – Total Rewards',
    description: 'Humaam – Total Rewards and compensation administration, salary oversight, benefits management',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'ORG_UNIT'],
    permissions: [
      ...BASE, ...EMP_VIEW, ...EMP_SENSITIVE_VIEW, ...EMP_SENSITIVE_REVEAL,
      'org.read', 'config.lookups.read', 'actions.create', 'actions.team.read',
      // Total Rewards focus
      'compensation.view', 'compensation.edit', 'salary.view', 'salary.reveal', 'salary.edit',
      'allowances.manage', 'total_rewards.manage',
      'reports.read', 'audit.read', 'manager.intake', 'manager.tasks',
    ],
    auditModules: ['total_rewards', 'employee'],
    status: 'Active',
  },

  // ================================================================ NEW: Anj – Total Rewards Officer
  {
    code: 'TR_OFFICER',
    name: 'Officer – Total Rewards',
    description: 'Anj – Operational Total Rewards access, salary/compensation data, audited sensitive reveals',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'ORG_UNIT'],
    permissions: [
      ...BASE, ...EMP_VIEW, ...EMP_SENSITIVE_VIEW,
      // Reveals audited
      'employee.salary.reveal', 'employee.nid.reveal', 'employee.passport.reveal',
      'org.read', 'config.lookups.read',
      // Total Rewards operational
      'compensation.view', 'salary.view', 'salary.reveal',
      'actions.use', 'audit.read',
    ],
    auditModules: ['total_rewards', 'employee'],
    status: 'Active',
  },

  // ================================================================ NEW: Arif – Total Rewards Officer
  {
    code: 'TR_OFFICER_2',
    name: 'Officer – Total Rewards (Second)',
    description: 'Arif – Operational Total Rewards access, same as Anj, audited sensitive reveals',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'ORG_UNIT'],
    permissions: [
      ...BASE, ...EMP_VIEW, ...EMP_SENSITIVE_VIEW,
      'employee.salary.reveal', 'employee.nid.reveal', 'employee.passport.reveal',
      'org.read', 'config.lookups.read',
      'compensation.view', 'salary.view', 'salary.reveal',
      'actions.use', 'audit.read',
    ],
    auditModules: ['total_rewards', 'employee'],
    status: 'Active',
  },

  // ================================================================ NEW: Ish – ER Officer (Case-Scoped)
  {
    code: 'ER_OFFICER_ISH',
    name: 'Officer – Employee Relations',
    description: 'Ish – ER case-scoped access: assigned cases, authorized case team membership only',
    defaultScope: 'CASE_TEAM',
    allowedScopes: ['BANK', 'CASE_TEAM', 'ASSIGNED'],
    permissions: [
      ...ER_OFFICER_BASE,
      'voice.submit',
    ],
    auditModules: ['er'],
    status: 'Active',
  },

  // ================================================================ NEW: Azwa Moosa Number 2 – Restricted Test User
  {
    code: 'ER_OFFICER_RESTRICTED',
    name: 'Officer – Employee Relations (Restricted / Security Test)',
    description: 'Azwa Moosa #2 – ER Officer with no case team assignments (for RLS/security testing)',
    defaultScope: 'NONE',
    allowedScopes: ['NONE', 'CASE_TEAM'],
    permissions: [
      ...BASE, ...EMP_VIEW, 'org.read', 'config.lookups.read',
      'actions.use', 'voice.submit',
      // Has ER permissions but no case scope → API/RLS returns 403
      'er.case.view', 'er.dashboard.read',
    ],
    status: 'Active',
  },

  // ================================================================ NEW: Bishwajit – Audit Reviewer
  {
    code: 'AUDIT_REVIEWER_BISH',
    name: 'Reviewer – Audit & Compliance',
    description: 'Bishwajit – Read-only audit log access, hash-chain verification, compliance review',
    defaultScope: 'NONE',
    allowedScopes: ['NONE', 'BANK'],
    permissions: [
      'me.read', 'audit.read', 'audit.verify', 'audit.export',
      'org.read', 'config.lookups.read',
    ],
    auditModules: '*',
    status: 'Active',
  },

  // ================================================================ Previous Roles (Retained for Backward Compatibility)
  {
    code: 'HR_ANALYTICS_ADMIN',
    name: 'HR Analytics Admin',
    description: 'Analytics uploads, validation, metrics, dashboards',
    defaultScope: 'BANK',
    allowedScopes: ['BANK'],
    permissions: [
      ...BASE, ...EMP_VIEW, 'actions.create', 'actions.team.read', 'audit.read',
      'analytics.dashboard.read', 'analytics.upload', 'analytics.process', 'analytics.manage',
      'analytics.export', 'analytics.recommendations.view', 'reports.read',
    ],
    auditModules: ['analytics'],
    status: 'Active',
  },

  {
    code: 'ER_OFFICER_LEGACY',
    name: 'ER Officer (Legacy)',
    description: 'Legacy ER Officer role – superseded by ER_OFFICER_ISH',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'CASE_TEAM', 'ASSIGNED'],
    permissions: ER_OFFICER_BASE,
    status: 'Deprecated—migrate to ER_OFFICER_ISH',
  },

  {
    code: 'ER_MANAGER',
    name: 'ER Manager',
    description: 'ER Manager with portfolio override, all case access',
    defaultScope: 'BANK',
    allowedScopes: ['BANK', 'ORG_UNIT'],
    permissions: [
      ...ER_OFFICER_BASE,
      'er.case.view_all', 'er.case.view_all_override',
      'er.case.team.manage', 'er.case.close', 'er.case.close_override', 'er.case.access_log.read',
      'audit.read', 'actions.reassign', 'actions.reopen',
    ],
    auditModules: ['er'],
    status: 'Active',
  },

  {
    code: 'ENGAGEMENT_HR',
    name: 'Engagement HR',
    description: 'Engagement survey cycles, results, action plans administration',
    defaultScope: 'BANK',
    allowedScopes: ['BANK'],
    permissions: [
      ...BASE, 'employee.search', 'org.read', 'config.lookups.read', 'actions.create', 'actions.team.read',
      'engagement.read', 'engagement.survey.create', 'engagement.action_plan.manage', 'engagement.manage',
      'fwt.manage', 'fwt.claims', 'reports.read', 'audit.read',
    ],
    auditModules: ['engagement'],
    status: 'Active',
  },

  {
    code: 'HR_LEADERSHIP',
    name: 'HR Leadership',
    description: 'HR Leadership — approved analytics, engagement, aggregate dashboards',
    defaultScope: 'BANK',
    allowedScopes: ['BANK'],
    permissions: [
      ...BASE, 'org.read', 'analytics.dashboard.read', 'analytics.recommendations.view',
      'engagement.read', 'reports.read',
    ],
    status: 'Active',
  },

  {
    code: 'DIVISION_HEAD',
    name: 'Division Head',
    description: 'Division or Functional Head — employee data and analytics for their org unit',
    defaultScope: 'ORG_UNIT',
    allowedScopes: ['ORG_UNIT', 'BANK'],
    permissions: [
      ...BASE, 'employee.search', 'employee.read', 'org.read', 'analytics.dashboard.read',
      'engagement.read', 'manager.intake', 'manager.tasks', 'actions.use', 'reports.read',
    ],
    status: 'Active',
  },

  {
    code: 'DEPARTMENT_HEAD',
    name: 'Department Head',
    description: 'Department Head — employee data and dashboards for their department',
    defaultScope: 'ORG_UNIT',
    allowedScopes: ['ORG_UNIT'],
    permissions: [
      ...BASE, 'employee.search', 'employee.read', 'org.read', 'analytics.dashboard.read',
      'engagement.read', 'manager.intake', 'manager.tasks', 'actions.use', 'reports.read',
    ],
    status: 'Active',
  },

  {
    code: 'MANAGER',
    name: 'Manager',
    description: 'People Manager — own team intake, actions',
    defaultScope: 'SELF',
    allowedScopes: ['SELF'],
    permissions: [
      ...BASE, 'manager.intake', 'manager.tasks',
    ],
    status: 'Active',
  },

  {
    code: 'EMPLOYEE',
    name: 'Employee',
    description: 'Employee — own data, voice submission',
    defaultScope: 'SELF',
    allowedScopes: ['SELF'],
    permissions: [...BASE, 'voice.submit'],
    status: 'Active',
  },

  {
    code: 'DOCUMENT_HR',
    name: 'Document HR',
    description: 'Document/Letter HR — document requests, sensitive field reveals (audited)',
    defaultScope: 'BANK',
    allowedScopes: ['BANK'],
    permissions: [
      ...BASE, ...EMP_VIEW, ...EMP_SENSITIVE_REVEAL,
      'actions.create', 'documents.request', 'documents.generate', 'audit.read',
    ],
    auditModules: ['documents', 'employee'],
    status: 'Active',
  },

  {
    code: 'DOCUMENT_APPROVER',
    name: 'Document Approver',
    description: 'Document Approver — approve issued documents',
    defaultScope: 'BANK',
    allowedScopes: ['BANK'],
    permissions: [
      ...BASE, 'documents.approve',
    ],
    status: 'Active',
  },

  {
    code: 'PLATFORM_ADMIN',
    name: 'Platform Administrator',
    description: 'Platform Admin (no business data) — config, feature flags, system settings only',
    defaultScope: 'NONE',
    allowedScopes: ['NONE'],
    permissions: [
      ...BASE, 'admin.feature_flags.manage', 'admin.users.read', 'config.lookups.read', 'org.read', 'audit.read',
    ],
    auditModules: ['platform', 'admin', 'auth', 'config'],
    privileged: true,
    status: 'Active',
  },

  {
    code: 'VOICE_TRIAGE',
    name: 'Voice Triage Officer',
    description: 'Voice Triage — submit and triage employee voice submissions',
    defaultScope: 'NONE',
    allowedScopes: ['NONE', 'BANK'],
    permissions: [
      ...BASE, 'voice.submit', 'voice.triage', 'org.read',
    ],
    auditModules: ['voice'],
    status: 'Proposed',
  },

  {
    code: 'FWT_COORDINATOR',
    name: 'FwT Coordinator',
    description: 'Fun with Teams Coordinator — activities and claims for their org unit',
    defaultScope: 'ORG_UNIT',
    allowedScopes: ['ORG_UNIT'],
    permissions: [
      ...BASE, 'fwt.claims', 'fwt.manage',
    ],
    status: 'Proposed',
  },

  {
    code: 'ACCESS_APPROVER',
    name: 'Access Approver',
    description: 'Access Approver — approve/revoke access grants (super admin approval required for privileged roles)',
    defaultScope: 'NONE',
    allowedScopes: ['NONE'],
    permissions: [
      ...BASE, 'admin.users.read', 'admin.access_grants.manage', 'audit.read',
    ],
    auditModules: ['platform', 'admin', 'auth'],
    privileged: true,
    status: 'Proposed',
  },
];

export const PERMISSION_CODES = new Set(PERMISSIONS.map((p) => p.code));

// Build-time integrity: every role permission must exist in the catalogue.
for (const r of ROLES) for (const p of r.permissions) {
  if (!PERMISSION_CODES.has(p)) throw new Error(`Role ${r.code} references unknown permission ${p}`);
}
