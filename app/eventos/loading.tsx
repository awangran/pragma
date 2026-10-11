export default function Loading() {
  return (
    <main role="status" aria-label="Cargando agenda de eventos" className="mx-auto w-full max-w-[1514px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <span className="sr-only">Cargando agenda de eventos…</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-6 h-12 rounded-full bg-slate-100" />
        <div className="grid overflow-hidden rounded-[38px] bg-[#f0edff] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6 p-7 sm:p-10 lg:p-12">
            <div className="h-3 w-44 rounded bg-[#ddd7f5]" />
            <div className="space-y-3"><div className="h-12 w-full rounded bg-[#ddd7f5]" /><div className="h-12 w-4/5 rounded bg-[#ddd7f5]" /><div className="h-12 w-3/5 rounded bg-[#ddd7f5]" /></div>
            <div className="space-y-2"><div className="h-3 w-full rounded bg-[#e2def3]" /><div className="h-3 w-5/6 rounded bg-[#e2def3]" /><div className="h-3 w-3/4 rounded bg-[#e2def3]" /></div>
            <div className="h-11 w-44 rounded-full bg-[#d3dcf8]" />
          </div>
          <div className="min-h-[280px] bg-[#dbe4f3] sm:min-h-[350px] lg:min-h-[510px]" />
        </div>
        <div className="mx-auto max-w-6xl pt-12">
          <div className="space-y-3 border-b border-slate-100 pb-6"><div className="h-3 w-24 rounded bg-[#e2def3]" /><div className="h-8 w-3/4 max-w-md rounded bg-slate-100" /></div>
          <div className="my-6 flex flex-wrap gap-3"><div className="h-11 w-64 rounded-full bg-slate-100" /><div className="h-11 w-36 rounded-full bg-[#f0edff]" /></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => <div key={index} className="overflow-hidden rounded-[24px] border border-slate-100"><div className="aspect-[16/10] bg-[#e5eaf5]" /><div className="space-y-3 p-5"><div className="h-3 w-24 rounded bg-[#e2def3]" /><div className="h-5 w-5/6 rounded bg-slate-100" /><div className="h-3 w-full rounded bg-slate-100" /><div className="h-3 w-2/3 rounded bg-slate-100" /></div></div>)}
          </div>
        </div>
      </div>
    </main>
  );
}
