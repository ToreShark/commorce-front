"use client";

import { useContext, useEffect, useState, FormEvent } from "react";
import { CartContext } from "@/app/lib/CartContext";
import {
  calculateDeliveryOptions,
  sendOrderData,
  setOrderDelivery,
} from "@/app/lib/data";
import {
  CdekCity,
  CdekDeliveryPoint,
  DeliveryOption,
} from "@/app/lib/interfaces/cdek.interface";
import CityAutocomplete from "./CityAutocomplete";
import DeliveryOptions from "./DeliveryOptions";
import DeliveryPointSelect from "./DeliveryPointSelect";

interface CheckoutFormProps {
  onOrderSubmit: (phoneNumber: string) => void;
  onDeliveryCostChange?: (cost: number) => void;
  className?: string;
}

export default function CheckoutForm({ onOrderSubmit, onDeliveryCostChange, className }: CheckoutFormProps) {
  const { cartItems } = useContext(CartContext);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");

  // Delivery (СДЭК)
  const [selectedCity, setSelectedCity] = useState<CdekCity | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(null);
  const [deliveryPoint, setDeliveryPoint] = useState<CdekDeliveryPoint | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [apartment, setApartment] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("card");

  // State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryCost = selectedOption?.cost ?? 0;
  const finalTotalPrice = totalPrice + deliveryCost;

  useEffect(() => {
    onDeliveryCostChange?.(deliveryCost);
  }, [deliveryCost, onDeliveryCostChange]);

  const orderId = cartItems.length > 0 ? cartItems[0].orderId : null;

  // Смена города — пересчитываем варианты доставки через СДЭК
  const handleCitySelect = async (city: CdekCity) => {
    setSelectedCity(city);
    setSelectedOption(null);
    setDeliveryPoint(null);
    setDeliveryError(null);

    if (!orderId) {
      setDeliveryError("Нет активного заказа. Добавьте товары в корзину заново.");
      return;
    }

    setIsCalculatingDelivery(true);
    try {
      const options = await calculateDeliveryOptions(orderId, city.code);
      setDeliveryOptions(options);

      if (options.length === 0) {
        setDeliveryError("Не удалось рассчитать доставку для этого города.");
      }
    } catch (error) {
      console.error("[CHECKOUT] Ошибка расчёта доставки:", error);
      setDeliveryError("Не удалось рассчитать доставку. Попробуйте другой город.");
      setDeliveryOptions([]);
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  const handleDeliverySelect = (option: DeliveryOption) => {
    setSelectedOption(option);
    setDeliveryError(null);

    if (option.type !== "cdek_pvz") {
      setDeliveryPoint(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const productId = cartItems.length > 0 ? cartItems[0].productId : null;

    if (!productId || !orderId) {
      alert("Добавьте товары в корзину перед оформлением заказа.");
      return;
    }

    if (!selectedOption) {
      setDeliveryError("Выберите способ доставки.");
      return;
    }

    // Код ПВЗ обязателен для тарифа склад-склад — без него СДЭК не примет накладную
    if (selectedOption.type === "cdek_pvz" && !deliveryPoint) {
      setDeliveryError("Выберите пункт выдачи.");
      return;
    }

    if (selectedOption.type === "cdek_courier" && (!selectedCity || !address || !houseNumber)) {
      setDeliveryError("Заполните адрес доставки.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Доставку сохраняем ДО создания счёта: сумма инвойса считается на бэкенде
      // как товары + стоимость доставки, привязанной к заказу.
      if (selectedOption.type !== "pickup") {
        const deliveryResult = await setOrderDelivery({
          orderId,
          deliveryType: selectedOption.type,
          cdekDeliveryPointCode:
            selectedOption.type === "cdek_pvz" ? deliveryPoint!.code : undefined,
          address: {
            city: selectedCity!.city,
            cityCode: selectedCity!.code,
            street: selectedOption.type === "cdek_courier" ? address : "",
            house: selectedOption.type === "cdek_courier" ? houseNumber : "",
            // Отдельным полем: в DeliveryAddresses под квартиру есть своя колонка,
            // а слипшийся «128, квартира 1» уезжал курьеру одной строкой
            apartment:
              selectedOption.type === "cdek_courier" && apartment
                ? apartment
                : undefined,
          },
          recipient: {
            name: `${firstName} ${lastName}`.trim(),
            phone: cellphone,
            email: email || undefined,
          },
        });

        if (!deliveryResult || !deliveryResult.success) {
          setDeliveryError(deliveryResult?.error || "Не удалось сохранить доставку.");
          setIsSubmitting(false);
          return;
        }
      }

      // Самовывоз обрабатывает старый сценарий, СДЭК — новый по своему коду
      const deliveryMethod =
        selectedOption.type === "pickup" ? "Pickup" : selectedOption.type;

      const orderData = {
        orderId,
        firstName,
        lastName,
        email,
        cellphone,
        deliveryMethod,
        selectedRegionId: "",
        selectedCityId: selectedCity?.code || "",
        address,
        houseNumber,
        paymentMethod,
        totalPrice: finalTotalPrice,
      };

      const response = await sendOrderData(orderData);
      // Код подтверждения хранится только на сервере (в сессии), клиенту его не отдают
      localStorage.setItem("phoneNumber", response.phoneNumber);
      localStorage.setItem("orderId", response.orderId);
      localStorage.setItem("deliveryType", deliveryMethod);
      localStorage.setItem("uniqueCode", deliveryMethod);

      // Ссылку на оплату придерживаем до подтверждения кода: раньше здесь стоял
      // window.location.href, и браузер уходил на банк, не дав ввести код —
      // код приходил в WhatsApp, когда человек был уже на странице ForteBank
      if (paymentMethod === "card" && response.redirectUrl) {
        localStorage.setItem("redirectUrl", response.redirectUrl);
      }

      onOrderSubmit(response.phoneNumber);
    } catch (error) {
      if (typeof error === "object") {
        const errorObj = error as { [key: string]: string };
        setErrors(errorObj);
        if (errorObj.orderId) {
          alert(errorObj.orderId);
        }
        if (errorObj.deliveryMethod) {
          setDeliveryError(errorObj.deliveryMethod);
        }
      } else {
        console.error("Failed to submit data:", error);
        alert("Произошла ошибка при оформлении заказа. Попробуйте снова.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`checkout-form ${className || ""}`}>
      {/* Personal Information */}
      <div className="w-full bg-white border border-[#EDEDED] rounded-lg px-[30px] py-[26px] mb-6">
        <h3 className="text-[18px] font-bold text-qblack mb-5">
          Личные данные
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-[13px] font-medium text-qblack mb-2">
              Фамилия <span className="text-qred">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Введите фамилию"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
            />
            {errors.firstName && (
              <p className="text-qred text-[12px] mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[13px] font-medium text-qblack mb-2">
              Имя <span className="text-qred">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Введите имя"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
            />
            {errors.lastName && (
              <p className="text-qred text-[12px] mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-qblack mb-2">
              Email <span className="text-qred">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
            />
            {errors.email && (
              <p className="text-qred text-[12px] mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[13px] font-medium text-qblack mb-2">
              Телефон <span className="text-qred">*</span>
            </label>
            <input
              type="tel"
              name="cellphone"
              placeholder="+7 (___) ___-__-__"
              value={cellphone}
              onChange={(e) => setCellphone(e.target.value)}
              required
              className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
            />
            {errors.cellphone && (
              <p className="text-qred text-[12px] mt-1">{errors.cellphone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Method */}
      <div className="w-full bg-white border border-[#EDEDED] rounded-lg px-[30px] py-[26px] mb-6">
        <h3 className="text-[18px] font-bold text-qblack mb-5">
          Способ доставки
        </h3>

        <div>
          <label className="block text-[13px] font-medium text-qblack mb-2">
            Город доставки <span className="text-qred">*</span>
          </label>
          <CityAutocomplete
            onCitySelect={handleCitySelect}
            placeholder="Начните вводить название города"
          />
        </div>

        <div className="mt-5">
          <DeliveryOptions
            options={deliveryOptions}
            selectedType={selectedOption?.type || null}
            onSelect={handleDeliverySelect}
            isLoading={isCalculatingDelivery}
          />
        </div>

        {/* Пункт выдачи — обязателен для тарифа склад-склад */}
        {selectedOption?.type === "cdek_pvz" && selectedCity && (
          <DeliveryPointSelect
            cityCode={selectedCity.code}
            selectedCode={deliveryPoint?.code || null}
            onSelect={setDeliveryPoint}
          />
        )}

        {/* Адрес — только для курьерской доставки */}
        {selectedOption?.type === "cdek_courier" && (
          <div className="mt-4 pt-4 border-t border-[#EDEDED] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-qblack mb-2">
                Улица <span className="text-qred">*</span>
              </label>
              <input
                type="text"
                placeholder="Введите улицу"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-qblack mb-2">
                Дом <span className="text-qred">*</span>
              </label>
              <input
                type="text"
                placeholder="Номер дома"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                required
                className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-qblack mb-2">
                Квартира
              </label>
              <input
                type="text"
                placeholder="Квартира или офис"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
              />
            </div>
          </div>
        )}

        {selectedOption?.type === "pickup" && (
          <p className="mt-4 text-[13px] text-qgray">
            Бесплатно. Забрать можно по адресу: г. Атырау
          </p>
        )}

        {deliveryError && (
          <p className="text-qred text-[13px] mt-4">{deliveryError}</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="w-full bg-white border border-[#EDEDED] rounded-lg px-[30px] py-[26px] mb-6">
        <h3 className="text-[18px] font-bold text-qblack mb-5">
          Способ оплаты
        </h3>

        <div className="space-y-4">
          {/* Card Payment */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                paymentMethod === "card" ? "border-qyellow" : "border-[#CDCDCD]"
              }`}>
                {paymentMethod === "card" && (
                  <div className="w-2.5 h-2.5 bg-qyellow rounded-full" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-medium text-qblack">Банковской картой</span>
              <div className="flex gap-2">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                  <rect width="32" height="20" rx="2" fill="#1A1F71"/>
                  <path d="M12.2 13.5L13.5 6.5H15.3L14 13.5H12.2Z" fill="white"/>
                  <path d="M19.9 6.7C19.5 6.5 18.9 6.4 18.1 6.4C16.3 6.4 15 7.4 15 8.7C15 9.7 15.9 10.2 16.6 10.5C17.3 10.9 17.5 11.1 17.5 11.4C17.5 11.9 16.9 12.1 16.4 12.1C15.6 12.1 15.2 12 14.5 11.7L14.2 11.6L13.9 13.3C14.4 13.5 15.3 13.7 16.2 13.7C18.2 13.7 19.4 12.7 19.5 11.3C19.5 10.5 19 9.9 17.9 9.4C17.3 9.1 16.9 8.9 16.9 8.5C16.9 8.2 17.2 7.8 17.9 7.8C18.5 7.8 18.9 7.9 19.3 8.1L19.5 8.2L19.9 6.7Z" fill="white"/>
                </svg>
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                  <rect width="32" height="20" rx="2" fill="#EB001B" fillOpacity="0.1"/>
                  <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                  <circle cx="20" cy="10" r="6" fill="#F79E1B"/>
                  <path d="M16 5.8C17.3 6.9 18 8.4 18 10C18 11.6 17.3 13.1 16 14.2C14.7 13.1 14 11.6 14 10C14 8.4 14.7 6.9 16 5.8Z" fill="#FF5F00"/>
                </svg>
              </div>
            </div>
          </label>

          {/* Cash Payment */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                paymentMethod === "cash" ? "border-qyellow" : "border-[#CDCDCD]"
              }`}>
                {paymentMethod === "cash" && (
                  <div className="w-2.5 h-2.5 bg-qyellow rounded-full" />
                )}
              </div>
            </div>
            <div>
              <span className="text-[15px] font-medium text-qblack">Наличными при получении</span>
              <p className="text-[13px] text-qgray mt-1">
                Оплата при получении заказа
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || cartItems.length === 0 || !selectedOption}
        className="w-full h-[55px] bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-[15px] rounded transition-colors disabled:bg-qgray disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Оформление...
          </>
        ) : (
          "Подтвердить заказ"
        )}
      </button>
    </form>
  );
}
