# CLAUDE.md - CrysShop Frontend

## Overview

Next.js фронтенд для интернет-магазина CrysShop.

| Параметр | Значение |
|----------|----------|
| Framework | Next.js 15 (App Router) |
| UI | React 18 |
| Стили | TailwindCSS + Sherah Admin Theme (Bootstrap) + SCSS |
| Компоненты | MUI 5 (+ X DataGrid, X DatePickers), Radix UI, lucide-react |
| Графики | Recharts, Chart.js (react-chartjs-2) |
| Редактор | react-quill-new (WYSIWYG для статических страниц) |
| API | REST (fetch к ASP.NET backend) |
| Auth | WhatsApp OTP + Telegram OAuth + JWT |

---

## Quick Start

```bash
npm install
npm run dev
# http://localhost:3000
```

### Требования
- Node.js 18+
- Backend запущен на `localhost:5249`
- Docker с SQL Server запущен

---

## Структура проекта

```
app/
├── page.tsx                # Главная
├── shop/                   # Каталог (фильтры по категории/цене)
├── product/[slug]/         # Карточка товара
├── basket/                 # Корзина
├── order/                  # Оформление заказа (СДЭК)
├── payment/                # Результат оплаты
├── purchaseHistory/        # История покупок
├── login/                  # Вход (выбор способа авторизации)
├── sendphone/ + sendcode/  # Шаги WhatsApp OTP
├── @auth/ + @modal/        # Параллельные роуты + интерсепты
│   └── (.)authmodal, (.)sendphone, (.)sendcode
├── offer/ privacy-policy/ warranty/ payment-security/   # Статические страницы
├── dashboard/              # Админка (защищена middleware)
│   ├── page.tsx → home/    # Единая точка входа, переключение секций стейтом
│   ├── sidebar/            # Навигация админки
│   ├── widget/ chart/ featured/ table/   # Виджеты дашборда
│   ├── products/           # Товары и категории
│   │   ├── createTableProduct/       # Создание товара
│   │   ├── editTableProductDetail/   # Редактирование товара
│   │   ├── categoryCreate/           # Создание категории
│   │   ├── categoryDetailView/ editableCategoryDetails/
│   │   └── products.tsx
│   ├── order/              # Заказы
│   ├── users/ single/      # Пользователи и карточка пользователя
│   ├── staticpages/        # Редактор статических страниц
│   ├── pages/[id]/         # Редактирование конкретной страницы
│   └── DashboardContext.tsx
├── components/
│   ├── Auth/               # AuthMethodSelector, PhoneAuthForm, PhoneInput, SmsCodeForm,
│   │                       # WhatsAppLoginWidget, TelegramLoginWidget, DevLoginButton
│   ├── Checkout/           # CheckoutForm, CheckoutOrderSummary, SmsVerificationModal,
│   │                       # OrderConfirmationModal
│   ├── Cart/ cart-item/ cart-dropdown/
│   ├── Layout/             # Header (TopBar, Middlebar), Footer, Sidebar
│   ├── Product/ Shop/ Home/ nav-bar/ fixedBottom/ icons/ Errors/
├── lib/
│   ├── data.ts             # ВСЕ API функции (~1600 строк)
│   ├── AuthContext.tsx     # Контекст авторизации
│   ├── CartContext.tsx     # Корзина
│   ├── CategoryContext.tsx / ProductContext.tsx / UserInfo.tsx
│   ├── getRefreshToken.ts  # Работа с cookies
│   ├── session.ts          # localStorage-сессия
│   └── interfaces/         # TypeScript интерфейсы (включая cdek.interface.ts)
├── services/
└── ui/css/
middleware.ts               # Защита роутов /dashboard
```

**Важно про админку:** `/dashboard` — фактически одностраничное приложение.
`app/dashboard/page.tsx` рендерит `home/page.tsx`, который через локальный стейт
`activePage` (`home | users | single | products | orders | pages`) динамически
подгружает секции (`next/dynamic`). Отдельных URL у секций нет — новую секцию
добавляют в этот switch, а не созданием роута.

---

## Авторизация

Поддерживаются три способа входа, выбор — в `components/Auth/AuthMethodSelector.tsx`.

