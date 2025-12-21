"use client";

import { useContext, useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/app/lib/CartContext";
import { fetchRegionsAndCities, sendOrderData } from "@/app/lib/data";
import { City, Region } from "@/app/lib/interfaces/region.interface";

interface CheckoutFormProps {
  onOrderSubmit: (phoneNumber: string) => void;
  onDeliveryMethodChange?: (method: string) => void;
  className?: string;
}

export default function CheckoutForm({ onOrderSubmit, onDeliveryMethodChange, className }: CheckoutFormProps) {
  const { cartItems } = useContext(CartContext);
  const router = useRouter();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");

  // Delivery
  const [deliveryMethod, setDeliveryMethod] = useState("Pickup");
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [address, setAddress] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("card");

  // State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRegionsAndCities() {
      const data = await fetchRegionsAndCities();
      if (data) {
        setRegions(data.regions);
        setCities(data.cities);
      }
    }
    loadRegionsAndCities();
  }, []);

  useEffect(() => {
    onDeliveryMethodChange?.(deliveryMethod);
  }, [deliveryMethod, onDeliveryMethodChange]);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const finalTotalPrice =
    deliveryMethod === "Courier" ? Math.round(totalPrice * 1.1) : totalPrice;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const productId = cartItems.length > 0 ? cartItems[0].productId : null;
    const orderId = cartItems.length > 0 ? cartItems[0].orderId : null;

    if (!productId) {
      alert("Добавьте товары в корзину перед оформлением заказа.");
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      orderId,
      firstName,
      lastName,
      email,
      cellphone,
      deliveryMethod,
      selectedRegionId,
      selectedCityId,
      address,
      houseNumber,
      paymentMethod,
      totalPrice,
    };

    try {
      const response = await sendOrderData(orderData);
      localStorage.setItem("phoneNumber", response.phoneNumber);
      localStorage.setItem("hashedCode", response.hashedCode);
      localStorage.setItem("salt", response.salt);
      localStorage.setItem("orderId", response.orderId);
      localStorage.setItem("deliveryType", response.deliveryMethod);
      localStorage.setItem("uniqueCode", response.uniqueCode);

      if (response.deliveryMethod === "Courier") {
        localStorage.setItem("region", response.regionId || "");
        localStorage.setItem("city", response.cityId || "");
        localStorage.setItem("street", response.address || "");
        localStorage.setItem("houseNumber", response.houseNumber || "");
      }

      if (paymentMethod === "card" && response.redirectUrl) {
        localStorage.setItem("redirectUrl", response.redirectUrl);
        window.location.href = response.redirectUrl;
      }

      onOrderSubmit(response.phoneNumber);
    } catch (error) {
      if (typeof error === "object") {
        setErrors(error as { [key: string]: string });
      } else {
        console.error("Failed to submit data:", error);
        alert("Произошла ошибка при оформлении заказа. Попробуйте снова.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCities = cities.filter(
    (city) => city.regionId === selectedRegionId || city.regionId === null
  );

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

        <div className="space-y-4">
          {/* Pickup Option */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="radio"
                name="deliveryMethod"
                value="Pickup"
                checked={deliveryMethod === "Pickup"}
                onChange={() => setDeliveryMethod("Pickup")}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                deliveryMethod === "Pickup" ? "border-qyellow" : "border-[#CDCDCD]"
              }`}>
                {deliveryMethod === "Pickup" && (
                  <div className="w-2.5 h-2.5 bg-qyellow rounded-full" />
                )}
              </div>
            </div>
            <div>
              <span className="text-[15px] font-medium text-qblack">Самовывоз</span>
              <p className="text-[13px] text-qgray mt-1">
                Бесплатно. Адрес: г. Атырау
              </p>
            </div>
          </label>

          {/* Courier Option */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="radio"
                name="deliveryMethod"
                value="Courier"
                checked={deliveryMethod === "Courier"}
                onChange={() => setDeliveryMethod("Courier")}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                deliveryMethod === "Courier" ? "border-qyellow" : "border-[#CDCDCD]"
              }`}>
                {deliveryMethod === "Courier" && (
                  <div className="w-2.5 h-2.5 bg-qyellow rounded-full" />
                )}
              </div>
            </div>
            <div>
              <span className="text-[15px] font-medium text-qblack">Доставка курьером</span>
              <p className="text-[13px] text-qgray mt-1">
                +10% к стоимости заказа
              </p>
            </div>
          </label>

          {/* Courier Address Fields */}
          {deliveryMethod === "Courier" && (
            <div className="mt-4 pt-4 border-t border-[#EDEDED] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Region */}
                <div>
                  <label className="block text-[13px] font-medium text-qblack mb-2">
                    Регион <span className="text-qred">*</span>
                  </label>
                  <select
                    value={selectedRegionId}
                    onChange={(e) => {
                      setSelectedRegionId(e.target.value);
                      setSelectedCityId("");
                    }}
                    required
                    className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] text-qblack bg-white"
                  >
                    <option value="">Выберите регион</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[13px] font-medium text-qblack mb-2">
                    Город <span className="text-qred">*</span>
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    disabled={!selectedRegionId}
                    required
                    className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] text-qblack bg-white disabled:bg-[#F6F6F6] disabled:cursor-not-allowed"
                  >
                    <option value="">Выберите город</option>
                    {filteredCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street */}
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

                {/* House Number */}
                <div>
                  <label className="block text-[13px] font-medium text-qblack mb-2">
                    Дом, квартира <span className="text-qred">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Номер дома и квартиры"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    required
                    className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] placeholder:text-qgray"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
        disabled={isSubmitting || cartItems.length === 0}
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
