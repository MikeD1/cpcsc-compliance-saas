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
  actionPlan: ExportAction[];
  controls: ExportControl[];
};

const statusLabel: Record<ExportControl["status"], string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  READY_FOR_REVIEW: "Ready for review",
  COMPLETE: "Complete",
};

const priorityLabel = (controlId: number) => (controlId <= 4 ? "Critical" : controlId <= 9 ? "High" : "Medium");

export function buildAssessmentPdf(payload: ExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  let y = 56;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string, size = 16) => {
    ensureSpace(34);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(text, margin, y);
    y += size + 14;
  };

  const writeParagraph = (text: string, size = 10, gap = 14) => {
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, usableWidth);
    ensureSpace(lines.length * (size + 3) + gap);
    doc.text(lines, margin, y);
    y += lines.length * (size + 3) + gap;
  };

  const card = (x: number, width: number, label: string, value: string, detail: string) => {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, width, 78, 14, 14, "FD");
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), x + 14, y + 18);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(22);
    doc.text(value, x + 14, y + 45);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(detail, width - 28), x + 14, y + 62);
  };

  const totalControls = payload.controls.length;
  const complete = payload.controls.filter((control) => control.status === "COMPLETE").length;
  const ready = payload.controls.filter((control) => control.status === "READY_FOR_REVIEW").length;
  const ownerGaps = payload.controls.filter((control) => !control.owner).length;
  const evidenceGaps = payload.controls.filter((control) => control.evidenceItems.length === 0).length;
  const evidenceCoverage = Math.round(((totalControls - evidenceGaps) / Math.max(totalControls, 1)) * 100);
  const executiveSummary =
    payload.readinessPercent >= 80
      ? "The workspace shows strong CPCSC Level 1 readiness progress, with remaining work concentrated in review, evidence, and exception closure."
      : payload.readinessPercent >= 40
        ? "The workspace shows meaningful readiness progress, but buyers will still expect clearer closure of owner, evidence, and review gaps."
        : "The workspace is early in the readiness process. The best next step is to establish ownership, attach evidence, and turn open controls into a credible action plan.";

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, usableWidth, 112, 18, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(payload.assessmentTitle, margin + 24, y + 34);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(payload.organizationName, margin + 24, y + 58);
  doc.text(`Generated ${payload.generatedAt}`, margin + 24, y + 78);
  doc.setFontSize(9);
  doc.text("Internal readiness snapshot — not a certification, audit opinion, or government approval.", margin + 24, y + 96);
  y += 140;

  heading("Executive summary", 17);
  writeParagraph(executiveSummary, 11, 12);
  writeParagraph(`Scope: ${payload.scopeSummary ?? "Not provided"}`, 10, 10);
  writeParagraph(`Status note: ${payload.riskStatement ?? "Not provided"}`, 10, 18);

  ensureSpace(100);
  const cardWidth = (usableWidth - 24) / 4;
  card(margin, cardWidth, "Readiness", `${payload.readinessPercent}%`, `${complete}/${totalControls} complete`);
  card(margin + cardWidth + 8, cardWidth, "Evidence", `${evidenceCoverage}%`, `${totalControls - evidenceGaps}/${totalControls} covered`);
  card(margin + (cardWidth + 8) * 2, cardWidth, "Owner gaps", String(ownerGaps), "unassigned controls");
  card(margin + (cardWidth + 8) * 3, cardWidth, "Review", String(ready), "ready for review");
  y += 104;

  heading("Readiness score explanation", 15);
  writeParagraph(
    `The readiness score is the percentage of CPCSC Level 1 controls marked complete in this workspace. ${complete} of ${totalControls} controls are complete. Controls that are ready for review, in progress, or not started are not counted as complete.`,
    10,
    18,
  );

  heading("Action plan", 15);
  if (payload.actionPlan.length === 0) {
    writeParagraph("No priority actions are currently queued. Export this report for review or begin a deeper assessment pass.", 10, 18);
  } else {
    payload.actionPlan.slice(0, 6).forEach((action, index) => {
      writeParagraph(`${index + 1}. [${action.priority}] ${action.actionType} — ${action.officialId}: ${action.title}. Next: ${action.nextStep}`, 10, 8);
    });
    y += 8;
  }

  heading("Gaps by control priority", 15);
  ["Critical", "High", "Medium"].forEach((priority) => {
    const controls = payload.controls.filter((control) => priorityLabel(control.controlId) === priority);
    const open = controls.filter((control) => control.status !== "COMPLETE" || !control.owner || control.evidenceItems.length === 0);
    writeParagraph(`${priority}: ${open.length} open gap${open.length === 1 ? "" : "s"} across ${controls.length} controls.`, 10, 6);
    open.slice(0, 4).forEach((control) => {
      writeParagraph(`• ${control.officialId}: ${control.title} — ${statusLabel[control.status]}, ${control.owner ?? "unassigned"}, ${control.evidenceItems.length} evidence record(s).`, 9, 4);
    });
    y += 6;
  });

  heading("Evidence coverage summary", 15);
  writeParagraph(`${totalControls - evidenceGaps} of ${totalControls} controls have at least one evidence reference. ${evidenceGaps} controls still need supporting evidence. Evidence entries are register references unless storage/file retention has been separately configured.`, 10, 18);

  heading("Control detail appendix", 15);
  payload.controls.forEach((response) => {
    ensureSpace(150);
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, usableWidth, 28, 10, 10, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${response.officialId}: ${response.title}`, margin + 12, y + 18);
    y += 40;

    writeParagraph(`Official control: ${response.officialName}`, 9, 6);
    writeParagraph(`Priority: ${priorityLabel(response.controlId)} | Category: ${response.category} | Status: ${statusLabel[response.status]} | Owner: ${response.owner ?? "Not assigned"}`, 9, 6);
    writeParagraph(`Review: ${response.reviewCadence ?? "Not reviewed yet"}`, 9, 6);
    writeParagraph(`Implementation: ${response.implementationDetails}`, 9, 6);

    const evidenceText = response.evidenceItems.length
      ? response.evidenceItems
          .map(
            (item, index) =>
              `${index + 1}. ${item.title}${item.artifactType ? ` (${item.artifactType})` : ""}${item.location ? ` — ${item.location}` : ""}${item.notes ? ` — ${item.notes}` : ""}`,
          )
          .join(" ")
      : "No evidence items recorded.";

    writeParagraph(`Evidence: ${evidenceText}`, 9, 14);
  });

  return Buffer.from(doc.output("arraybuffer"));
}
