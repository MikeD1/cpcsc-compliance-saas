import { jsPDF } from "jspdf";

type ExportControl = {
  controlId: number;
  officialId: string;
  officialName: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETE";
  title: string;
  category: string;
  owner?: string | null;
  reviewCadence?: string | null;
  implementationDetails: string;
  evidenceItems: Array<{
    title: string;
    artifactType?: string | null;
    location?: string | null;
    notes?: string | null;
  }>;
};

type ExportAction = {
  officialId: string;
  title: string;
  actionType: string;
  priority: string;
  nextStep: string;
};

type ExportPayload = {
  organizationName: string;
  assessmentTitle: string;
  scopeSummary: string | null;
  riskStatement: string | null;
  generatedAt: string;
  readinessPercent: number;
  readinessDiagnosis: {
    confidenceLevel: string;
    headline: string;
    why: string[];
    strongestArea: string;
    riskiestGaps: Array<{ officialId: string; title: string; reason: string }>;
    evidenceQualityWarnings: string[];
  };
  attestationPackage: {
    renewalStatus: string;
    expiresAt: string | null;
    daysUntilExpiry: number | null;
    checklist: Array<{ label: string; complete: boolean }>;
  };
  criteriaCoverage: { total: number; covered: number; percent: number; totalOdps: number; unresolvedOdps: number };
  scopeInventory: { completedFields: number; totalFields: number; percent: number };
  evidenceQuality: { strong: number; weak: number; missing: number; checks: string[] };
  actionPlan: ExportAction[];
  controls: ExportControl[];
};

const statusLabel: Record<ExportControl["status"], string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  READY_FOR_REVIEW: "Ready for review",
  COMPLETE: "Complete",
};

const statusTone: Record<ExportControl["status"], [number, number, number]> = {
  NOT_STARTED: [100, 116, 139],
  IN_PROGRESS: [2, 132, 199],
  READY_FOR_REVIEW: [217, 119, 6],
  COMPLETE: [5, 150, 105],
};

const priorityLabel = (controlId: number) => (controlId <= 4 ? "Critical" : controlId <= 9 ? "High" : "Medium");

const slate950: [number, number, number] = [15, 23, 42];
const slate700: [number, number, number] = [51, 65, 85];
const slate500: [number, number, number] = [100, 116, 139];
const slate200: [number, number, number] = [226, 232, 240];
const slate50: [number, number, number] = [248, 250, 252];
const cyan700: [number, number, number] = [14, 116, 144];

