import Link from 'next/link';

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-8 text-[#18352b] sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e2763b]">Your account</p>
        <h1 className="mt-2 text-3xl font-black">Study profile</h1>
        <section className="mt-8 rounded-[2rem] border border-[#dce8e0] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#f3b28e] text-3xl">🎓</div>
            <div>
              <p className="text-lg font-black">JAMB learner</p>
              <p className="text-sm text-[#6a8277]">Building a stronger study streak</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f4f7f5] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#789083]">Streak</p>
              <p className="mt-2 text-2xl font-black">🔥 5 days</p>
            </div>
            <div className="rounded-2xl bg-[#f4f7f5] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#789083]">Target</p>
              <p className="mt-2 text-2xl font-black">285 / 400</p>
            </div>
          </div>
          <Link href="/dashboard" className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-[#18352b] px-5 text-sm font-black text-white hover:bg-[#285443]">
            View progress
          </Link>
        </section>
      </div>
    </main>
  );
}
