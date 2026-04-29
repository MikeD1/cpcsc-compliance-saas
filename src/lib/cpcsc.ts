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

export type AssessmentCriterion = {
  id: string;
  text: string;
};

export type CriteriaChecklist = {
  determinationStatements: AssessmentCriterion[];
  organizationDefinedParameters: AssessmentCriterion[];
};

export type CriteriaAlignmentSummary = {
  assessmentObjectives: string[];
  assessmentObjects: {
    examine: string[];
    interview: string[];
    test: string[];
  };
  organizationDefinedParameters: string[];
};

export type CriteriaAlignment = CriteriaAlignmentSummary & {
  determinationStatements: AssessmentCriterion[];
  organizationDefinedParameterDetails: AssessmentCriterion[];
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

export const exactCriteriaByOfficialId: Record<string, CriteriaChecklist> = {
  "03.01.01": {
    "organizationDefinedParameters": [
      {
        "id": "A.03.01.01.ODP[01]",
        "text": "the time period for account inactivity before disabling is defined"
      },
      {
        "id": "A.03.01.01.ODP[02]",
        "text": "the time period within which to notify account managers and designated personnel or roles when accounts are no longer required is defined"
      },
      {
        "id": "A.03.01.01.ODP[03]",
        "text": "the time period within which to notify account managers and designated personnel or roles when users are terminated or transferred is defined"
      },
      {
        "id": "A.03.01.01.ODP[04]",
        "text": "the time period within which to notify account managers and designated personnel or roles when system usage or the need-to-know changes for an individual is defined"
      },
      {
        "id": "A.03.01.01.ODP[05]",
        "text": "the time period of expected inactivity requiring users to log out of the system is defined"
      },
      {
        "id": "A.03.01.01.ODP[06]",
        "text": "circumstances requiring users to log out of the system are defined"
      }
    ],
    "determinationStatements": [
      {
        "id": "A.03.01.01.a[01]",
        "text": "system account types allowed are defined"
      },
      {
        "id": "A.03.01.01.a[02]",
        "text": "system account types prohibited are defined"
      },
      {
        "id": "A.03.01.01.b[01]",
        "text": "system accounts are created in accordance with organizational policy, procedures, prerequisites, and criteria"
      },
      {
        "id": "A.03.01.01.b[02]",
        "text": "system accounts are enabled in accordance with organizational policy, procedures, prerequisites, and criteria"
      },
      {
        "id": "A.03.01.01.b[03]",
        "text": "system accounts are modified in accordance with organizational policy, procedures, prerequisites, and criteria"
      },
      {
        "id": "A.03.01.01.b[04]",
        "text": "system accounts are disabled in accordance with organizational policy, procedures, prerequisites, and criteria"
      },
      {
        "id": "A.03.01.01.b[05]",
        "text": "system accounts are removed in accordance with organizational policy, procedures, prerequisites, and criteria"
      },
      {
        "id": "A.03.01.01.c.01",
        "text": "authorized users of the system are specified"
      },
      {
        "id": "A.03.01.01.c.02",
        "text": "group and role memberships are specified"
      },
      {
        "id": "A.03.01.01.c.03",
        "text": "access authorizations (in other words, privileges) for each account are specified"
      },
      {
        "id": "A.03.01.01.d.01",
        "text": "access to the system is authorized based on a valid access authorization"
      },
      {
        "id": "A.03.01.01.d.02",
        "text": "access to the system is authorized based on intended system usage"
      },
      {
        "id": "A.03.01.01.e",
        "text": "the use of system accounts is monitored"
      },
      {
        "id": "A.03.01.01.f.01",
        "text": "system accounts are disabled when the accounts have expired"
      },
      {
        "id": "A.03.01.01.f.02",
        "text": "system accounts are disabled when the accounts have been inactive for <A.03.01.01.ODP[01]: time period>"
      },
      {
        "id": "A.03.01.01.f.03",
        "text": "system accounts are disabled when the accounts are no longer associated with a user or individual"
      },
      {
        "id": "A.03.01.01.f.04",
        "text": "system accounts are disabled when the accounts violate organizational policy"
      },
      {
        "id": "A.03.01.01.f.05",
        "text": "system accounts are disabled when significant risks associated with individuals are discovered"
      },
      {
        "id": "A.03.01.01.g.01",
        "text": "account managers and designated personnel or roles are notified within <A.03.01.01.ODP[02]: time period> when accounts are no longer required"
      },
      {
        "id": "A.03.01.01.g.02",
        "text": "account managers and designated personnel or roles are notified within <A.03.01.01.ODP[03]: time period> when users are terminated or transferred"
      },
      {
        "id": "A.03.01.01.g.03",
        "text": "account managers and designated personnel or roles are notified within <A.03.01.01.ODP[04]: time period> when system usage or the need-to-know changes for an individual"
      },
      {
        "id": "A.03.01.01.h",
        "text": "users are required to log out of the system after <A.03.01.01.ODP[05]: time period> of expected inactivity or when the following circumstances occur: <A.03.01.01.ODP[06]: circumstances>"
      }
    ]
  },
  "03.01.02": {
    "organizationDefinedParameters": [],
    "determinationStatements": [
      {
        "id": "A.03.01.02[01]",
        "text": "approved authorizations for logical access to specified information are enforced in accordance with applicable access control policies"
      },
      {
        "id": "A.03.01.02[02]",
        "text": "approved authorizations for logical access to system resources are enforced in accordance with applicable access control policies"
      }
    ]
  },
  "03.01.20": {
    "organizationDefinedParameters": [
      {
        "id": "A.03.01.20.ODP",
        "text": "security requirements to be satisfied on external systems prior to allowing the use of or access to those systems by authorized individuals are defined"
      }
    ],
    "determinationStatements": [
      {
        "id": "A.03.01.20.a",
        "text": "the use of external systems is prohibited unless the systems are specifically authorized"
      },
      {
        "id": "A.03.01.20.b",
        "text": "the following security requirements to be satisfied on external systems prior to allowing the use of or access to those systems by authorized individuals are established: <A.03.01.20.ODP: security requirements>"
      },
      {
        "id": "A.03.01.20.c.01",
        "text": "authorized individuals are permitted to use external systems to access the organizational system or to process, store, or transmit specified information only after verifying that the security requirements on the external systems as specified in the organization’s system security plans have been satisfied"
      },
      {
        "id": "A.03.01.20.c.02",
        "text": "authorized individuals are permitted to use external systems to access the organizational system or to process, store, or transmit specified information only after retaining approved system connection or processing agreements with the organizational entity hosting the external systems"
      },
      {
        "id": "A.03.01.20.d",
        "text": "the use of organization-controlled portable storage devices by authorized individuals on external systems is restricted"
      }
    ]
  },
  "03.01.22": {
    "organizationDefinedParameters": [],
    "determinationStatements": [
      {
        "id": "A.03.01.22.a",
        "text": "authorized individuals are trained to ensure that publicly accessible information does not contain specified information"
      },
      {
        "id": "A.03.01.22.b[01]",
        "text": "the content on publicly accessible systems is reviewed for specified information"
      },
      {
        "id": "A.03.01.22.b[02]",
        "text": "specified information is removed from publicly accessible systems, if discovered"
      }
    ]
  },
  "03.05.01": {
    "organizationDefinedParameters": [
      {
        "id": "A.03.05.01.ODP",
        "text": "circumstances or situations that require re-authentication are defined"
      }
    ],
    "determinationStatements": [
      {
        "id": "A.03.05.01.a[01]",
        "text": "system users are uniquely identified"
      },
      {
        "id": "A.03.05.01.a[02]",
        "text": "system users are authenticated"
      },
      {
        "id": "A.03.05.01.a[03]",
        "text": "processes acting on behalf of users are associated with uniquely identified and authenticated system users"
      },
      {
        "id": "A.03.05.01.b",
        "text": "users are re-authenticated when <A.03.05.01.ODP: circumstances or situations>"
      }
    ]
  },
  "03.05.02": {
    "organizationDefinedParameters": [
      {
        "id": "A.03.05.02.ODP",
        "text": "devices or types of devices to be uniquely identified and authenticated before establishing a connection are defined"
      }
    ],
    "determinationStatements": [
      {
        "id": "A.03.05.02[01]",
        "text": "<A.03.05.02.ODP: devices or types of devices> are uniquely identified before establishing a system connection"
      },
      {
        "id": "A.03.05.02[02]",
        "text": "<A.03.05.02.ODP: devices or types of devices> are authenticated before establishing a system connection"
      }
    ]
  },
  "03.05.03": {
    "organizationDefinedParameters": [],
    "determinationStatements": [
      {
        "id": "A.03.05.03[01]",
        "text": "strong multi-factor authentication for access to privileged accounts is implemented"
      },
      {
        "id": "A.03.05.03[02]",
        "text": "strong multi-factor authentication for access to non-privileged accounts is implemented"
      }
    ]
  },
  "03.08.03": {
    "organizationDefinedParameters": [],
    "determinationStatements": [
      {
        "id": "A.03.08.03",
        "text": "system media that contain specified information are sanitized prior to disposal, release out of organizational control, or release for reuse"
      }
    ]
  },
  "03.10.01": {
    "organizationDefinedParameters": [
      {
        "id": "A.03.10.01.ODP",
        "text": "the frequency at which to review the access list detailing authorized physical access by individuals is defined"
      }
    ],
    "determinationStatements": [
      {
        "id": "A.03.10.01.a[01]",
        "text": "a list of individuals with authorized access to the facility where the system resides is developed"
      },
      {
        "id": "A.03.10.01.a[02]",
        "text": "a list of individuals with authorized access to the facility where the system resides is approved"
      },
      {
        "id": "A.03.10.01.a[03]",
        "text": "a list of individuals with authorized access to the facility where the system resides is maintained"
      },
      {
        "id": "A.03.10.01.b",
        "text": "authorization credentials for facility access are issued"
      },
      {
        "id": "A.03.10.01.c",
        "text": "the physical access list is reviewed <A.03.10.01.ODP: frequency>"
      },
      {
        "id": "A.03.10.01.d",
        "text": "individuals from the physical access list are removed when access is no longer required"
      }
    ]
  },
  "03.10.07": {
    "organizationDefinedParameters": [],
    "determinationStatements": [
      {
        "id": "A.03.10.07.a.01",
        "text": "physical access authorizations are enforced at entry and exit points to the facility where the system resides by verifying individual physical access authorizations before granting access"
      },
      {
        "id": "A.03.10.07.a.02",
        "text": "physical access authorizations are enforced at entry and exit points to the facility where the system resides by controlling ingress and egress with physical access control systems, devices, or guards"
      },
      {
        "id": "A.03.10.07.b",
        "text": "physical access audit logs for entry or exit points are maintained"
      },
      {
        "id": "A.03.10.07.c[01]",
        "text": "visitors are escorted"
      },
      {
        "id": "A.03.10.07.c[02]",
        "text": "visitor activity is controlled"
      },
      {
        "id": "A.03.10.07.d",
        "text": "keys, combinations, and other physical access devices are secured"
      },
      {
        "id": "A.03.10.07.e",
        "text": "physical access to output devices is controlled to prevent unauthorized individuals from obtaining access to specified information"
      }
    ]
  },
  "03.13.01": {
    "organizationDefinedParameters": [],
    "determinationStatements": [
      {
        "id": "A.03.13.01.a[01]",
        "text": "communications at external managed interfaces to the system are monitored"
      },
      {
        "id": "A.03.13.01.a[02]",
        "text": "communications at external managed interfaces to the system are controlled"
      },
      {
        "id": "A.03.13.01.a[03]",
        "text": "communications at key internal managed interfaces within the system are monitored"
      },
      {
        "id": "A.03.13.01.a[04]",
        "text": "communications at key internal managed interfaces within the system are controlled"
      },
      {
        "id": "A.03.13.01.b",
        "text": "subnetworks are implemented for publicly accessible system components that are physically or logically separated from internal networks"
      },
      {
        "id": "A.03.13.01.c",
        "text": "external system connections are only made through managed interfaces that consist of boundary protection devices arranged in accordance with an organizational security architecture"
      }
    ]
  },
  "03.14.01": {
    "organizationDefinedParameters": [
      {
        "id": "A.03.14.01.ODP[01]",
        "text": "the time period within which to install security-relevant software updates after the release of the updates is defined"
      },
      {
        "id": "A.03.14.01.ODP[02]",
        "text": "the time period within which to install security-relevant firmware updates after the release of the updates is defined"
      }
    ],
    "determinationStatements": [
      {
        "id": "A.03.14.01.a[01]",
        "text": "system flaws are identified"
      },
      {
        "id": "A.03.14.01.a[02]",
        "text": "system flaws are reported"
      },
      {
        "id": "A.03.14.01.a[03]",
        "text": "system flaws are corrected"
      },
      {
        "id": "A.03.14.01.b[01]",
        "text": "security-relevant software updates are installed within <A.03.14.01.ODP[01]: time period> of the release of the updates"
      },
      {
        "id": "A.03.14.01.b[02]",
        "text": "security-relevant firmware updates are installed within <A.03.14.01.ODP[02]: time period> of the release of the updates"
      }
    ]
  },
  "03.14.02": {
    "organizationDefinedParameters": [
      {
        "id": "A.03.14.02.ODP",
        "text": "the frequency at which malicious code protection mechanisms perform scans is defined"
      }
    ],
    "determinationStatements": [
      {
        "id": "A.03.14.02.a[01]",
        "text": "malicious code protection mechanisms are implemented at system entry and exit points to detect malicious code"
      },
      {
        "id": "A.03.14.02.a[02]",
        "text": "malicious code protection mechanisms are implemented at system entry and exit points to eradicate malicious code"
      },
      {
        "id": "A.03.14.02.b",
        "text": "malicious code protection mechanisms are updated as new releases are available in accordance with configuration management policy and procedures"
      },
      {
        "id": "A.03.14.02.c.01[01]",
        "text": "malicious code protection mechanisms are configured to perform scans of the system <A.03.14.02.ODP: frequency>"
      },
      {
        "id": "A.03.14.02.c.01[02]",
        "text": "malicious code protection mechanisms are configured to perform real-time scans of files from external sources at endpoints or system entry and exit points as the files are downloaded, opened, or executed"
      },
      {
        "id": "A.03.14.02.c.02",
        "text": "malicious code protection mechanisms are configured to block or quarantine malicious code, or take other mitigation actions in response to malicious code detection"
      }
    ]
  }
} as const;


const commonPolicyObjects = ["policy", "procedures", "system security plan", "relevant records"];

export const criteriaAlignmentByOfficialId: Record<string, CriteriaAlignmentSummary> = {
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
  const exactCriteria = exactCriteriaByOfficialId[control.officialId] ?? {
    determinationStatements: [
      {
        id: control.officialId,
        text: "Confirm the control is implemented and operating for systems handling specified information.",
      },
    ],
    organizationDefinedParameters: [],
  };
  const summaryAlignment = criteriaAlignmentByOfficialId[control.officialId] ?? {
    assessmentObjectives: [`${control.officialId}: Confirm the control is implemented and operating for systems handling specified information.`],
    assessmentObjects: {
      examine: [...commonPolicyObjects, ...control.evidenceExamples],
      interview: ["control owner", "system administrator", "information security personnel"],
      test: ["mechanisms or procedures implementing the control"],
    },
    organizationDefinedParameters: [],
  };

  return {
    ...summaryAlignment,
    determinationStatements: exactCriteria.determinationStatements,
    organizationDefinedParameterDetails: exactCriteria.organizationDefinedParameters,
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