### WhatsApp OTP (основной)
1. `/login` или `/sendphone` → `PhoneAuthForm` + `PhoneInput` (маска и валидация KZ-номера)
2. `sendPhone(phoneNumber)` → `POST /Account/SendPhone` — бэк шлёт код в WhatsApp
3. `/sendcode` → `SmsCodeForm`, `sendSmsCode(phone, code)` → `POST /Account/SendCode`
4. **Код сверяется только на бэке.** Клиент код не хранит и не сравнивает —
   не возвращать логику сверки через localStorage
5. Бэк отдаёт JWT; access-токен кладётся в cookie `token`

Длина кода — `OTP_CODE_LENGTH` в `app/lib/otp.ts`, значение должно совпадать
с `VerificationCodeGenerator.Length` на бэкенде (сейчас 6). Там же лежат
`sanitizeOtpInput` (оставляет только цифры) и `isCompleteOtp` — их используют обе
формы ввода кода, чтобы валидация не разъезжалась.

Обработка ошибок от `/Account/SendCode`:
| `error` | Что значит |
|---------|-----------|
| `invalid_code` | Неверный код, смотри `attemptsRemaining` |
| `code_expired` | Код протух, нужен новый `SendPhone` |
| `blocked` | Номер заблокирован на 24 часа, `secondsUntilUnblock` |

Поле `closeModal` в ответе говорит, надо ли закрывать модалку ввода кода.

### Telegram OAuth
1. `TelegramLoginWidget.tsx` получает данные от Telegram
2. `telegramLogin(authData)` → `POST /api/auth/telegram`
3. Backend валидирует подпись и возвращает JWT
4. Токен сохраняется в cookie `token`, редирект на `/` или `/dashboard`

### Dev Login
`DevLoginButton.tsx` → `devLogin()` → `POST /api/auth/dev`. Работает только когда backend
запущен в Development; авторизует тестового пользователя как SuperAdmin.

### Роли и middleware

`app/lib/roles.ts` — единственный источник правды о ролях на фронте: набор ролей,
разбор JWT и правила доступа. Модуль импортирует `middleware.ts`, поэтому в нём
не должно быть браузерных API (Edge Runtime).

| Функция | Смысл |
|---------|-------|
| `isAdminRole(roleId)` | пускать ли в `/dashboard` — роли 1 и 2 |
| `canManageUsers(roleId)` | управление пользователями, только роль 1 |
| `decodeRoleId(token)` | RoleId из JWT без проверки подписи |

- Матчер middleware: `/dashboard/:path*`, читает cookie `token`
- Подпись **не проверяется** — это делает backend на каждом запросе
- Наборы ролей совпадают с `RolePolicies` на бэкенде: `AdminArea` и `SuperAdminOnly`
- Раздел «Пользователи» в меню скрыт от роли Admin: бэкенд отдаст на него 403

### Где лежит токен (осторожно)
В коде используются **два** источника токена:
```typescript
import Cookies from "js-cookie";
const token = Cookies.get("token");            // основной путь, middleware читает его же

const token = localStorage.getItem("accessToken");  // используется в разделе статических страниц
```
`app/dashboard/pages/`, `app/dashboard/staticpages/` берут токен из `localStorage`.
Если правишь авторизацию — синхронизируй оба хранилища, иначе часть админки отвалится с 401.

---

## API (app/lib/data.ts)

Все вызовы идут на `${process.env.NEXT_PUBLIC_API_URL}`. Файл — единственная точка
общения с бэком, ~52 экспортируемые функции.

### Авторизация
| Функция | Endpoint |
|---------|----------|
| `devLogin()` | `POST /api/auth/dev` |
| `telegramLogin(authData)` | `POST /api/auth/telegram` |
| `getCurrentUser()` | `GET /api/auth/me` |
| `authLogout()` | `POST /api/auth/logout` |
| `sendPhone(phone)` | `POST /Account/SendPhone` |
| `sendSmsCode(phone, code)` | `POST /Account/SendCode` |
| `getUser()` | `GET /Account/User` |
| `refreshToken()` | `POST /Account/Refresh` |
| `logout()` | `POST /Account/LogoutNext` |

