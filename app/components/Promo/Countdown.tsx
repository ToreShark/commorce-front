"use client";

import { useEffect, useState } from "react";
import { formatLongDate, timeLeft, type TimeLeft } from "@/app/lib/promo/format";
import { usePromoClock } from "@/app/lib/promo/clock";
import { getPromoTexts } from "@/app/lib/promo/texts";

interface CountdownProps {
  startsAt: string;
  endsAt: string;
  /** Не позднее какой даты объявим итоги — для состояния «акция завершена». */
  resultsBy: string;
  /** onDark — для бургундского финального блока. */
  tone?: "light" | "onDark";
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Обратный отсчёт до конца акции (или до начала, если она ещё не началась).
 *
 * На сервере и при гидратации — прочерки: время сервера и браузера расходится
 * на секунды, и цифры из HTML не совпали бы с первым рендером в браузере
 * (hydration mismatch). Настоящее время появляется сразу после монтирования.
 *
 * Время — по часам сервера (usePromoClock): часы телефона бывают сбиты.
 */
export default function Countdown({ startsAt, endsAt, resultsBy, tone = "light" }: CountdownProps) {
  const texts = getPromoTexts().countdown;
  const { offset } = usePromoClock();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now() + offset);
    const timer = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(timer);
  }, [offset]);

  const startMs = Date.parse(startsAt);
  const endMs = Date.parse(endsAt);
  const notStarted = now !== null && now < startMs;
  const left: TimeLeft | null = now === null ? null : timeLeft(notStarted ? startMs : endMs, now);
  const ended = now !== null && left === null;

  const muted = tone === "onDark" ? "text-white/70" : "text-qgray";
  const strong = tone === "onDark" ? "text-white" : "text-qblack";
  const cell =
    tone === "onDark" ? "border-white/25 bg-white/10" : "border-qgray-border bg-white";

  if (ended) {
    return <p className={`text-base font-600 ${strong}`}>{texts.ended(formatLongDate(resultsBy))}</p>;
  }

  const units: { value: string; label: string }[] = [
    { value: left ? String(left.days) : "––", label: texts.days },
    { value: left ? pad(left.hours) : "––", label: texts.hours },
    { value: left ? pad(left.minutes) : "––", label: texts.minutes },
    { value: left ? pad(left.seconds) : "––", label: texts.seconds },
  ];

  return (
    <div>
      <p className={`mb-2 text-xs font-600 uppercase tracking-[0.14em] ${muted}`}>
        {notStarted ? texts.notStarted(formatLongDate(startsAt)) : texts.label}
      </p>
      {/* Читалке — одной строкой и без секунд, цифры ниже для неё скрыты */}
      {left && (
        <span className="sr-only">
          {`${left.days} ${texts.days} ${left.hours} ${texts.hours} ${left.minutes} ${texts.minutes}`}
        </span>
      )}
      <div className="flex gap-2" aria-hidden>
        {units.map((u) => (
          <div
            key={u.label}
            className={`flex min-w-[64px] flex-col items-center border px-2 py-2 sm:min-w-[72px] ${cell}`}
          >
            <span className={`text-2xl font-700 tabular-nums leading-none sm:text-3xl ${strong}`}>
              {u.value}
            </span>
            <span className={`mt-1 text-[11px] uppercase tracking-wide ${muted}`}>{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
