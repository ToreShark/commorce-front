//app/product/not-found.tsx
// Показывается, когда товар не найден. Живёт отдельным файлом, потому что
// страница товара отдаёт его через notFound(): только так Next ставит
// HTTP 404. Раньше эта же вёрстка возвращалась прямо из page.tsx и уходила
// со статусом 200 — сканеры считали любой /product/<что угодно> существующим
// (в логах nginx GET /product/.env → 200).
export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-qblack mb-4">Товар не найден</h1>
        <p className="text-qgray mb-6">
          К сожалению, запрашиваемый товар не существует или был удален.
        </p>
        <a
          href="/shop"
          className="inline-block bg-qyellow text-qblack px-6 py-3 rounded font-medium hover:bg-qyellow/90 transition-colors"
        >
          Перейти в каталог
        </a>
      </div>
    </div>
  );
}
