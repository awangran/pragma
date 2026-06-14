export default function Loading() {
  return (
    <main className="px-0">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden bg-pdarkblue text-white">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-10 md:h-12 lg:h-14 w-3/4 mx-auto bg-white/20 rounded animate-pulse" aria-hidden />
            <div className="mt-3 h-4 w-2/3 mx-auto bg-white/10 rounded animate-pulse" aria-hidden />
            <div className="max-w-2xl mx-auto mt-6 flex gap-2">
              <div className="flex-1 h-14 bg-white/20 rounded-md animate-pulse" aria-hidden />
              <div className="h-14 w-28 bg-white/20 rounded-md animate-pulse" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access skeleton */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border-2 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                    <div className="h-3 w-40 bg-slate-50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News skeleton */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-6 w-64 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-6 space-y-3 animate-pulse">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-4 w-56 bg-slate-200 rounded" />
                <div className="h-3 w-40 bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works skeleton */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="h-6 w-64 mx-auto bg-slate-200 rounded animate-pulse" />
            <div className="mt-2 h-4 w-80 mx-auto bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 animate-pulse" />
                <div className="h-4 w-24 mx-auto bg-slate-200 rounded" />
                <div className="mt-2 h-3 w-48 mx-auto bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Candidates grid skeleton */}
      <section className="mt-2 px-6 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="h-6 w-64 mx-auto bg-slate-200 rounded animate-pulse" />
            <div className="mt-2 h-4 w-80 mx-auto bg-slate-100 rounded animate-pulse" />
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
          <div className="flex justify-center mt-6">
            <div className="h-10 w-32 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>
      </section>

      {/* CTA skeleton */}
      <section className="py-16 bg-pblue text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="h-6 w-80 mx-auto bg-white/30 rounded animate-pulse" />
          <div className="mt-2 h-4 w-96 mx-auto bg-white/20 rounded animate-pulse" />
          <div className="mt-6 h-10 w-48 mx-auto bg-white/30 rounded-full animate-pulse" />
        </div>
      </section>
    </main>
  );
}