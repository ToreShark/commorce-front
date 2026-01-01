import { CartContext } from "@/app/lib/CartContext";
import { FormEvent, useContext, useEffect, useState } from "react";
import "@/app/order/order-component/order-component.style.scss";
import { sendOrderData, calculateDeliveryOptions, setOrderDelivery } from "@/app/lib/data";
import { useRouter } from "next/navigation";
import OrderSendCodeModal from "./order-send-code";
import CityAutocomplete from "./CityAutocomplete";
import DeliveryOptions from "./DeliveryOptions";
import { CdekCity, DeliveryOption } from "@/app/lib/interfaces/cdek.interface";
import PhoneInput from "@/app/components/Auth/PhoneInput";

export default function OrderContent() {
  const { cartItems } = useContext(CartContext);
  const [houseNumber, setHouseNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CDEK state
  const [selectedCity, setSelectedCity] = useState<CdekCity | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryCost = selectedDeliveryOption?.cost ?? 0;
  const finalTotalPrice = totalPrice + deliveryCost;

  // При выборе города - загружаем варианты доставки
  const handleCitySelect = async (city: CdekCity) => {
    setSelectedCity(city);
    setSelectedDeliveryOption(null);
    setDeliveryError(null);

    const orderId = cartItems.length > 0 ? cartItems[0].orderId : null;
    if (!orderId) {
      setDeliveryError("Нет активного заказа");
      return;
    }

    setIsCalculatingDelivery(true);
    try {
      const options = await calculateDeliveryOptions(orderId, city.code);
      setDeliveryOptions(options);

      // Автоматически выбираем самовывоз если доступен
      const pickupOption = options.find((o) => o.type === "pickup");
      if (pickupOption) {
        setSelectedDeliveryOption(pickupOption);
      }
    } catch (error) {
      console.error("Ошибка расчёта доставки:", error);
      setDeliveryError("Не удалось рассчитать доставку");
      setDeliveryOptions([]);
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  const handleDeliverySelect = (option: DeliveryOption) => {
    setSelectedDeliveryOption(option);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const productId = cartItems.length > 0 ? cartItems[0].productId : null;
    const orderId = cartItems.length > 0 ? cartItems[0].orderId : null;

    if (!productId || !orderId) {
      alert("Добавьте товары в корзину перед оформлением заказа.");
      return;
    }

    if (!selectedDeliveryOption) {
      alert("Выберите способ доставки.");
      return;
    }

    // Для CDEK курьером нужен полный адрес
    if (selectedDeliveryOption.type === "cdek_courier") {
      if (!selectedCity || !address || !houseNumber) {
        alert("Заполните адрес доставки.");
        return;
      }
    }

    // Сначала сохраняем доставку через API
    if (orderId && selectedDeliveryOption.type !== "pickup") {
      const deliveryRequest = {
        orderId,
        deliveryType: selectedDeliveryOption.type,
        address:
          selectedDeliveryOption.type === "cdek_courier"
            ? {
                city: selectedCity!.city,
                cityCode: selectedCity!.code,
                street: address,
                house: houseNumber,
              }
            : undefined,
        recipient: {
          name: `${firstName} ${lastName}`.trim(),
          phone: cellphone,
          email: email || undefined,
        },
      };

      const deliveryResult = await setOrderDelivery(deliveryRequest);
      if (!deliveryResult || !deliveryResult.success) {
        alert(deliveryResult?.error || "Ошибка сохранения доставки");
        return;
      }
    }

    // Мапим deliveryType для старого API
    const deliveryMethod =
      selectedDeliveryOption.type === "pickup" ? "Pickup" : "Courier";

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

    try {
      const response = await sendOrderData(orderData);
      localStorage.setItem("phoneNumber", response.phoneNumber);
      localStorage.setItem("hashedCode", response.hashedCode);
      localStorage.setItem("salt", response.salt);
      localStorage.setItem("orderId", response.orderId);
      localStorage.setItem("deliveryType", selectedDeliveryOption.type);
      localStorage.setItem("uniqueCode", response.uniqueCode);

      if (selectedDeliveryOption.type !== "pickup" && selectedCity) {
        localStorage.setItem("city", selectedCity.city);
        localStorage.setItem("street", address);
        localStorage.setItem("houseNumber", houseNumber);
      }

      if (paymentMethod === "card" && response.redirectUrl) {
        localStorage.setItem("redirectUrl", response.redirectUrl);
        window.location.href = response.redirectUrl;
      }

      setIsModalOpen(true);
    } catch (error) {
      if (typeof error === "object") {
        const errorObj = error as { [key: string]: string };
        setErrors(errorObj);
        // Показываем ошибку orderId как alert
        if (errorObj.orderId) {
          alert(errorObj.orderId);
        }
      } else {
        console.error("Failed to submit data:", error);
        alert("Произошла ошибка при оформлении заказа. Попробуйте снова.");
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="order-form">
        <h1>Оформление заказа</h1>

        <div className="form-section">
          <h2>Контактные данные</h2>
          <input
            type="text"
            name="firstName"
            placeholder="Фамилия"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          {errors.firstName && <div className="error">{errors.firstName}</div>}
          <input
            type="text"
            name="lastName"
            placeholder="Имя"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {errors.lastName && <div className="error">{errors.lastName}</div>}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <div className="error">{errors.email}</div>}
          <PhoneInput
            name="cellphone"
            value={cellphone}
            onChange={(clean, formatted) => setCellphone(formatted)}
            placeholder="+7 (___) ___-__-__"
            required
            error={errors.cellphone}
          />
        </div>

        <div className="delivery-method-card">
          <h2>Доставка</h2>

          <div className="city-search">
            <label>Город доставки:</label>
            <CityAutocomplete
              onCitySelect={handleCitySelect}
              placeholder="Начните вводить название города"
            />
          </div>

          {deliveryError && (
            <div className="error" style={{ marginTop: "10px" }}>
              {deliveryError}
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <DeliveryOptions
              options={deliveryOptions}
              selectedType={selectedDeliveryOption?.type || null}
              onSelect={handleDeliverySelect}
              isLoading={isCalculatingDelivery}
            />
          </div>

          {/* Дополнительные поля для курьерской доставки */}
          {selectedDeliveryOption?.type === "cdek_courier" && (
            <div className="courier-options" style={{ marginTop: "20px" }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Улица"
                required
              />
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Дом, квартира"
                required
              />
            </div>
          )}

          {/* Для ПВЗ показываем информацию */}
          {selectedDeliveryOption?.type === "cdek_pvz" && (
            <div className="pvz-info" style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              <p style={{ fontSize: "14px", color: "#666" }}>
                После оформления заказа с вами свяжется менеджер для уточнения пункта выдачи.
              </p>
            </div>
          )}

          {/* Для самовывоза */}
          {selectedDeliveryOption?.type === "pickup" && (
            <div className="pickup-address" style={{ marginTop: "15px" }}>
              <p>Адрес для самовывоза: г. Атырау</p>
            </div>
          )}
        </div>

        <div className="payment-method-card">
          <h2>Метод оплаты</h2>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />{" "}
            Банковской картой
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
            />{" "}
            Наличными при получении
          </label>
          <div className="total-amount">
            <div className="price-breakdown">
              <div className="price-row">
                <span>Товары:</span>
                <span>₸{totalPrice.toLocaleString("ru-RU")}</span>
              </div>
              <div className="price-row">
                <span>Доставка:</span>
                <span>
                  {deliveryCost === 0 ? (
                    <span style={{ color: "#22c55e" }}>Бесплатно</span>
                  ) : (
                    `₸${deliveryCost.toLocaleString("ru-RU")}`
                  )}
                </span>
              </div>
            </div>
            <div className="price-total">
              <p>Итого к оплате:</p>
              <p className="amount">₸{finalTotalPrice.toLocaleString("ru-RU")}</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={!selectedDeliveryOption}>
          {selectedDeliveryOption
            ? "Оформить заказ"
            : "Выберите способ доставки"}
        </button>
      </form>
      {isModalOpen && (
        <OrderSendCodeModal
          phoneNumber={localStorage.getItem("phoneNumber") || ""}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
