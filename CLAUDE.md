# CLAUDE.md - CrysShop Frontend

## Overview

Next.js 14 фронтенд для интернет-магазина CrysShop.

| Параметр | Значение |
|----------|----------|
| Framework | Next.js 14 (App Router) |
| Стили | TailwindCSS + Sherah Admin Theme |
| API | REST (fetch к ASP.NET backend) |
| Auth | Telegram OAuth + JWT |

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
├── dashboard/              # Админ панель (защищено middleware)
│   ├── products/           # Управление товарами
│   │   ├── createTableProduct/   # Создание товара
│   │   ├── editTableProductDetail/ # Редактирование товара
│   │   ├── categoryCreate/       # Создание категории
│   │   └── products.tsx          # Список товаров
│   ├── order/              # Заказы
│   ├── users/              # Пользователи
│   ├── widget/             # Виджеты дашборда
│   └── chart/              # Графики
├── product/                # Страница товара [slug]
├── shop/                   # Каталог товаров
├── basket/                 # Корзина
├── order/                  # Оформление заказа
├── login/                  # Страница входа
├── lib/
│   ├── data.ts             # ВСЕ API функции
│   ├── AuthContext.tsx     # Контекст авторизации
│   ├── getRefreshToken.ts  # Работа с cookies
│   └── interfaces/         # TypeScript интерфейсы
├── components/
│   ├── Auth/               # Telegram Login Widget
│   ├── Layout/             # Header, Footer, Sidebar
│   └── fixedBottom/        # Мобильное меню
└── middleware.ts           # Защита роутов /dashboard
```

---

## Авторизация

### Поток авторизации
1. Пользователь на `/login` нажимает Telegram кнопку
2. `TelegramLoginWidget.tsx` получает данные от Telegram
3. Вызывается `telegramLogin()` из `data.ts`
4. Backend валидирует и возвращает JWT
5. Токен сохраняется в cookie `token`
6. Редирект на `/` или `/dashboard`

### Middleware (middleware.ts)
- Защищает все роуты `/dashboard/*`
- Проверяет наличие cookie `token`
- Декодирует JWT и проверяет роль (1 или 2 = admin)
- Если не админ — редирект на `/`

### Получение токена
```typescript
import Cookies from "js-cookie";

const token = Cookies.get("token");
```

---

## API (app/lib/data.ts)

### Авторизация
```typescript
telegramLogin(authData)      // Telegram OAuth
devLogin()                   // Dev Login (только dev)
logout()                     // Выход
validateToken()              // Проверка токена
```

### Товары
```typescript
createProduct(formData, token)           // Создать товар
fetchProducts()                          // Список товаров
fetchProductBySlug(slug)                 // Товар по slug
fetchProductsByCategory(categoryId)      // Товары категории
```

### Категории
```typescript
fetchCategories()                        // Список категорий
createCategory(data, token)              // Создать категорию
```

### Заказы
```typescript
createOrder(orderData, token)            // Создать заказ
fetchOrdersByUserId(userId, token)       // Заказы пользователя
```

---

## Ключевые компоненты

### Создание товара
**Путь:** `app/dashboard/products/createTableProduct/createTableProduct.tsx`

Поля формы:
- `title`, `name`, `description` - Основная информация
- `price`, `sku`, `slug` - Цена и идентификаторы
- `metaTitle`, `metaKeywords`, `metaDescription` - SEO
- `discountPercentage`, `discountStartDate`, `discountEndDate` - Скидка
- `properties` - Свойства товара (Название/Значение)
- `images` - Изображения (множественная загрузка)

### Telegram Login Widget
**Путь:** `app/components/Auth/TelegramLoginWidget.tsx`

```tsx
<TelegramLoginWidget botName="crysShop_bot" />
```

### Защищенные роуты
Все компоненты в `/dashboard` автоматически защищены middleware.
Для API вызовов нужно передавать токен:

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

## Стили

Проект использует Sherah Admin Theme (Bootstrap-based):
- CSS классы: `sherah-wc__form-input`, `sherah-btn`, `sherah-table__body`
- Находятся в `public/sherah/css/`

Примеры классов:
```html
<input className="sherah-wc__form-input" />
<button className="sherah-btn sherah-btn__primary">Сохранить</button>
<div className="sherah-table__body">...</div>
```

---

## Логирование (Development)

В dev режиме выводятся логи в консоль:
```
[CREATE PRODUCT] Начало создания товара
[CREATE PRODUCT] URL: http://localhost:5249/Admin/ProductAdmin/CreateProduct
[CREATE PRODUCT] Данные формы:
  title: Тестовый товар
  price: 5990
  images: [File] photo.jpg (12345 bytes)
[CREATE PRODUCT] Response status: 200
[CREATE PRODUCT] Товар успешно создан!
```

Логи работают только когда `process.env.NODE_ENV === "development"`.

---

## Частые задачи

### Добавить новую страницу в Dashboard
1. Создать папку в `app/dashboard/новая-страница/`
2. Создать `page.tsx` с компонентом
3. Middleware автоматически защитит роут

### Добавить новый API вызов
1. Добавить функцию в `app/lib/data.ts`
2. Использовать в компонентах

### Обновить интерфейс данных
1. Создать/обновить интерфейс в `app/lib/interfaces/`
2. Импортировать где нужно

---

## Отладка

### Проблема: Редирект на главную при входе в /dashboard
- Проверить cookie `token` в DevTools
- Проверить что роль в JWT = 1 или 2
- Middleware использует `atob()` для декодирования

### Проблема: 401 при создании товара
- Проверить что токен передается в header `Authorization: Bearer {token}`
- Проверить что токен не истек (exp в JWT payload)
- Проверить CORS на backend

### Проблема: Изображения не загружаются
- FormData должен содержать `images` как File[]
- Backend ожидает `IFormFile[] images`
