export default function Loading() {
  return (
    <main className="px-0">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-pdarkblue">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mx-auto mb-5 h-6 w-44 animate-pulse rounded-full bg-white/10" />

            {/* Title */}
            <div className="mx-auto h-10 w-3/4 animate-pulse rounded bg-white/20 md:h-12 lg:h-14" />

            <div className="mx-auto mt-3 h-10 w-2/3 animate-pulse rounded bg-white/20" />

            {/* Description */}
            <div className="mx-auto mt-6 h-4 w-3/4 animate-pulse rounded bg-white/10" />

            <div className="mx-auto mt-2 h-4 w-1/2 animate-pulse rounded bg-white/10" />

            {/* Search */}
            <div className="mx-auto mt-8 flex max-w-2xl gap-2">
              <div className="h-14 flex-1 animate-pulse rounded-md bg-white/20" />

              <div className="h-14 w-28 animate-pulse rounded-md bg-white/20" />
            </div>

            {/* Mini navigation */}
            <div className="mt-5 flex justify-center gap-4">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK ACCESS
      ====================================================== */}

      <section className="border-b bg-white py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

                    <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />
                  </div>

                  <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          LATEST ARTICLES
      ====================================================== */}

      <section className="bg-slate-50/70 py-16">
        <div className="container mx-auto px-6">
          {/* Heading */}
          <div className="mb-8 flex items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="h-3 w-20 animate-pulse rounded bg-sky-100" />

              <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />

              <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-9 w-24 animate-pulse rounded-full bg-white md:block" />
          </div>

          {/* Article cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                {/* Image */}
                <div className="h-44 w-full animate-pulse bg-slate-100" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />

                  <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />

                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW PRAGMA WORKS
      ====================================================== */}

      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          {/* Heading */}
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <div className="mx-auto h-3 w-32 animate-pulse rounded bg-sky-100" />

            <div className="mx-auto mt-3 h-7 w-64 animate-pulse rounded bg-slate-200" />

            <div className="mx-auto mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          {/* Steps */}
          <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
            {/* Connector */}
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-px bg-slate-100 md:block" />

            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="relative rounded-2xl bg-slate-50 p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-white shadow-sm" />

                  <div className="h-3 w-5 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

                <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />

                <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />

                <div className="mt-5 h-3 w-28 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CANDIDATES
      ====================================================== */}

      <section className="border-t border-slate-100 bg-white px-6 py-14">
        <div className="container mx-auto px-6">
          {/* Heading */}
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <div className="mx-auto h-3 w-28 animate-pulse rounded bg-sky-100" />

            <div className="mx-auto mt-3 h-7 w-72 max-w-full animate-pulse rounded bg-slate-200" />

            <div className="mx-auto mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          {/* Candidate cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4"
              >
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />

                  <div className="h-3 w-1/4 animate-pulse rounded bg-slate-50" />
                </div>
              </div>
            ))}
          </div>

          {/* View all button */}
          <div className="mt-7 flex justify-center">
            <div className="h-10 w-48 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </section>
    </main>
  );
}