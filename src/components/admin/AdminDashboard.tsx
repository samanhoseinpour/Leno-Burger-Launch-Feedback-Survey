import type { Response } from '@prisma/client';
import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { summarizeAll } from '@/lib/stats';
import { toPersianDigits } from '@/lib/format';
import { QUESTIONS } from '@/lib/survey';
import { OrderNoteCell } from '@/components/admin/OrderNoteCell';
import { adminLogout } from '@/app/admin/actions';

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Tehran',
});

export function AdminDashboard({ responses }: { responses: Response[] }) {
  const total = responses.length;
  const perQuestion = summarizeAll(responses);

  return (
    <main className="mx-auto max-w-2xl px-5 pb-8 pt-4">
      <header className="sticky top-0 z-10 -mx-5 flex items-center justify-between gap-4 border-b border-line bg-paper px-5 py-4">
        <div>
          <Brand surface="paper" />
          <p className="mt-2 text-sm text-muted">داشبورد نظرسنجی</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href="/"
            className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-brand hover:text-brand"
          >
            بازگشت به نظرسنجی
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-brand hover:text-brand cursor-pointer"
            >
              خروج
            </button>
          </form>
        </div>
      </header>

      <section className="mt-6 flex items-stretch gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-brand px-5 py-4 text-cream">
          <span className="text-3xl font-bold tabular-nums">
            {toPersianDigits(total)}
          </span>
          <span className="text-sm leading-tight text-cream/85">
            پاسخ
            <br />
            ثبت‌شده
          </span>
        </div>
        <a
          href="/api/admin/export"
          className="flex items-center justify-center rounded-2xl border border-line px-5 text-center text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
        >
          دریافت خروجی CSV
        </a>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold text-muted">
          میانگین و توزیع امتیازها
        </h2>
        {perQuestion.map(({ question, stat }, index) => (
          <div
            key={question.id}
            className="rounded-2xl border border-line bg-cream/30 p-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-cream">
                {toPersianDigits(index + 1)}
              </span>
              <h3 className="pt-0.5 text-sm font-semibold leading-7 text-ink">
                {question.text}
              </h3>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/50">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(stat.average / 5) * 100}%` }}
                />
              </div>
              <span className="tabular-nums text-sm font-bold text-ink">
                {toPersianDigits(stat.average.toFixed(1))}
              </span>
              <span className="text-xs text-muted">از ۵</span>
            </div>

            <div className="mt-4 flex gap-1.5">
              {stat.distribution.map((count, i) => {
                const max = Math.max(1, ...stat.distribution);
                return (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <span className="text-xs tabular-nums text-muted">
                      {toPersianDigits(count)}
                    </span>
                    <div className="flex h-14 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-brand/70"
                        style={{ height: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-center text-[10px] leading-tight text-muted">
                      {question.scale[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-muted">سفارش‌ها و نظرها</h2>
        {total === 0 ? (
          <p className="mt-3 rounded-2xl border border-line bg-cream/30 p-5 text-sm text-muted">
            هنوز نظری ثبت نشده است.
          </p>
        ) : (
          <div className="no-scrollbar mt-3 max-h-[70vh] overflow-auto rounded-2xl border border-line">
            <table className="w-max min-w-full border-collapse text-sm">
              <thead>
                <tr className="text-right text-xs text-muted [&>th]:sticky [&>th]:top-0 [&>th]:bg-cream2 [&>th]:shadow-[inset_0_-1px_0_var(--color-line)]">
                  <th scope="col" className="p-3 font-semibold">
                    نام
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    تلفن
                  </th>
                  {QUESTIONS.map((question) => (
                    <th
                      key={question.id}
                      scope="col"
                      title={question.text}
                      className="whitespace-nowrap p-3 text-center font-semibold"
                    >
                      {question.short}
                    </th>
                  ))}
                  <th scope="col" className="p-3 font-semibold">
                    سفارش / نظر
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    تاریخ
                  </th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r.id} className="border-t border-line align-top">
                    <td className="whitespace-nowrap p-3 text-ink">
                      {r.name ?? '—'}
                    </td>
                    <td
                      dir="ltr"
                      className="whitespace-nowrap p-3 text-start font-mono text-xs text-ink"
                    >
                      {r.phone ?? '—'}
                    </td>
                    {QUESTIONS.map((question) => {
                      const value = r[question.id];
                      const label =
                        typeof value === 'number'
                          ? question.scale[value - 1]
                          : null;
                      const low = typeof value === 'number' && value <= 2;
                      return (
                        <td
                          key={question.id}
                          className={`whitespace-nowrap p-3 text-center text-xs ${
                            label == null
                              ? 'text-muted'
                              : low
                                ? 'font-semibold text-brand'
                                : 'text-ink'
                          }`}
                        >
                          {label ?? '—'}
                        </td>
                      );
                    })}
                    <td className="p-3 align-top">
                      <OrderNoteCell text={r.orderNote} />
                    </td>
                    <td className="whitespace-nowrap p-3 text-muted">
                      {dateFormatter.format(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
