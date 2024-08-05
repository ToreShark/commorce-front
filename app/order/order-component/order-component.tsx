import { CartContext } from "@/app/lib/CartContext";
import { FormEvent, useContext, useEffect, useState } from "react";
import "@/app/order/order-component/order-component.style.scss";
import { fetchRegionsAndCities, sendOrderData } from "@/app/lib/data";
import { City, Region } from "@/app/lib/interfaces/region.interface";
import { useRouter } from "next/navigation";
import OrderSendCodeModal from "./order-send-code";

export default function OrderContent() {
  const { cartItems } = useContext(CartContext);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Pickup"); // 'pickup' or 'courier'
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const finalTotalPrice =
  deliveryMethod === "Courier" ? Math.round(totalPrice * 1.1) : totalPrice;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if there are items in the cart and get the productId of the first item
    const productId = cartItems.length > 0 ? cartItems[0].productId : null;
    const orderId = cartItems.length > 0 ? cartItems[0].orderId : null;

    // Validate form data
    if (!productId) {
      alert("Please add items to your cart before submitting the order.");
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
        router.push(`/order?orderId=${response.orderId}&uniqueCode=${response.uniqueCode}&step=3`);
      }
      // открыть модальное окно
      setIsModalOpen(true);
      // Дополнительная обработка успешного ответа сервера
    } catch (error) {
      if (typeof error === "object") {
        setErrors(error as { [key: string]: string });
      } else {
        console.error("Failed to submit data:", error);
        alert("There was an error submitting your order. Please try again.");
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="order-form">
        <h1>Офромление заказа</h1>
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
        <input
          type="tel"
          name="cellphone"
          placeholder="Телефон"
          value={cellphone}
          onChange={(e) => setCellphone(e.target.value)}
          required
        />
        {errors.cellphone && <div className="error">{errors.cellphone}</div>}
        <div className="delivery-method-card">
          <h2>Выберите способ доставки:</h2>
          <label>
            <input
              type="radio"
              name="deliveryMethod"
              value="Pickup"
              checked={deliveryMethod === "Pickup"}
              onChange={() => setDeliveryMethod("Pickup")}
            />{" "}
            Самовывоз
          </label>
          <label>
            <input
              type="radio"
              name="deliveryMethod"
              value="Courier"
              checked={deliveryMethod === "Courier"}
              onChange={() => setDeliveryMethod("Courier")}
            />{" "}
            Доставка курьером
          </label>
          {/* Жесткий адрес доставки */}
          {deliveryMethod === "Pickup" && (
            <div className="pickup-address">
              <p>Адрес для самовывоза: г. Атырау</p>
            </div>
          )}
          {/* Выпадающий список при выборе курьером */}
          {deliveryMethod === "Courier" && (
            <div className="courier-options">
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
              >
                <option value="">Выберите регион</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                disabled={!selectedRegionId}
              >
                <option value="">Выберите город</option>
                {cities
                  .filter(
                    (city) =>
                      city.regionId === selectedRegionId ||
                      city.regionId === null
                  )
                  .map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
              </select>

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
                placeholder="Номер дома и квартиры"
                required
              />
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
            <p>Итого к оплате:</p>
            <p className="amount">₸{finalTotalPrice}</p>
            {/* <!-- Здесь предполагается, что totalAmount уже вычислен и доступен --> */}
          </div>
        </div>

        <button type="submit">Отправить номер для заказа</button>
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
