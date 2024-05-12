import { CartContext } from "@/app/lib/CartContext";
import { FormEvent, useContext, useEffect, useState } from "react";
import "@/app/order/order-component/order-component.style.scss";
import { fetchRegionsAndCities } from "@/app/lib/data";
import { City, Region } from "@/app/lib/interfaces/region.interface";

export default function OrderContent() {
  const { cartItems } = useContext(CartContext);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // 'pickup' or 'courier'
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState("");

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if there are items in the cart and get the productId of the first item
    const productId = cartItems.length > 0 ? cartItems[0].productId : null;

    // Extract form data using FormData and casting types properly
    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const cellphone = formData.get("cellphone") as string;

    // Validate form data
    if (!productId) {
      alert("Please add items to your cart before submitting the order.");
      return;
    }

    if (!firstName || !lastName || !email || !cellphone) {
      alert("Please fill out all required fields.");
      return;
    }

    const data = {
      Id: productId,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Cellphone: cellphone,
    };

    try {
      console.log("Submitting data:", data);
      // Placeholder for actual submission logic
      // await submitFormData(data);
    } catch (error) {
      console.error("Failed to submit data:", error);
      alert("There was an error submitting your order. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <h1>Офромление заказа</h1>
      <input type="text" name="firstName" placeholder="Фамилия" required />
      <input type="text" name="lastName" placeholder="Имя" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="tel" name="cellphone" placeholder="Телефон" required />
      <div className="delivery-method-card">
        <h2>Выберите способ доставки:</h2>
        <label>
          <input
            type="radio"
            name="deliveryMethod"
            value="pickup"
            checked={deliveryMethod === "pickup"}
            onChange={() => setDeliveryMethod("pickup")}
          />{" "}
          Самовывоз
        </label>
        <label>
          <input
            type="radio"
            name="deliveryMethod"
            value="courier"
            checked={deliveryMethod === "courier"}
            onChange={() => setDeliveryMethod("courier")}
          />{" "}
          Доставка курьером
        </label>
        {/* Жесткий адрес доставки */}
        {deliveryMethod === "pickup" && (
          <div className="pickup-address">
            <p>Адрес для самовывоза: г. Атырау</p>
          </div>
        )}
        {/* Выпадающий список при выборе курьером */}
        {deliveryMethod === "courier" && (
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
                    city.regionId === selectedRegionId || city.regionId === null
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
          <p className="amount">₸{totalPrice}</p>
          {/* <!-- Здесь предполагается, что totalAmount уже вычислен и доступен --> */}
        </div>
      </div>

      <button type="submit">Отправить номер для заказа</button>
    </form>
  );
}
