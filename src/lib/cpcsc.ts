export type ControlDefinition = {
  id: number;
  officialId: string;
  officialName: string;
  category: string;
  title: string;
  objective: string;
  whatToDo: string[];
  exampleImplementation: string;
  evidenceExamples: string[];
};

export type CriteriaAlignment = {
  assessmentObjectives: string[];
  assessmentObjects: {
    examine: string[];
    interview: string[];
    test: string[];
  };
  organizationDefinedParameters: string[];
};

export type ControlReadinessGuidance = {
  plainEnglishGoal: string;
  weakImplementationExample: string;
  strongImplementationExample: string;
  commonMistakes: string[];
  buyerQuestions: string[];
  suggestedNextAction: string;
};

export const securityControlFamilies = [
  "Access control",
  "Awareness and training",
  "Audit and accountability",
  "Configuration management",
  "Identification and authentication",
  "Incident response",
  "Maintenance",
  "Media protection",
  "Personnel security",
  "Physical protection",
  "Risk assessment",
  "Security assessment and monitoring",
  "System and communications protection",
  "System and information integrity",
  "Planning",
  "System and services acquisition",
  "Supply chain risk management",
] as const;

export const evidenceRetentionGuidance = [
  "Account lists",
  "Device lists",
  "Access review notes",
  "Copies of security policies",
  "Security, IT, and information management training records",
  "Logs of updates, patching, and sanitization",
  "Visitor logs",
  "Firewall settings or screenshots",
  "MFA configuration screens",
];

