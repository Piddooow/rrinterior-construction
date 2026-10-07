import type { Dictionary } from "@/i18n";
import { ProcessSteps } from "@/components/process-steps";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { FeatureSpotlight } from "@/components/ui/feature-spotlight";
import { ProgressBoard } from "@/components/progress-board";

/**
 * Seksi "Proses konsultasi" — SATU komponen untuk Beranda dan Layanan
 * (konsistensi Tahap H4): heading + FeatureSpotlight dengan ilustrasi laporan
 * mingguan yang sama, catatan contoh, dan CTA. Langkah dibaca dari basis
 * data; bila jumlahnya bukan 5 (tidak dipetakan ke lima kartu ilustrasi),
 * modul jatuh kembali ke daftar statis agar tidak ada langkah yang hilang.
 */

export type ProcessStepView = {
  number: string;
  title: string;
  description: string;
};

const SPOT_IDS = ["brief", "survey", "design", "progress", "handover"] as const;

export function ProcessSection({
  dict,
  steps,
}: {
  dict: Dictionary;
  steps: ProcessStepView[];
}) {
  const spotlightFeatures =
    steps.length === SPOT_IDS.length
      ? steps.map((step, index) => ({
          title: step.title,
          body: step.description,
          spot: SPOT_IDS[index],
        }))
      : [];

  return (
    <section
      id="process"
      className="rounded-md bg-subtle px-5 py-12 text-ink sm:px-8 sm:py-16"
      aria-labelledby="process-title"
    >
      <div data-reveal className="max-w-2xl">
        <h2
          id="process-title"
          className="font-display text-balance text-3xl leading-tight sm:text-4xl"
        >
          {dict.process.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-2 sm:text-base">
          {dict.process.intro}
        </p>
      </div>
      {steps.length === 0 ? (
        <p className="mt-12 text-sm text-ink-2">{dict.process.empty}</p>
      ) : spotlightFeatures.length === SPOT_IDS.length ? (
        <>
          <FeatureSpotlight
            features={spotlightFeatures}
            screenshot={
              <ProgressBoard labels={dict.servicesPage.spotlight.board} />
            }
            screenshotSize={{ width: 640, height: 440 }}
            labels={{
              region: dict.servicesPage.spotlight.region,
              showing: dict.servicesPage.spotlight.showing,
            }}
            className="mt-10"
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-3">
            {dict.servicesPage.spotlight.illustrationNote}
          </p>
        </>
      ) : (
        <ProcessSteps steps={steps} empty={dict.process.empty} />
      )}
      <div data-reveal className="mt-8">
        <WhatsAppButton
          message={dict.wa.process}
          label={dict.process.cta}
          variant="secondary"
        />
      </div>
    </section>
  );
}
