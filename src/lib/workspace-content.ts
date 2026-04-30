export const workspaceCards = [
  {
    title: "Roadmap Development",
    href: "/roadmap",
    eyebrow: "Start here",
    description: "Build the consultant-style plan: scope SI, map information flow, define assets, identify gaps, and prepare the path to Level 1 self-assessment.",
  },
  {
    title: "CPCSC Level 1 Controls",
    href: "/controls",
    eyebrow: "Do the work",
    description: "Implement the 13 required controls, record implementation details, assign owners, and attach evidence references.",
  },
  {
    title: "Tools and Templates",
    href: "/resources",
    eyebrow: "Use the aids",
    description: "Download policy starters, scoping worksheets, access review templates, evidence folder guidance, and owner trackers.",
  },
  {
    title: "Reports",
    href: "/reports",
    eyebrow: "Show progress",
    description: "Create the compliance assessment package for internal review, leadership conversations, and self-assessment support.",
  },
];

export const roadmapSteps = [
  {
    step: "1",
    title: "Scoping",
    description: "Identify the federal Specified Information environment before applying controls. This is the first place a consultant would normally start.",
    tasks: [
      "Identify Specified Information (SI) and controlled/protected information not intended for public release.",
      "Map information flow: how SI is received, stored, processed, transmitted, shared, archived, and disposed of.",
      "Define in-scope assets: devices, applications, cloud services, removable media, repositories, users, and administrators.",
    ],
    cta: { label: "Open SI scope worksheet", href: "/resources/specified-information-scope-worksheet.md" },
  },
  {
    step: "2",
    title: "Implement the 13 required controls",
    description: "Translate the Level 1 controls into operational practices your organization can explain and maintain.",
    tasks: [
      "Access Control: limit system access to authorized users and processes with need-to-know permissions.",
      "Identification & Authentication: use unique user IDs and multifactor authentication where required.",
      "System Integrity: maintain anti-malware protection and patch management routines.",
      "Physical Protection: secure physical access to systems and maintain visitor/access records.",
      "Media Protection: sanitize, destroy, or control media and devices that contain SI.",
    ],
    cta: { label: "Open Level 1 controls", href: "/controls" },
  },
  {
    step: "3",
    title: "Assessment and evidence collection",
    description: "Evaluate current posture against the objectives and build an evidence pack that supports the self-assessment record.",
    tasks: [
      "Conduct a gap analysis against the 13 Level 1 controls and official criteria.",
      "Collect evidence references such as access lists, MFA configuration screens, security policies, device-use rules, training records, maintenance logs, and review sign-offs.",
      "Retain supporting evidence and make sure each record is current, understandable, and tied to the scoped SI environment.",
    ],
    cta: { label: "Open evidence workflow", href: "/controls" },
  },
  {
    step: "4",
    title: "Self-assessment and attestation support",
    description: "Prepare the information needed before using Government of Canada self-assessment and supplier profile workflows.",
    tasks: [
      "Confirm CanadaBuys account and supplier profile readiness.",
      "Use the Cyber Centre/Government of Canada self-assessment process to verify implementation status.",
      "Record attestation dates, renewal timing, internal reviewer, and evidence package location.",
    ],
    cta: { label: "Open reports", href: "/reports" },
  },
];

export const resourceItems = [
  { title: "Separation of duties worksheet", href: "/resources/separation-of-duties-worksheet.md", description: "Map duties, conflicts, mitigations, and follow-up owners." },
  { title: "Control owner assignment tracker", href: "/resources/control-owner-assignment-tracker.md", description: "Assign each CPCSC control to an accountable owner and track next actions." },
  { title: "Evidence folder structure guide", href: "/resources/evidence-folder-structure-guide.md", description: "Create a practical source-evidence folder structure and naming convention." },
  { title: "Quarterly access review template", href: "/resources/quarterly-access-review-template.md", description: "Document user access reviews, exceptions, remediation, and sign-off." },
  { title: "System inventory worksheet", href: "/resources/system-inventory-worksheet.md", description: "Define systems, owners, data handled, criticality, and readiness scope." },
  { title: "Specified Information scope worksheet", href: "/resources/specified-information-scope-worksheet.md", description: "Map where federal SI content exists, who accesses it, and which tools handle it." },
  { title: "Policy template starter pack", href: "/resources/policy-template-starter-pack.md", description: "Starter outlines for access control, acceptable use, incident response, asset management, password/MFA, media disposal, and public-content review policies." },
];

export const futureRoadmaps = [
  {
    title: "CPCSC Level 2 roadmap",
    description: "Future support area for the larger control set and third-party audit readiness. Keep Level 1 complete and evidence-backed before expanding scope.",
  },
  {
    title: "CPCSC Level 3 roadmap",
    description: "Future support area for advanced requirements, government audit expectations, and deeper security architecture documentation.",
  },
  {
    title: "ITSP.10.171 / NIST SP 800-171 Rev. 3 expansion",
    description: "Optional future expansion for documenting the broader security architecture and how each control is implemented.",
  },
];