export const controls: ControlDefinition[] = [
  {
    id: 1,
    officialId: "03.01.01",
    officialName: "Account management",
    category: "Access control",
    title: "Manage user accounts",
    objective:
      "Keep an accurate record of all user accounts and promptly update access when people join, leave, or change roles.",
    whatToDo: [
      "Keep a list of all user accounts and what they can access.",
      "Add new accounts when people join and disable them when they leave or change roles.",
      "Avoid generic or shared accounts wherever possible.",
      "Review all accounts at least quarterly.",
    ],
    exampleImplementation:
      "Maintain a quarterly-reviewed access register tied to HR onboarding and offboarding. Every account entry includes owner, role, approved systems, date created, and date disabled. HR notifies IT within one business day of staffing changes.",
    evidenceExamples: [
      "User account inventory export",
      "Quarterly access review notes",
      "Onboarding and offboarding checklist",
      "HR-to-IT access change requests",
    ],
  },
  {
    id: 2,
    officialId: "03.01.02",
    officialName: "Access enforcement",
    category: "Access control",
    title: "Give people only the access they need",
    objective:
      "Apply least-privilege access so users only get the systems and permissions required for their jobs.",
    whatToDo: [
      "Assign the minimum access required on a need-to-know basis.",
      "Avoid administrator rights unless absolutely necessary.",
      "Review folder permissions and shared drives regularly.",
    ],
    exampleImplementation:
      "Use role-based groups for finance, project staff, executives, HR, and IT. Access is provisioned through groups rather than one-off permissions, and elevated privileges require manager approval and periodic review.",
    evidenceExamples: [
      "Role-based access matrix",
      "Shared drive permission screenshots",
      "Privileged access approval records",
      "Access review meeting notes",
    ],
  },
  {
    id: 3,
    officialId: "03.01.20",
    officialName: "Use of external systems",
    category: "Access control",
    title: "Use only approved systems and devices",
    objective:
      "Ensure specified information is handled only through approved business tools, systems, and managed devices.",
    whatToDo: [
      "Keep a list of systems approved for handling specified information.",
      "Do not allow personal email, personal cloud storage, or personal devices for government work.",
      "Review vendor security details before adopting new tools.",
    ],
    exampleImplementation:
      "Publish an approved systems list covering email, file sharing, endpoint devices, and cloud platforms. Train staff during onboarding that only managed laptops and approved cloud services may be used for CPCSC-related work.",
    evidenceExamples: [
      "Approved systems and devices list",
      "Vendor security review notes",
      "Onboarding acknowledgement form",
      "Device management screenshots",
    ],
  },
  {
    id: 4,
    officialId: "03.01.22",
    officialName: "Publicly accessible content",
    category: "Access control",
    title: "Prevent sensitive information from being shared publicly",
    objective:
      "Reduce accidental disclosure of specified information in public websites, marketing, proposals, and external communications.",
    whatToDo: [
      "Train staff to recognize specified information.",
      "Review website changes, news releases, sales content, and social posts before publishing.",
      "Periodically check public-facing content for accidental disclosure.",
    ],
    exampleImplementation:
      "Use a mandatory pre-publication checklist for all external content that asks whether specified information, customer names, technical details, or controlled project references are included. One designated reviewer approves outbound public content.",
    evidenceExamples: [
      "External communications review checklist",
      "Training attendance records",
      "Publication approval log",
      "Periodic website review notes",
    ],
  },
  {
    id: 5,
    officialId: "03.05.01",
    officialName: "User identification, authentication, and re-authentication",
    category: "Identification and authentication",
    title: "Use individual accounts and strong passwords",
    objective:
      "Require unique credentials for each user and enforce basic password hygiene and session locking.",
    whatToDo: [
      "Give each user their own private login credential.",
      "Require strong passwords.",
      "Lock systems after a period of inactivity.",
    ],
    exampleImplementation:
      "Enforce minimum password length and complexity through identity providers, prohibit credential sharing, require password manager use for work accounts, and configure laptops and phones to auto-lock after short idle periods.",
    evidenceExamples: [
      "Identity provider password policy screenshot",
      "Screen lock policy screenshot",
      "Security awareness training records",
      "Password manager rollout note",
    ],
  },
  {
    id: 6,
    officialId: "03.05.02",
    officialName: "Device identification and authentication",
    category: "Identification and authentication",
    title: "Approve devices before they connect",
    objective:
      "Allow only approved corporate devices to connect to business systems and networks.",
    whatToDo: [
      "Keep a list of devices allowed on the network.",
      "Block unauthorized devices from connecting to systems.",
    ],
    exampleImplementation:
      "Maintain a device inventory with serial number, assigned owner, approval date, and status. Only enrolled devices can access corporate Wi‑Fi, VPN, email, and file systems.",
    evidenceExamples: [
      "Device inventory export",
      "MDM or endpoint management screenshots",
      "Wi‑Fi or VPN restriction settings",
      "Asset assignment records",
    ],
  },
  {
    id: 7,
    officialId: "03.05.03",
    officialName: "Multi-factor authentication",
    category: "Identification and authentication",
    title: "Enable multifactor authentication",
    objective:
      "Protect privileged accounts and systems storing specified information with multifactor authentication.",
    whatToDo: [
      "Enable MFA for privileged accounts.",
      "Enable MFA for systems that store specified information.",
      "Provide a recovery process for lost work devices.",
    ],
    exampleImplementation:
      "Require app-based MFA for administrators, cloud file storage, remote access, and email systems used for sensitive work. Document a helpdesk recovery flow for lost or replaced devices.",
    evidenceExamples: [
      "MFA policy document",
      "Identity provider MFA configuration screenshots",
      "Privileged account list with MFA status",
      "Recovery procedure document",
    ],
  },
  {
    id: 8,
    officialId: "03.08.03",
    officialName: "Media sanitization",
    category: "Media protection",
    title: "Wipe or destroy old devices",
    objective:
      "Ensure retired media and devices are sanitized or destroyed before disposal so sensitive data cannot be recovered.",
    whatToDo: [
      "Wipe storage on old drives, printers, USB keys, and mobile devices before disposal.",
      "Destroy media that cannot be securely erased.",
    ],
    exampleImplementation:
      "Use a media disposal process that records device ID, method used, date, owner, and disposal outcome. High-risk media containing specified information is physically destroyed rather than resold.",
    evidenceExamples: [
      "Sanitization and destruction log",
      "Disposal certificates from vendors",
      "Asset retirement checklist",
      "Photos or records of destroyed media",
    ],
  },
  {
    id: 9,
    officialId: "03.10.01",
    officialName: "Physical access authorizations",
    category: "Physical protection",
    title: "Keep a list of who can access secure areas",
    objective:
      "Track and review who can enter offices, rooms, or cabinets containing specified information.",
    whatToDo: [
      "Track who has keys, badges, or codes to secure areas.",
      "Remove access when people leave or change roles.",
    ],
    exampleImplementation:
      "Maintain a secure area access register for offices, locked cabinets, and server spaces. Temporary badge access expires automatically and key returns are verified during offboarding.",
    evidenceExamples: [
      "Badge and key assignment log",
      "Offboarding key return checklist",
      "Temporary access approval records",
      "Secure area access spreadsheet",
    ],
  },
  {
    id: 10,
    officialId: "03.10.07",
    officialName: "Physical access control",
    category: "Physical protection",
    title: "Control physical entry",
    objective:
      "Use physical safeguards to restrict access to locations where specified information is stored or processed.",
    whatToDo: [
      "Use locks, keycards, biometrics, or other physical security controls.",
      "Sign in visitors and escort them where specified information exists.",
      "Store printed specified information securely.",
    ],
    exampleImplementation:
      "Require visitor sign-in, escort visitors in controlled spaces, use locked storage for paper records, and place reminders near entry points not to tailgate unauthorized people into restricted areas.",
    evidenceExamples: [
      "Visitor log",
      "Office access policy",
      "Photos of locked storage or door controls",
      "Reception or escort procedure",
    ],
  },
  {
    id: 11,
    officialId: "03.13.01",
    officialName: "Boundary protection",
    category: "Systems and communications protection",
    title: "Use basic network protections",
    objective:
      "Use firewalls and simple network segmentation to protect internal systems from unnecessary exposure.",
    whatToDo: [
      "Install a router or firewall to control online traffic.",
      "Block unnecessary inbound connections.",
      "Separate public-facing systems from internal systems.",
    ],
    exampleImplementation:
      "Use managed firewall rules, disable unused inbound ports, document network changes, and keep any public website or web application separated from internal file stores and employee systems.",
    evidenceExamples: [
      "Firewall rule screenshots",
      "Network diagram",
      "Change log for firewall updates",
      "Managed security appliance configuration export",
    ],
  },
  {
    id: 12,
    officialId: "03.14.01",
    officialName: "Flaw remediation",
    category: "System and information integrity",
    title: "Apply security updates",
    objective:
      "Keep operating systems, browsers, and software current so known vulnerabilities are patched promptly.",
    whatToDo: [
      "Install updates for operating systems, browsers, and software.",
      "Apply critical patches quickly.",
      "Track what has been updated.",
    ],
    exampleImplementation:
      "Enable automatic updates wherever possible, maintain a monthly patching review for key systems, and subscribe to vendor security advisories for core business tools.",
    evidenceExamples: [
      "Patch log",
      "Automatic update policy screenshot",
      "Vendor advisory subscriptions",
      "Monthly maintenance checklist",
    ],
  },
  {
    id: 13,
    officialId: "03.14.02",
    officialName: "Malicious code protection",
    category: "System and information integrity",
    title: "Use antivirus and anti-malware software",
    objective:
      "Deploy reputable anti-malware protection with real-time scanning and a basic incident response trail.",
    whatToDo: [
      "Install reputable antivirus software.",
      "Enable automatic updates and real-time scanning.",
      "Respond to threats when they occur.",
    ],
    exampleImplementation:
      "Use Microsoft Defender or a managed business anti-malware platform on all supported endpoints, schedule regular scans, and keep a simple record of detections and how each incident was resolved.",
    evidenceExamples: [
      "Endpoint protection dashboard screenshot",
      "Threat detection log",
      "Real-time protection settings",
      "Incident resolution notes",
    ],
  },
];

