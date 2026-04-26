export type ControlDefinition = {
  id: number;
  category: string;
  title: string;
  objective: string;
  whatToDo: string[];
  exampleImplementation: string;
  evidenceExamples: string[];
};

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
