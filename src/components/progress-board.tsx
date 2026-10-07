import type { Dictionary } from "@/i18n";

type BoardLabels = Dictionary["servicesPage"]["spotlight"]["board"];

/**
 * Mock "laporan progres proyek" untuk FeatureSpotlight. Dirender pada ukuran
 * desain 640×440 px lalu diperkecil seperti tangkapan layar; setiap kartu
 * membawa `data-spot` yang disorot kamera. Ini ilustrasi — bukan aplikasi
 * nyata, dan catatan itu ditampilkan bersama modulnya.
 */
export function ProgressBoard({ labels }: { labels: BoardLabels }) {
  return (
    <div className="relative flex h-full w-full flex-col gap-3 bg-canvas p-4 text-[13px] text-ink">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-wider text-ink-3 uppercase">
            {labels.week}
          </p>
          <p className="text-[16px] font-semibold">{labels.project}</p>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-1 text-[12px] text-ink-2">
          {labels.status}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-3">
        <BoardCard
          spot="brief"
          title={labels.briefTitle}
          body={labels.briefBody}
        />
        <BoardCard
          spot="survey"
          title={labels.surveyTitle}
          body={labels.surveyBody}
        />
        <BoardCard
          spot="design"
          title={labels.designTitle}
          body={labels.designBody}
        />

        <div
          data-spot="progress"
          className="col-span-2 flex flex-col gap-2 rounded-md border border-line bg-surface p-3"
        >
          <p className="text-[12px] text-ink-3">{labels.progressTitle}</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full w-4/5 rounded-full bg-ink" />
          </div>
          <p className="text-pretty">{labels.progressBody}</p>
          <div className="mt-auto flex gap-2">
            <span className="flex h-11 flex-1 items-center justify-center rounded-sm border border-line bg-canvas text-[10px] text-ink-3">
              {labels.photoLabel} 01
            </span>
            <span className="flex h-11 flex-1 items-center justify-center rounded-sm border border-line bg-canvas text-[10px] text-ink-3">
              {labels.photoLabel} 02
            </span>
          </div>
        </div>

        <div
          data-spot="handover"
          className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3"
        >
          <p className="text-[12px] text-ink-3">{labels.handoverTitle}</p>
          <ul className="flex flex-col gap-1.5 text-[12px] text-ink-2">
            {[0, 1, 2].map((row) => (
              <li key={row} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={
                    row < 2
                      ? "flex size-3.5 items-center justify-center rounded-sm bg-ink text-[9px] text-canvas"
                      : "flex size-3.5 rounded-sm border border-line-strong"
                  }
                >
                  {row < 2 ? "✓" : ""}
                </span>
                <span className="h-1.5 flex-1 rounded-full bg-line" />
              </li>
            ))}
          </ul>
          <p className="mt-auto text-[11px] leading-snug text-ink-3">
            {labels.handoverBody}
          </p>
        </div>
      </div>
    </div>
  );
}

function BoardCard({
  spot,
  title,
  body,
}: {
  spot: string;
  title: string;
  body: string;
}) {
  return (
    <div
      data-spot={spot}
      className="flex flex-col gap-1.5 rounded-md border border-line bg-surface p-3"
    >
      <p className="text-[12px] text-ink-3">{title}</p>
      <p className="text-pretty">{body}</p>
    </div>
  );
}