const commonPolicyObjects = ["policy", "procedures", "system security plan", "relevant records"];

export const criteriaAlignmentByOfficialId: Record<string, CriteriaAlignment> = {
  "03.01.01": {
    assessmentObjectives: [
      "A.03.01.01.a: System account types allowed and prohibited are defined.",
      "A.03.01.01.b: System accounts are created, enabled, modified, disabled, and removed according to organizational policy, procedures, prerequisites, and criteria.",
      "A.03.01.01.c: Authorized users, group/role memberships, and access authorizations are specified.",
      "A.03.01.01.d: Access is authorized based on valid authorization and intended system usage.",
      "A.03.01.01.e-f: Account use is monitored and accounts are disabled when expired, inactive, no longer associated with a user, policy-violating, or risky.",
      "A.03.01.01.g-h: Account managers are notified within defined time periods and users log out after expected inactivity or defined circumstances.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "account management procedures", "account lists", "access authorization records", "system audit records"],
      interview: ["account managers", "system administrators", "personnel with information security responsibilities"],
      test: ["mechanisms implementing account management", "account disabling and inactivity controls", "session logout controls"],
    },
    organizationDefinedParameters: ["Inactive account time period", "notification periods for account changes", "expected inactivity/logout time period", "logout circumstances"],
  },
  "03.01.02": {
    assessmentObjectives: [
      "A.03.01.02: Access to systems and specified information is enforced according to assigned authorizations, privileges, and least-privilege rules.",
      "A.03.01.02: Access authorizations are reflected in system permissions, groups, roles, and privileged access settings.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "access control lists", "group membership records", "privilege assignments", "system audit records"],
      interview: ["personnel with access enforcement responsibilities", "system administrators", "information security personnel"],
      test: ["mechanisms enforcing access control", "role/group permission settings", "privileged access restrictions"],
    },
    organizationDefinedParameters: [],
  },
  "03.01.20": {
    assessmentObjectives: [
      "A.03.01.20.a: Use of external systems is prohibited unless specifically authorized.",
      "A.03.01.20.b: Security requirements for external systems are established before access or use is allowed.",
      "A.03.01.20.c: External systems are used for organizational access or specified information only after requirements are verified and agreements are retained.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "approved external systems list", "connection or processing agreements", "external system security requirements"],
      interview: ["system owners", "system administrators", "personnel approving external system use"],
      test: ["mechanisms restricting external system access", "configuration preventing unapproved tools or devices"],
    },
    organizationDefinedParameters: ["Security requirements that external systems must satisfy"],
  },
  "03.01.22": {
    assessmentObjectives: [
      "A.03.01.22: Publicly accessible content is reviewed before posting and monitored so specified information is not inadvertently disclosed.",
      "A.03.01.22: The organization removes or corrects public content that exposes specified information.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "public content review procedures", "publication approval records", "public website or communication review logs"],
      interview: ["public communications personnel", "information security personnel", "content reviewers"],
      test: ["mechanisms or procedures for reviewing public content", "sampling public content for specified information"],
    },
    organizationDefinedParameters: [],
  },
  "03.05.01": {
    assessmentObjectives: [
      "A.03.05.01: Users, processes acting on behalf of users, and devices are uniquely identified.",
      "A.03.05.01: Identities are authenticated before access is allowed and re-authenticated when required.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "identity provider settings", "password or authenticator policies", "session lock settings"],
      interview: ["system administrators", "identity administrators", "users with authentication responsibilities"],
      test: ["login and re-authentication mechanisms", "screen/session lock controls", "unique account enforcement"],
    },
    organizationDefinedParameters: ["Re-authentication events or conditions where applicable"],
  },
  "03.05.02": {
    assessmentObjectives: [
      "A.03.05.02: Devices are identified and authenticated before connecting to organizational systems or networks.",
      "A.03.05.02: Only approved or authorized devices are permitted to connect where specified information is handled.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "device inventory", "MDM or endpoint management records", "network admission settings"],
      interview: ["endpoint administrators", "network administrators", "information security personnel"],
      test: ["device authentication mechanisms", "network access restrictions", "MDM enrolment controls"],
    },
    organizationDefinedParameters: [],
  },
  "03.05.03": {
    assessmentObjectives: [
      "A.03.05.03: Multifactor authentication is implemented for privileged accounts.",
      "A.03.05.03: Multifactor authentication is implemented for systems that access, process, store, or transmit specified information where required.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "MFA configuration records", "privileged account lists", "identity provider reports"],
      interview: ["identity administrators", "system administrators", "privileged users"],
      test: ["MFA challenge and enforcement mechanisms", "privileged access login flow", "recovery process controls"],
    },
    organizationDefinedParameters: [],
  },
  "03.08.03": {
    assessmentObjectives: [
      "A.03.08.03: Media containing specified information is sanitized or destroyed before disposal, release, or reuse.",
      "A.03.08.03: Sanitization methods and outcomes are recorded and retained.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "media sanitization procedures", "disposal logs", "destruction certificates", "asset retirement records"],
      interview: ["asset owners", "IT personnel", "facilities or disposal personnel"],
      test: ["media sanitization process", "asset disposal workflow", "record retention for retired media"],
    },
    organizationDefinedParameters: [],
  },
  "03.10.01": {
    assessmentObjectives: [
      "A.03.10.01: Physical access authorizations are developed, approved, maintained, and reviewed.",
      "A.03.10.01: Physical access is removed when access is no longer required.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "physical access authorization lists", "badge/key records", "access review records"],
      interview: ["facilities personnel", "physical security personnel", "managers approving access"],
      test: ["badge/key authorization workflow", "physical access removal process", "access list review process"],
    },
    organizationDefinedParameters: ["Physical access review frequency where defined by the organization"],
  },
  "03.10.07": {
    assessmentObjectives: [
      "A.03.10.07: Physical access to locations where specified information is handled is controlled.",
      "A.03.10.07: Visitors and temporary access are managed, logged, and escorted where required.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "visitor logs", "facility access procedures", "photos or records of physical controls"],
      interview: ["reception or facilities personnel", "physical security personnel", "system or information owners"],
      test: ["door, lock, badge, visitor, or escort procedures", "secure storage practices"],
    },
    organizationDefinedParameters: [],
  },
  "03.13.01": {
    assessmentObjectives: [
      "A.03.13.01: System boundaries are monitored and controlled.",
      "A.03.13.01: Communications at external boundaries and key internal boundaries are protected using boundary protection mechanisms.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "network diagrams", "firewall or router rules", "boundary protection configurations", "change records"],
      interview: ["network administrators", "system administrators", "information security personnel"],
      test: ["firewall or router rules", "network segmentation", "public exposure checks"],
    },
    organizationDefinedParameters: ["System boundaries and interfaces that require monitoring or control"],
  },
  "03.14.01": {
    assessmentObjectives: [
      "A.03.14.01: Flaws are identified, reported, and corrected in a timely manner.",
      "A.03.14.01: Security-relevant updates are installed and remediation is tracked.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "patch management records", "vulnerability or update reports", "maintenance logs"],
      interview: ["IT administrators", "system owners", "information security personnel"],
      test: ["patch deployment mechanisms", "update status reporting", "exception/remediation process"],
    },
    organizationDefinedParameters: ["Time period for installing updates or correcting flaws where defined"],
  },
  "03.14.02": {
    assessmentObjectives: [
      "A.03.14.02: Malicious code protection is implemented at system entry and exit points and on endpoints where required.",
      "A.03.14.02: Malicious code protection is updated, scans are performed, and detections are addressed.",
    ],
    assessmentObjects: {
      examine: [...commonPolicyObjects, "endpoint protection configuration", "malware scan records", "detection and response logs"],
      interview: ["endpoint administrators", "security operations personnel", "system users where relevant"],
      test: ["anti-malware update status", "real-time protection settings", "detection alert workflow"],
    },
    organizationDefinedParameters: ["Frequency of scans or updates where defined"],
  },
};

