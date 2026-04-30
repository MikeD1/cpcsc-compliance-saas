import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";
import { buildAssessmentPdf } from "@/lib/export";

export async function GET() {
  const { organization, assessment, controlCards, actionSummary, priorityActions, readinessDiagnosis, attestationPackage, criteriaCoverage, scopeInventory, evidenceQuality } = await getDashboardData();

  const pdf = buildAssessmentPdf({
    organizationName: organization.legalName ?? organization.name,
    assessmentTitle: assessment.title,
    scopeSummary: assessment.scopeSummary,
    riskStatement: assessment.riskStatement,
    generatedAt: new Date().toISOString().slice(0, 10),
    readinessPercent: actionSummary.readinessPercent,
    readinessDiagnosis,
    attestationPackage,
    criteriaCoverage,
    scopeInventory,
    evidenceQuality,
    actionPlan: priorityActions.map((action) => ({ 
      officialId: action.officialId,
      title: action.title,
      actionType: action.actionType,
      priority: action.priority,
      nextStep: action.nextStep,
    })),
    controls: controlCards.map((control) => ({
      controlId: control.id,
      officialId: control.officialId,
      officialName: control.officialName,
      title: control.title,
      category: control.category,
      status: (control.response?.status ?? "NOT_STARTED") as "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETE",
      owner: control.response?.owner,
      reviewCadence: control.response?.reviewCadence,
      implementationDetails: control.response?.implementationDetails ?? control.exampleImplementation,
      evidenceItems: (control.response?.evidenceItems ?? []).map((item) => ({
        title: item.title,
        artifactType: item.artifactType,
        location: item.location,
        notes: null,
      })),
    })),
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="cpcsc-level-1-assessment.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