export function buildAssessmentPdf(payload: ExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 44;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  let y = 54;

  const totalControls = payload.controls.length;
  const complete = payload.controls.filter((control) => control.status === "COMPLETE").length;
  const evidenceGaps = payload.controls.filter((control) => control.evidenceItems.length === 0).length;
  const evidenceCoverage = Math.round(((totalControls - evidenceGaps) / Math.max(totalControls, 1)) * 100);

  const setText = (color: [number, number, number]) => doc.setTextColor(color[0], color[1], color[2]);
  const setFill = (color: [number, number, number]) => doc.setFillColor(color[0], color[1], color[2]);
  const setDraw = (color: [number, number, number]) => doc.setDrawColor(color[0], color[1], color[2]);

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 56) addPage();
  };

  const textLines = (text: string, width = usableWidth) => doc.splitTextToSize(text, width) as string[];

  const writeText = (text: string, options: { size?: number; gap?: number; width?: number; x?: number; color?: [number, number, number]; bold?: boolean } = {}) => {
    const size = options.size ?? 10;
    const x = options.x ?? margin;
    const width = options.width ?? usableWidth;
    const lines = textLines(text, width);
    ensureSpace(lines.length * (size + 3) + (options.gap ?? 12));
    setText(options.color ?? slate700);
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(lines, x, y);
    y += lines.length * (size + 3) + (options.gap ?? 12);
  };

  const sectionTitle = (eyebrow: string, title: string, detail?: string) => {
    ensureSpace(detail ? 72 : 48);
    setText(cyan700);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(eyebrow.toUpperCase(), margin, y);
    y += 15;
    setText(slate950);
    doc.setFontSize(17);
    doc.text(title, margin, y);
    y += 18;
    if (detail) writeText(detail, { size: 9, gap: 12, color: slate500 });
  };

  const metricCard = (x: number, width: number, label: string, value: string, detail: string, accent: [number, number, number]) => {
    setDraw([214, 226, 240]);
    setFill([255, 255, 255]);
    doc.roundedRect(x, y, width, 88, 14, 14, "FD");
    setFill(accent);
    doc.roundedRect(x, y, width, 5, 14, 14, "F");
    setText(slate500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), x + 14, y + 24);
    setText(slate950);
    doc.setFontSize(23);
    doc.text(value, x + 14, y + 52);
    setText(slate700);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(textLines(detail, width - 28), x + 14, y + 70);
  };

  const pill = (x: number, yPos: number, label: string, fill: [number, number, number], color: [number, number, number]) => {
    const width = doc.getTextWidth(label) + 18;
    setFill(fill);
    doc.roundedRect(x, yPos - 10, width, 18, 9, 9, "F");
    setText(color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(label, x + 9, yPos + 2);
    return width;
  };

  // Cover / hero.
  setFill(slate950);
  doc.roundedRect(margin, y, usableWidth, 154, 20, 20, "F");
  setFill([8, 47, 73]);
  doc.circle(pageWidth - 78, y + 30, 110, "F");
  setFill([14, 116, 144]);
  doc.circle(pageWidth - 36, y + 106, 72, "F");
  setText([165, 243, 252]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("COMPLIANCEONE • CPCSC LEVEL 1", margin + 24, y + 28);
  setText([255, 255, 255]);
  doc.setFontSize(27);
  doc.text(payload.assessmentTitle, margin + 24, y + 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(payload.organizationName, margin + 24, y + 88);
  setText([203, 213, 225]);
  doc.setFontSize(9.5);
  doc.text(`Generated ${payload.generatedAt}`, margin + 24, y + 111);
  doc.text("Self-assessment support package for readiness, evidence retention, and future assessment conversations.", margin + 24, y + 132);
  y += 184;

  sectionTitle("Executive summary", "Readiness snapshot", payload.readinessDiagnosis.headline);

  const cardWidth = (usableWidth - 30) / 4;
  ensureSpace(110);
  metricCard(margin, cardWidth, "Readiness", `${payload.readinessPercent}%`, `${complete}/${totalControls} controls complete`, [8, 145, 178]);
  metricCard(margin + cardWidth + 10, cardWidth, "Evidence", `${evidenceCoverage}%`, `${totalControls - evidenceGaps}/${totalControls} controls covered`, [5, 150, 105]);
  metricCard(margin + (cardWidth + 10) * 2, cardWidth, "Criteria", `${payload.criteriaCoverage.percent}%`, `${payload.criteriaCoverage.covered}/${payload.criteriaCoverage.total} statements`, [37, 99, 235]);
  metricCard(margin + (cardWidth + 10) * 3, cardWidth, "Renewal", payload.attestationPackage.renewalStatus, payload.attestationPackage.expiresAt ?? "expiry not set", [217, 119, 6]);
  y += 112;

  const halfWidth = (usableWidth - 14) / 2;
  ensureSpace(112);
  setDraw(slate200);
  setFill(slate50);
  doc.roundedRect(margin, y, halfWidth, 104, 16, 16, "FD");
  doc.roundedRect(margin + halfWidth + 14, y, halfWidth, 104, 16, 16, "FD");
  writeCardText(margin + 16, y + 22, halfWidth - 32, "Scope", payload.scopeSummary ?? "Not provided");
  writeCardText(margin + halfWidth + 30, y + 22, halfWidth - 32, "Status note", payload.riskStatement ?? "Not provided");
  y += 132;

  sectionTitle("Package checklist", "Self-assessment support package");
  const checklistItemHeight = 26;
  ensureSpace(payload.attestationPackage.checklist.length * checklistItemHeight + 32);
  payload.attestationPackage.checklist.forEach((item, index) => {
    const rowY = y + index * checklistItemHeight;
    setFill(index % 2 === 0 ? [248, 250, 252] : [255, 255, 255]);
    doc.roundedRect(margin, rowY - 14, usableWidth, 22, 8, 8, "F");
    setText(slate700);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(item.label, margin + 12, rowY);
    pill(pageWidth - margin - 70, rowY - 1, item.complete ? "Ready" : "Missing", item.complete ? [209, 250, 229] : [254, 243, 199], item.complete ? [6, 95, 70] : [146, 64, 14]);
  });
  y += payload.attestationPackage.checklist.length * checklistItemHeight + 12;
  writeText(
    `Scope inventory: ${payload.scopeInventory.completedFields}/${payload.scopeInventory.totalFields} areas documented. Evidence quality: ${payload.evidenceQuality.strong} strong, ${payload.evidenceQuality.weak} thin, ${payload.evidenceQuality.missing} missing. ODPs to decide: ${payload.criteriaCoverage.totalOdps}.`,
    { size: 9.5, gap: 18 },
  );

  sectionTitle("Confidence basis", "Why this score looks the way it does");
  writeText(
    `Confidence level: ${payload.readinessDiagnosis.confidenceLevel}. The readiness score counts controls marked complete. The narrative also considers owner assignment, evidence references, and review state.`,
    { size: 10, gap: 10 },
  );
  payload.readinessDiagnosis.why.forEach((reason) => writeText(`• ${reason}`, { size: 9, gap: 4 }));
  writeText(`Strongest area: ${payload.readinessDiagnosis.strongestArea}`, { size: 9, gap: 14, bold: true });

  sectionTitle("Priority gaps", "Riskiest buyer-conversation gaps");
  if (payload.readinessDiagnosis.riskiestGaps.length === 0) {
    writeText("No obvious high-risk gaps from the current workspace data.", { size: 10, gap: 12 });
  } else {
    payload.readinessDiagnosis.riskiestGaps.forEach((gap) => {
      writeText(`${gap.officialId}: ${gap.title} — ${gap.reason}`, { size: 9.5, gap: 6 });
    });
  }
  if (payload.readinessDiagnosis.evidenceQualityWarnings.length > 0) {
    writeText(`Evidence quality watchlist: ${payload.readinessDiagnosis.evidenceQualityWarnings.join(", ")}.`, { size: 9, gap: 14, color: [146, 64, 14] });
  }

  sectionTitle("Action plan", "Next work to strengthen the package");
  if (payload.actionPlan.length === 0) {
    writeText("No priority actions are currently queued. Export this report for review or begin a deeper assessment pass.", { size: 10, gap: 18 });
  } else {
    payload.actionPlan.slice(0, 6).forEach((action, index) => {
      ensureSpace(52);
      setDraw(slate200);
      setFill([255, 255, 255]);
      doc.roundedRect(margin, y, usableWidth, 44, 12, 12, "FD");
      setText(cyan700);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${index + 1}. ${action.priority} • ${action.actionType}`.toUpperCase(), margin + 12, y + 15);
      setText(slate950);
      doc.setFontSize(9.5);
      doc.text(`${action.officialId}: ${action.title}`, margin + 12, y + 29);
      setText(slate700);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(textLines(`Next: ${action.nextStep}`, usableWidth - 220), margin + 190, y + 15);
      y += 52;
    });
  }

  sectionTitle("Control priority summary", "Open gaps by priority");
  ["Critical", "High", "Medium"].forEach((priority) => {
    const controls = payload.controls.filter((control) => priorityLabel(control.controlId) === priority);
    const open = controls.filter((control) => control.status !== "COMPLETE" || !control.owner || control.evidenceItems.length === 0);
    writeText(`${priority}: ${open.length} open gap${open.length === 1 ? "" : "s"} across ${controls.length} controls.`, { size: 10, gap: 4, bold: true });
    open.slice(0, 4).forEach((control) => {
      writeText(`• ${control.officialId}: ${control.title} — ${statusLabel[control.status]}, ${control.owner ?? "unassigned"}, ${control.evidenceItems.length} evidence record(s).`, { size: 8.8, gap: 3 });
    });
    y += 5;
  });

  sectionTitle(
    "Evidence quality",
    "Coverage and proof quality",
    `${totalControls - evidenceGaps} of ${totalControls} controls have at least one evidence reference. Evidence entries are register references unless storage/file retention has been separately configured.`,
  );
  payload.evidenceQuality.checks.forEach((check) => writeText(`• ${check}`, { size: 9, gap: 4 }));
  y += 10;

  sectionTitle("Appendix", "Control detail appendix", "Detailed implementation notes and evidence references by CPCSC Level 1 control.");
  payload.controls.forEach((control) => {
    ensureSpace(122);
    const startY = y;
    setDraw([203, 213, 225]);
    setFill([255, 255, 255]);
    doc.roundedRect(margin, y, usableWidth, 104, 14, 14, "FD");
    setFill([248, 250, 252]);
    doc.roundedRect(margin, y, usableWidth, 30, 14, 14, "F");
    setText(slate950);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${control.officialId}: ${control.title}`, margin + 12, y + 19);
    const tone = statusTone[control.status];
    pill(pageWidth - margin - 100, y + 18, statusLabel[control.status], [240, 249, 255], tone);

    y += 44;
    writeCompactLine("Official control", control.officialName);
    writeCompactLine("Priority / family", `${priorityLabel(control.controlId)} • ${control.category}`);
    writeCompactLine("Owner / review", `${control.owner ?? "Not assigned"} • ${control.reviewCadence ?? "Not reviewed yet"}`);

    const implementation = control.implementationDetails || "No implementation details recorded.";
    const evidenceText = control.evidenceItems.length
      ? control.evidenceItems
          .slice(0, 3)
          .map((item, index) => `${index + 1}. ${item.title}${item.artifactType ? ` (${item.artifactType})` : ""}${item.location ? ` — ${item.location}` : ""}`)
          .join("  ")
      : "No evidence items recorded.";

    y = Math.max(y, startY + 104) + 10;
    writeText(`Implementation: ${implementation}`, { size: 8.5, gap: 4 });
    writeText(`Evidence: ${evidenceText}${control.evidenceItems.length > 3 ? ` + ${control.evidenceItems.length - 3} more` : ""}`, { size: 8.5, gap: 10 });
  });

  addFooters();

  function writeCardText(x: number, startY: number, width: number, label: string, value: string) {
    setText(cyan700);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), x, startY);
    setText(slate700);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(textLines(value, width), x, startY + 17);
  }

  function writeCompactLine(label: string, value: string) {
    setText(slate500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`${label.toUpperCase()}:`, margin + 12, y);
    setText(slate700);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(textLines(value, usableWidth - 142), margin + 118, y);
    y += 14;
  }

  function addFooters() {
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      setDraw(slate200);
      doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
      setText(slate500);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("ComplianceOne CPCSC Level 1 readiness package", margin, pageHeight - 18);
      doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin - 52, pageHeight - 18);
    }
  }

  return Buffer.from(doc.output("arraybuffer"));
}