export function getCriteriaAlignment(control: ControlDefinition): CriteriaAlignment {
  return criteriaAlignmentByOfficialId[control.officialId] ?? {
    assessmentObjectives: [`${control.officialId}: Confirm the control is implemented and operating for systems handling specified information.`],
    assessmentObjects: {
      examine: [...commonPolicyObjects, ...control.evidenceExamples],
      interview: ["control owner", "system administrator", "information security personnel"],
      test: ["mechanisms or procedures implementing the control"],
    },
    organizationDefinedParameters: [],
  };
}

const categoryMistakes: Record<string, string[]> = {
  "Access control": [
    "Saying access is handled informally without showing who approves, reviews, or removes it.",
    "Relying on shared accounts, personal tools, or one-off permissions that are hard to review later.",
  ],
  "Identification and authentication": [
    "Listing password or MFA intentions without showing the actual identity-provider settings.",
    "Treating privileged accounts the same as standard user accounts.",
  ],
  "Media protection": [
    "Disposing of devices without a repeatable wipe, destruction, or vendor-certificate record.",
    "Keeping no link between asset inventory, retirement, and sanitization outcomes.",
  ],
  "Physical protection": [
    "Assuming office locks are enough without documenting who has access and how visitors are controlled.",
    "Forgetting printed records, cabinets, badges, keys, and temporary access in the evidence trail.",
  ],
  "Systems and communications protection": [
    "Using a firewall but not documenting inbound exposure, network boundaries, or change history.",
    "Mixing public-facing systems with internal systems without a clear separation story.",
  ],
  "System and information integrity": [
    "Relying on automatic tools without keeping a simple review or exception trail.",
    "Recording that protection exists but not showing update status, detection history, or remediation follow-up.",
  ],
};

export function getControlReadinessGuidance(control: ControlDefinition): ControlReadinessGuidance {
  const evidenceLead = control.evidenceExamples[0]?.toLowerCase() ?? "a current policy, register, screenshot, or review note";
  const evidenceSecond = control.evidenceExamples[1]?.toLowerCase() ?? "a supporting record";
  const mistakes = categoryMistakes[control.category] ?? [
    "Writing a general intention without showing the process, owner, cadence, and evidence trail.",
    "Marking the control complete before evidence is current enough to support a buyer conversation.",
  ];

  return {
    plainEnglishGoal: `Be able to explain how your organization can ${control.objective.charAt(0).toLowerCase()}${control.objective.slice(1)}`,
    weakImplementationExample: `We have a process for ${control.title.toLowerCase()} and handle it when needed.`,
    strongImplementationExample: control.exampleImplementation,
    commonMistakes: mistakes,
    buyerQuestions: [
      `Who owns ${control.title.toLowerCase()} and how often is it reviewed?`,
      "What record would you show to prove this control is operating today?",
      "If something changes, how would the evidence and owner be updated?",
    ],
    suggestedNextAction: `Add a short implementation note and attach at least one evidence record, such as ${evidenceLead} or ${evidenceSecond}.`,
  };
}
