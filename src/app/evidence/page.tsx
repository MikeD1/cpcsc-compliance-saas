import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { EvidenceCapture } from "@/components/evidence/evidence-capture";
import { EvidenceRecordActions } from "@/components/evidence/evidence-record-actions";
import { getCurrentAccess } from "@/lib/access";
import { getDashboardData } from "@/lib/dashboard";

export default async function EvidencePage() {
  const access = await getCurrentAccess();

  if (!access.user) {
    redirect("/login");
  }

  if (!access.hasActiveSubscription) {
    return (
      <AppShell organizationName={access.user.organization?.name}>
        <SubscriptionGate plan={access.latestSubscription?.planSlug} status={access.latestSubscription?.status} organizationId={access.user.organization?.id} />
      </AppShell>
    );
  }

  const { recentEvidence, controlCards } = await getDashboardData();
  const controlOptions = controlCards.filter((control) => control.response).map((control) => ({
    id: control.response!.id,
    displayId: control.id,
    title: control.title,
    category: control.category,
  }));

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#09111f_0%,#0d1d34_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Evidence register</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight lg:text-5xl">Track evidence references by control.</h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Record evidence names, types, and locations so reviewers know what supports each control. File upload storage is planned; for now this is an evidence register.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Recent evidence records</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {recentEvidence.length === 0 ? (
              <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-slate-600 md:col-span-2">
                No evidence records yet. Add your first record below by selecting a control and entering the document name, evidence type, and where the artifact is stored.
              </div>
            ) : null}
            {recentEvidence.map((item) => (
              <div key={item.id} className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Control {item.controlId}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.controlTitle}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                  <span>{item.artifactType}</span>
                  <span>{item.location}</span>
                </div>
                <EvidenceRecordActions evidence={item} controlId={item.controlRowId} controls={controlOptions} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <EvidenceCapture controls={controlOptions} />

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Evidence by control</p>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {controlCards.map((control) => (
            <article key={control.id} className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-950">
                  Control {control.id}: {control.title}
                </h3>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {(control.response?.evidenceItems ?? []).length} items
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {(control.response?.evidenceItems ?? []).length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No evidence records linked yet.
                  </div>
                ) : null}
                {(control.response?.evidenceItems ?? []).map((item) => (
                  <div key={item.id} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <p className="font-medium text-slate-950">{item.title}</p>
                    <p className="mt-1 text-slate-500">{item.location}</p>
                    <EvidenceRecordActions evidence={item} controlId={control.response?.id ?? ""} controls={controlOptions} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
