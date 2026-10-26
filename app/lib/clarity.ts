// Microsoft Clarity: пользовательские события для воронок.
//
// Загрузчик стоит в app/layout.tsx и сам ставит очередь window.clarity.q,
// поэтому вызов до загрузки скрипта не теряется. Без NEXT_PUBLIC_CLARITY_ID
// загрузчика нет — тогда и функции нет, вызов молча ничего не делает.

type Clarity = (...args: unknown[]) => void;

export function clarityEvent(name: string): void {
  if (typeof window === "undefined") return;
  const clarity = (window as unknown as { clarity?: Clarity }).clarity;
  if (typeof clarity === "function") {
    clarity("event", name);
  }
}