### Каталог
| Функция | Endpoint |
|---------|----------|
| `fetchCategories()` | `GET /CategoryClient/IndexJson` |
| `fetchCategoryDetails(slug)` | `GET /CategoryClient/GetCategoryDetails/{slug}` |
| `fetchCategoriesSitemap()` | `GET /CategoryClient/GetSitemapSlugs` |
| `fetchProducts(...)` | `GET /Product/GetProducts?...` |
| `fetchProductDetails(slug)` | `GET /Product/IndexDetail/{slug}` (возвращает `null` при 404) |

> На `/shop` фильтр по категории приходит slug'ом, а бэк ждёт GUID — slug резолвится
> в id перед запросом товаров.

### Корзина и заказ
| Функция | Endpoint |
|---------|----------|
| `addItemToCartAPI(...)` | `POST /Cart/AddToCartNext` |
| `fetchCartInfo()` | `GET /Cart/GetCartInfo` |
| `increaseItemQuantity(id)` / `decreaseItemQuantity(id)` | `POST /Cart/IncreaseItemNext` / `DecreaseItemNext` |
| `removeItemFromCart(productId)` | `DELETE /Cart/RemoveItemNext` |
| `fetchRegionsAndCities()` | `GET /Cart/GetRegionsAndCities` |
| `sendOrderData(orderData)` | `POST /Cart/SendConfirmationCodeNext` |
| `sendSmsCodeOrder(...)` | `POST /Cart/ConfirmAndSaveDelivery` |
| `fetchPurchaseHistory()` | `GET /Cart/PurchaseHistoryNext` |
| `fetchOrderDetails(orderId)` | `GET /OrderClient/GetOrderById/{id}` |
| `fetchOk()` | `GET /OrderClient/GetOk` (health-check) |

### Доставка CDEK
| Функция | Endpoint |
|---------|----------|
| `searchCdekCities(query)` | `GET /api/delivery/cities?query=` |
| `calculateDeliveryOptions(orderId, cityCode)` | `GET /api/delivery/calculate` |
| `setOrderDelivery(...)` | `POST /api/delivery/set` |

Типы — в `app/lib/interfaces/cdek.interface.ts` (`CdekCity`, `DeliveryOption`,
`CalculateDeliveryResponse`, `SetDeliveryRequest`, `SetDeliveryResponse`).

### Статические страницы
| Функция | Endpoint |
|---------|----------|
| `getStaticPage(slug)` | `GET /api/pages/{slug}` |
| `getOfferDocumentUrl()` | `/api/pages/offer-document` (ссылка на PDF) |
| `getAllStaticPages(token)` | `GET /api/pages` |
| `getStaticPageById(id, token)` | `GET /api/pages/admin/{id}` |
| `updateStaticPage(...)` | `PUT /api/pages/{id}` |

### Админка
| Функция | Endpoint |
|---------|----------|
| `createProduct(formData, token)` | `POST /Admin/ProductAdmin/CreateProduct` |
| `editProduct(...)` | `POST /Admin/ProductAdmin/EditNext` |
| `deleteProduct(id, token)` | `DELETE /Admin/ProductAdmin/DeleteProduct/{id}` |
| `deleteProductImage(imageId, token)` | `DELETE /Admin/ProductAdmin/DeleteImage` |
| `getCategories(token)` | `GET /Admin/Admin/GetCategories` |
| `getAllCategories(token)` | `GET /Admin/Category/GetAllCategories` |
| `createCategory(...)` / `editCategory(...)` | `POST /Admin/Category/CreateNext` / `EditNext` |
| `deleteCategory(id, token)` | `DELETE /Admin/Category/DeleteCategory/{id}` |
| `getProductsByCategory(categoryId, token)` / `getCategoryById(...)` | `GET /Admin/CategoryProducts/GetProductsByCategory/{categoryId}` |
| `getAllOrders(token)` | `GET /Admin/Order/GetAllOrders` |
| `getOrderCount` / `getOrderTotalPrice` / `getWeeklySalesData` | `GET /Admin/Order/...` |
| `getUsers` / `getUsersWithLastTransactions` / `getUserById` | `GET /Admin/User/...` |
| `deleteUser(id, token)` | `DELETE /Admin/User/DeleteUser/{id}` |

