import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom не реализует HTMLDialogElement: без заглушек любая модалка на <dialog>
// падает на showModal. Поведение упрощённое, нам важен только факт открытия.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}

// jsdom не реализует matchMedia, а Reveal спрашивает у него «уменьшить движение».
// Без заглушки любой тест, отрисовавший сетку товаров, ронял необработанную
// ошибку в эффекте — тест при этом проходил, что хуже всего.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom не реализует IntersectionObserver — тот же Reveal вешает на него
// наблюдателя появления карточки. Заглушка ничего не наблюдает: в тестах важно,
// что компонент отрисовался, а не что он доехал до вьюпорта.
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});
