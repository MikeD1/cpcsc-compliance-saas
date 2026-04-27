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

type ExportPayload = {
  organizationName: string;
  assessmentTitle: string;
  scopeSummary: string | null;
  riskStatement: string | null;
  generatedAt: string;
  controls: ExportControl[];
};

const statusLabel: Record<ExportControl["status"], string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  READY_FOR_REVIEW: "Ready for review",
  COMPLETE: "Complete",
};

export function buildAssessmentPdf(payload: ExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  let y = 56;

  const writeParagraph = (text: string, size = 11, gap = 16) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, usableWidth);
    if (y + lines.length * (size + 3) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += lines.length * (size + 3) + gap;
  };

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, usableWidth, 92, 18, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(payload.assessmentTitle, margin + 24, y + 34);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(payload.organizationName, margin + 24, y + 56);
  doc.text(`Generated ${payload.generatedAt}`, margin + 24, y + 74);
  y += 120;

  doc.setTextColor(15, 23, 42);
  writeParagraph(`Scope summary: ${payload.scopeSummary ?? "Not provided"}`);
  writeParagraph(`Risk statement: ${payload.riskStatement ?? "Not provided"}`);

  payload.controls.forEach((response) => {
    if (y > doc.internal.pageSize.getHeight() - 180) {
      doc.addPage();
      y = margin;
    }

    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, usableWidth, 24, 12, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${response.officialId}: ${response.title}`, margin + 14, y + 16);
    y += 36;

    writeParagraph(`Official control: ${response.officialName}`, 10, 10);
    writeParagraph(`Category: ${response.category}`, 10, 10);
    writeParagraph(`Status: ${statusLabel[response.status]}`, 10, 10);
    writeParagraph(`Owner: ${response.owner ?? "Not assigned"}`, 10, 10);
    writeParagraph(`Review cadence: ${response.reviewCadence ?? "Not set"}`, 10, 10);
    writeParagraph(`Implementation: ${response.implementationDetails}`, 10, 10);

    const evidenceText = response.evidenceItems.length
      ? response.evidenceItems
          .map(
            (item, index) =>
              `${index + 1}. ${item.title}${item.artifactType ? ` (${item.artifactType})` : ""}${item.location ? ` — ${item.location}` : ""}${item.notes ? ` — ${item.notes}` : ""}`,
          )
          .join(" ")
      : "No evidence items recorded.";

    writeParagraph(`Evidence: ${evidenceText}`, 10, 18);
  });

  return Buffer.from(doc.output("arraybuffer"));
}