---

## Ключевые компоненты

### Создание товара
**Путь:** `app/dashboard/products/createTableProduct/createTableProduct.tsx`

Поля формы:
- `title`, `name`, `description` - Основная информация
- `price`, `sku`, `slug` - Цена и идентификаторы
- `categoryId` - Категория
- `metaTitle`, `metaKeywords`, `metaDescription` - SEO
- `discountPercentage`, `discountStartDate`, `discountEndDate` - Скидка
- `properties` - Свойства товара (Название/Значение)
- `images` - Изображения (множественная загрузка, бэк ждёт `IFormFile[] images`)

### Оформление заказа (`app/components/Checkout/`)

```
CheckoutForm
  ├── CityAutocomplete        → GET  /api/delivery/cities      (справочник СДЭК)
  ├── DeliveryOptions         → GET  /api/delivery/calculate   (ПВЗ / курьер / самовывоз)
  ├── DeliveryPointSelect     → GET  /api/delivery/points      (только для cdek_pvz)
  ├── setOrderDelivery()      → POST /api/delivery/set         ДО создания счёта
  └── sendOrderData()         → POST /Cart/SendConfirmationCodeNext
SmsVerificationModal → sendSmsCodeOrder() → POST /Cart/ConfirmAndSaveDelivery
OrderConfirmationModal / редирект на ForteBank
```

Важные детали:
- **Порядок вызовов принципиален.** Сумма счёта считается на бэкенде как товары
  плюс `Delivery.Amount`, поэтому доставка должна быть сохранена до `sendOrderData`.
- В `deliveryMethod` уходит реальный тип (`cdek_pvz`, `cdek_courier`) либо `Pickup`.
  Бэкенд перезаписывает доставку только для `Pickup`/`Courier`, коды СДЭК он лишь
  подтверждает — иначе терялись бы код города, ПВЗ и получатель.
- Для `cdek_pvz` код ПВЗ обязателен: без него бэкенд отклонит доставку, а накладную
  СДЭК создать нельзя.
- `CheckoutOrderSummary` берёт стоимость доставки из расчёта СДЭК (`deliveryCost`),
  захардкоженных 10% больше нет.

Весь чекаут живёт в `app/components/Checkout/` — второго, не подключённого варианта
больше нет.

### Защищённые роуты
Все компоненты в `/dashboard` защищены middleware. Для API-вызовов нужно передавать токен:

```typescript
const token = Cookies.get("token");
if (!token) {
  alert("Необходимо авторизоваться");
  return;
}
await createProduct(formData, token);
```

---

## Environment Variables

### .env
```
SESSION_SECRET=...
```

### .env.development
```
NEXT_PUBLIC_API_URL=http://localhost:5249
NEXT_PUBLIC_TELEGRAM_BOT_NAME=crysShop_bot
```

### .env.production
```
NEXT_PUBLIC_API_URL=https://crysshop.kz
NEXT_PUBLIC_TELEGRAM_BOT_NAME=crysShop_bot
```

---

## Деплой

`docker-compose.yml` поднимает контейнер `nextjs-prod` на `127.0.0.1:3000:3000`
(`NODE_ENV=production`), наружу — только через reverse-proxy.
Домены изображений разрешены в `next.config.mjs` (http и https для crysshop.kz).

---

## Тесты

```bash
npm test          # разовый прогон
npm run test:watch
```

| Файл | Назначение |
|------|-----------|
| `vitest.config.ts` | jsdom, алиасы из tsconfig, `esbuild.jsx: automatic` (в tsconfig Next-а `jsx: preserve`) |
| `vitest.setup.ts` | `@testing-library/jest-dom`, очистка DOM и localStorage между тестами |
| `app/**/*.test.tsx` | сами тесты, лежат рядом с компонентами |

