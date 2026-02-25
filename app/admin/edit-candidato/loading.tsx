export default function Loading() {
  return (
    <main className="flex flex-col items-center p-4">
      <div className="mt-12 mb-6 h-8 w-48 rounded bg-slate-200 animate-pulse" aria-hidden />
      <div className="mx-12 mb-6 h-4 w-80 max-w-full rounded bg-slate-100 animate-pulse" aria-hidden />

      <section className="mt-6 w-full max-w-5xl space-y-8" aria-busy>
        <div className="rounded-2xl p-6 shadow-sm bg-slate-50">
          <div className="h-6 w-64 rounded bg-slate-200 animate-pulse" />
          <div className="mt-3 h-3 w-96 max-w-full rounded bg-slate-100 animate-pulse" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-4 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}