# Оплата открывается раньше подтверждения кода

Найдено 14.08.2026 на проде, воспроизводится каждый раз при оплате картой.

## Коротко

Клиент нажимает «Оформить заказ» — и браузер уходит на страницу ForteBank
**до того, как открылось окно ввода кода**. Код приходит в WhatsApp, когда
человек уже на сайте банка, вводить его негде. Подтверждение доставки
(`ConfirmAndSaveDelivery`) не выполняется вовсе.

Если клиент вернётся назад и всё-таки введёт код, он увидит окно
**«Заказ оформлен»** с полным составом заказа — хотя платёж отменён,
а заказ висит в `AwaitingPayment` без платежа. Сайт говорит «всё хорошо»
там, где денег нет.

## Как воспроизвести

1. `/shop` → любой товар → «В корзину» → `/basket` → `/order`
2. Доставка: СДЭК, Алматы, курьером. Адрес: улица, дом, квартира
3. Способ оплаты: банковской картой
4. «Оформить заказ»

Ожидается: окно ввода кода из WhatsApp, после подтверждения — переход
на оплату.

Получается: сразу `https://ecom.fortebank.com/flex?id=…`, код приходит
в WhatsApp «в никуда».

## Что в базе после такого прохода

Реальный заказ от 14.08.2026:

```
Orders            C8078E00-2204-473F-8E6A-BEAE4124AC04
                  Status = AwaitingPayment, PaymentId = NULL
OrderDeliveries   cdek_courier, «СДЭК курьером: 1-2 дн.», 1 950 ₸
DeliveryAddresses Алматы / Төрбұлақ / «128, квартира 1» / CdekCityCode 4756
```

Возврат с банка приходит на
`/order?orderId=…&uniqueCode=ForteBank&step=3&ID=1000002014977&STATUS=Cancelled`,
и на этом экране ввод кода всё ещё предлагается.

Похоже, отсюда и статистика заказов: 205 в `Pending`, 46 без статуса
против 14 оплаченных.

## Причина — два дефекта, они друг друга маскируют

### 1. Преждевременный переход на банк

`app/components/Checkout/CheckoutForm.tsx:187-189`

```ts
const response = await sendOrderData(orderData);   // бэк создал счёт и отправил код

if (paymentMethod === "card" && response.redirectUrl) {
  localStorage.setItem("redirectUrl", response.redirectUrl);
  window.location.href = response.redirectUrl;     // ← уход на ForteBank прямо здесь
}

onOrderSubmit(response.phoneNumber);               // ← сюда дело уже не доходит
```

`window.location.href` срабатывает раньше, чем `onOrderSubmit` успевает
открыть `SmsVerificationModal`. Шаг с кодом просто выпадает из сценария.

### 2. После ввода кода на оплату не отправляют

`app/components/Checkout/SmsVerificationModal.tsx:111` стирает `redirectUrl`
из `localStorage` **до** открытия окна «Заказ оформлен»:

```ts
localStorage.removeItem("redirectUrl");
...
setIsConfirmationModalOpen(true);
```

А `app/components/Checkout/OrderConfirmationModal.tsx:32` этот же ключ
из `localStorage` читает:

```ts
const redirectUrl = localStorage.getItem("redirectUrl") || "";
if (redirectUrl) router.push(redirectUrl);
else router.push("/");
```

Значение уже стёрто, поэтому ветка с оплатой недостижима, и клиент уезжает
на главную. Единственная кнопка в окне так и называется — «Вернуться
на главную».

То есть даже по правильному пути оплату открыть было нельзя. Первый дефект,
судя по всему, и появился как обход второго: раз со страницы подтверждения
на банк не попасть — отправим на банк сразу.

## Как задумано

Порядок описан в `CLAUDE.md` и заложен в компонентах:

```
CheckoutForm
  ├── setOrderDelivery()  → POST /api/delivery/set               (до создания счёта)
  └── sendOrderData()     → POST /Cart/SendConfirmationCodeNext  (счёт + код в WhatsApp)
SmsVerificationModal      → POST /Cart/ConfirmAndSaveDelivery    (сверка кода на сервере)
OrderConfirmationModal    → переход на ForteBank
```

Бэкенд к этому готов: `CartController.SendConfirmationCodeNext` создаёт счёт,
кладёт код в сессию и возвращает `redirectUrl` (`HppUrl`) — именно чтобы фронт
подержал ссылку до подтверждения, а не шёл по ней немедленно.

## Что править

1. **`CheckoutForm.tsx`** — убрать `window.location.href`, оставить сохранение
   ссылки и дать отработать `onOrderSubmit`, то есть открыть окно ввода кода.
2. **`SmsVerificationModal.tsx`** — передавать адрес оплаты в
   `OrderConfirmationModal` пропом, а не через `localStorage`, и не стирать
   ключ раньше, чем он понадобился.
3. **`OrderConfirmationModal.tsx`** — главной кнопкой сделать **«Оплатить»**
   с переходом на ForteBank; «Вернуться на главную» оставить второстепенной.
   Переход на внешний адрес делать `window.location.href`, а не `router.push`.
4. Отдельно, уже с бэкендом: дом и квартира уходят одной строкой в
   `HouseNumber` (`«128, квартира 1»`), хотя в `DeliveryAddresses` есть
   отдельная колонка `Apartment`. Курьеру СДЭК это уезжает слипшимся куском.

## Как проверить, что вылечено

- «Оформить заказ» картой открывает окно ввода кода и **никуда не уводит**;
- код из WhatsApp вводится на сайте, после подтверждения окно «Заказ оформлен»
  предлагает «Оплатить» и ведёт на ForteBank;
- отказ от оплаты возвращает на `/order?...STATUS=Cancelled`, и заказ остаётся
  `AwaitingPayment` — но клиенту при этом не показано «Заказ оформлен»;
- успешная оплата переводит заказ из `AwaitingPayment`.