| Тест | Что покрывает |
|------|---------------|
| `Checkout/CheckoutForm.test.tsx` | доставка сохраняется до создания счёта, наружу уходит реальный тип (`cdek_pvz` / `cdek_courier`, не `Courier`), ПВЗ обязателен, самовывоз не дёргает API доставки, неудачное сохранение доставки не создаёт заказ |
| `Checkout/CityAutocomplete.test.tsx` | дебаунс и один запрос на серию нажатий, порог в 2 символа, выбор города отдаёт наверх `code`, пустой результат и падение справочника |
| `Checkout/DeliveryPointSelect.test.tsx` | загрузка ПВЗ по городу, город без ПВЗ, выбор пункта, сброс выбора при смене города |
| `order/page.test.tsx` | пустая корзина, стоимость доставки из формы доходит до сводки |
| `lib/roles.test.ts` | доступ в админку по ролям, разбор RoleId из JWT |
| `dashboard/sidebar/SideBar.test.tsx` | раздел «Пользователи» виден только SuperAdmin |
| `lib/otp.test.ts` | длина кода, очистка ввода, готовность к отправке |
| `Auth/SmsCodeForm.test.tsx` | неполный код не уходит на сервер, ввод фильтруется |

Ограничения по версиям: `@vitejs/plugin-react` держим на 4.x — в 6.x типы требуют
TypeScript 5.6+, а в проекте 5.5. `vite` закреплён на 5.x, чтобы совпадать с версией
внутри vitest 2 — иначе типы плагинов конфликтуют и падает `next build`.

Модуль `app/lib/data.ts` в тестах мокается целиком через `vi.mock`, сеть не дёргается.

---

## Стили

Проект использует Sherah Admin Theme (Bootstrap-based):
- CSS классы: `sherah-wc__form-input`, `sherah-btn`, `sherah-table__body`
- Находятся в `public/sherah/css/`

```html
<input className="sherah-wc__form-input" />
<button className="sherah-btn sherah-btn__primary">Сохранить</button>
<div className="sherah-table__body">...</div>
```

Витрина использует TailwindCSS (конфиг — `tailwind.config.ts`) и SCSS-модули рядом
с компонентами.

---

## Логирование (Development)

```
[CREATE PRODUCT] Начало создания товара
[CREATE PRODUCT] URL: http://localhost:5249/Admin/ProductAdmin/CreateProduct
[CREATE PRODUCT] Response status: 200
[CREATE PRODUCT] Товар успешно создан!
```

Логи работают только когда `process.env.NODE_ENV === "development"`.

---

## Частые задачи

### Добавить раздел в Dashboard
1. Создать компонент в `app/dashboard/новый-раздел/`
2. Добавить его в `next/dynamic`-импорты и в `switch (activePage)` в `app/dashboard/home/page.tsx`
3. Добавить пункт в `app/dashboard/sidebar/SideBar.tsx`
   (отдельный роут создавать не нужно — админка одностраничная)

### Добавить новый API вызов
1. Добавить функцию в `app/lib/data.ts` (использовать `process.env.NEXT_PUBLIC_API_URL`)
2. Тип ответа — в `app/lib/interfaces/`
3. Для защищённых эндпоинтов передавать `Authorization: Bearer ${token}` и `credentials: "include"`

---

## Отладка

### Редирект на главную при входе в /dashboard
- Проверить cookie `token` в DevTools
- Проверить, что роль в JWT = 1 или 2 (клейм `.../claims/role`)
- Middleware использует `atob()` без проверки подписи — токен может быть валидным по форме,
  но отклонён бэком

### 401 при создании товара
- Токен передаётся в header `Authorization: Bearer {token}`
- Токен не истёк (`exp` в JWT payload)
- CORS на backend разрешает текущий origin (dev — только `http://localhost:3000`)

### 401 в разделе статических страниц
Этот раздел читает токен из `localStorage.getItem("accessToken")`, а не из cookie —
проверь, что при логине пишутся оба хранилища.

### Товары категории не грузятся на /shop
Бэк ждёт GUID категории, а в URL приходит slug — нужен резолв slug → id
перед вызовом `fetchProducts`.

### Изображения не загружаются
- FormData должен содержать `images` как `File[]`
- Backend ожидает `IFormFile[] images`
- Домен картинок должен быть в `remotePatterns` в `next.config.mjs`
