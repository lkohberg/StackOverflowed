export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">StackOverflowed</h1>
        <p className="mt-3 text-lg text-slate-600">A student hub for IT students at HTL Steyr</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Why this site exists</h2>
        <p className="mt-3 max-w-3xl text-slate-700">
          StackOverflowed is a central place for IT students to discover useful browser games, share study resources, and stay connected as a class.
          The goal is to keep everything practical, simple, and student-friendly.
        </p>
      </section>
    </div>
  );
}
