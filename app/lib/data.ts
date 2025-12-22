import { setCookie } from "./getRefreshToken";
import Category from "./interfaces/category.interace";
import { Product } from "./interfaces/product.interface";
import { getSessionFromLocalStorage } from "./session";
import Cookie from "js-cookie";
import { CartItemInterface } from "./interfaces/cart.item.interface";
import { WeeklySalesData } from "./interfaces/WeeklySalesData";
import { DailySalesDataViewModel } from "./interfaces/DailySalesDataViewModel";
import { OrderDataViewModel } from "./interfaces/OrderDataViewModel.interface";
import Cookies from "js-cookie";
import { ProductsResponse } from "./interfaces/ProductsResponse";
import { CreateCategory } from "../dashboard/products/interface/create.category.interface";
import { TelegramAuthData, AuthResponse } from "./interfaces/auth.interface";

// console.log("Development API URL:", process.env.NEXT_PUBLIC_API_URL);

// ==================== TELEGRAM AUTH ====================

/**
 * DEV авторизация — только для Development режима
 * Авторизует фиксированного тестового пользователя как SuperAdmin
 */
export async function devLogin(): Promise<AuthResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/dev`;
  console.log("[devLogin] URL:", url);

  try {
    console.log("[devLogin] Отправка POST запроса...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("[devLogin] Response status:", response.status);
    console.log("[devLogin] Response ok:", response.ok);

    const data: AuthResponse = await response.json();
    console.log("[devLogin] Response data:", data);

    if (data.success && data.accessToken) {
      console.log("[devLogin] Сохранение токена в localStorage...");
      localStorage.setItem("accessToken", data.accessToken);
      setCookie("token", data.accessToken, { maxAge: 7 * 24 * 60 * 60, path: "/" }); // 7 дней
      console.log("[devLogin] Токен сохранён");
    } else {
      console.log("[devLogin] Токен не получен или success=false");
    }

    return data;
  } catch (error) {
    console.error("[devLogin] Exception:", error);
    return {
      success: false,
      error: "Ошибка подключения к серверу",
    };
  }
}

/**
 * Telegram авторизация — для Production режима
 * Отправляет данные от Telegram Login Widget на сервер для валидации
 */
export async function telegramLogin(authData: TelegramAuthData): Promise<AuthResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: authData.id,
        firstName: authData.first_name,
        lastName: authData.last_name,
        username: authData.username,
        photoUrl: authData.photo_url,
        authDate: authData.auth_date,
        hash: authData.hash,
      }),
      credentials: "include",
    });

    const data: AuthResponse = await response.json();

    if (data.success && data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      setCookie("token", data.accessToken, { maxAge: 7 * 24 * 60 * 60, path: "/" }); // 7 дней
    }

    return data;
  } catch (error) {
    console.error("Telegram login error:", error);
    return {
      success: false,
      error: "Ошибка подключения к серверу",
    };
  }
}

/**
 * Выход из системы — очистка токенов
 */
export async function authLogout(): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`;

  try {
    await fetch(url, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("accessToken");
    Cookies.remove("token");
  }
}

/**
 * Получить информацию о текущем пользователе
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`;
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return { success: false, error: "Не авторизован" };
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      Cookies.remove("token");
      return { success: false, error: "Сессия истекла" };
    }

    return await response.json();
  } catch (error) {
    console.error("Get current user error:", error);
    return { success: false, error: "Ошибка подключения" };
  }
}

// ==================== END TELEGRAM AUTH ====================

export async function fetchCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/CategoryClient/IndexJson`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error; // Выброс ошибки для последующей обработки
  }
}

export async function fetchCategoryDetails(
  slug: string
): Promise<Category | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/CategoryClient/GetCategoryDetails/${slug}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error; // Rethrow the error for further handling
  }
}

export async function fetchProducts(
  minPrice: number = 0,
  maxPrice: number = 1000000,
  categoryId: string = ""
): Promise<Product[] | null> {
  try {
    const queryParams = new URLSearchParams({
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      ...(categoryId && { categoryId }),
    });
    const url = `${process.env.NEXT_PUBLIC_API_URL}/Product/GetProducts?${queryParams}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null; // Возвращаем null вместо повторного выброса ошибки
  }
}

export async function fetchProductDetails(
  slug: string
): Promise<Product | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/Product/IndexDetail/${slug}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error; // Rethrow the error for further handling
  }
}

export async function sendPhone(phoneNumber: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/SendPhone`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error; // Повторно выбрасываем ошибку для последующей обработки
  }
}

export async function sendSmsCode(
  phoneNumber: string,
  smsCode: string,
  hashedCode: string,
  salt: string
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/SendCode`;
  try {
    const data = {
      phoneNumber: phoneNumber,
      smsCode: smsCode,
      hashedCode: hashedCode,
      salt: salt,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();

    if (responseData && responseData.token) {
      localStorage.setItem("accessToken", responseData.token);
      setCookie("token", responseData.token, { maxAge: 10 * 60, path: "/" }); // 10 минут
    } else {
      // Если токен не найден в ответе, выводим ошибку
      console.error("Token not found in the response");
      throw new Error("Token not found in the response");
    }

    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getUser() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/User`;
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Если сервер вернул 401 Unauthorized, значит токен истек
      console.log("Access token has expired. Refreshing token...");
      const newToken = await refreshToken();

      if (newToken) {
        // Если удалось получить новый токен, сохраняем его в localStorage
        localStorage.setItem("accessToken", newToken);

        // Повторяем запрос с новым токеном
        const retryResponse = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return data;
        } else {
          throw new Error(`HTTP error! Status: ${retryResponse.status}`);
        }
      } else {
        // Если не удалось получить новый токен, удаляем accessToken из localStorage
        localStorage.removeItem("accessToken");
        return null;
      }
    } else if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function refreshToken() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/Refresh`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Включить отправку cookie с refreshToken
    });
    if (!response.ok) {
      console.log("Debug: Server response:", response);
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const { token } = await response.json();

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // Устанавливаем срок действия на 7 дней от текущей даты

    setCookie("token", token, {
      expires: expirationDate,
      secure: true,
      sameSite: "strict",
    }); // Сохраняем новый access token в cookie
    return token;
  } catch (error) {
    console.error(
      "There was a problem with the token refresh operation:",
      error
    );
    throw error; // Повторно выбрасываем ошибку для последующей обработки
  }
}
// метод logout
export async function logout() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/LogoutNext`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Необходимо для отправки cookies с refreshToken
    });

    if (!response.ok) {
      const message = await response.text();
      console.log("Debug: Server response:", message);
      throw new Error(
        `Logout failed with status (${response.status}): ${message}`
      );
    }

    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return "Вы успешно вышли.";
  } catch (error) {
    console.error("There was a problem with the logout operation:", error);
    throw error; // Повторно выбрасываем ошибку для последующей обработки
  }
}

export async function addItemToCartAPI(
  id: string,
  selectedPropertiesJson: string,
  cellphone: string | null = null
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Cart/AddToCartNext`;

  try {
    const sessionId = Cookie.get("ASP.NET_SessionId");
    const headers = {
      "Content-Type": "application/json",
      // Установка куки в заголовок, если она существует
      ...(sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {}),
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        id,
        selectedPropertiesJson,
        cellphone,
      }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
      // Обновляем куку ASP.NET_SessionId, если сервер прислал обновлённое значение
      const newSessionId = setCookie.split(";")[0].split("=")[1];
      Cookie.set("ASP.NET_SessionId", newSessionId, {
        expires: 1 / 24 / 2,
        secure: true,
      });
    }
    const result = await response.json(); // Десериализуем JSON без предварительной проверки Content-Length

    if (result && result.addedItem) {
      // Проверяем, что результат не пустой
      return result.addedItem as CartItemInterface;
    } else {
      console.error("Server response was empty or undefined.");
      return null; // Возвращаем null, если результат пустой или неопределён
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error; // Повторно выбрасываем ошибку для последующей обработки
  }
}

export async function fetchCartInfo() {
  try {
    const sessionId = Cookie.get("ASP.NET_SessionId");
    const headers = {
      "Content-Type": "application/json",
      // Установка куки в заголовок, если она существует
      ...(sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {}),
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Cart/GetCartInfo`,
      {
        method: "GET",
        headers: headers,
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an issue fetching the cart info:", error);
    return null;
  }
}
export async function decreaseItemQuantity(itemUniqueId: string) {
  try {
    const sessionId = Cookie.get("ASP.NET_SessionId");
    const headers = {
      "Content-Type": "application/json",
      // Ensure the session cookie is included in the request if it exists
      ...(sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {}),
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Cart/DecreaseItemNext`,
      {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ UniqueOrderId: itemUniqueId }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an issue decreasing the item quantity:", error);
    return null;
  }
}
export async function increaseItemQuantity(itemUniqueId: string) {
  try {
    const sessionId = Cookie.get("ASP.NET_SessionId");
    const headers = {
      "Content-Type": "application/json",
      // Ensure the session cookie is included in the request if it exists
      ...(sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {}),
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Cart/IncreaseItemNext`,
      {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ UniqueOrderId: itemUniqueId }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an issue increasing the item quantity:", error);
    return null;
  }
}
export async function removeItemFromCart(productId: string) {
  try {
    const sessionId = Cookie.get("ASP.NET_SessionId");
    const headers = {
      "Content-Type": "application/json",
      // Ensure the session cookie is included in the request if it exists
      ...(sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {}),
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Cart/RemoveItemNext`,
      {
        method: "DELETE",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ ProductId: productId }), // Теперь отправляем productId
      }
    );

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an issue removing the item:", error);
    return null;
  }
}
// Utility function to fetch regions and cities for the delivery address form
export async function fetchRegionsAndCities(): Promise<any | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/Cart/GetRegionsAndCities`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include", // Это обеспечит отправку куки, включая сессионные
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("There was an issue fetching the regions and cities:", error);
    return null;
  }
}

export async function sendOrderData(orderData: {
  firstName: string;
  lastName: string;
  email: string;
  cellphone: string;
  deliveryMethod: string;
  selectedRegionId: string;
  selectedCityId: string;
  address: string;
  houseNumber: string;
  paymentMethod: string;
  totalPrice: number;
}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Cart/SendConfirmationCodeNext`;

  try {
    const sessionId = Cookie.get("ASP.NET_SessionId");
    const headers = {
      "Content-Type": "application/json",
      ...(sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server Error Response:", errorData);
      if (response.status === 400) {
        const errorData = await response.json();
        return Promise.reject(errorData.errors);
      }
      throw new Error(
        `Network response was not ok (${response.status}): ${response.statusText}`
      );
    }

    // Если ответ пустой, возвращаем пустой объект
    if (response.status === 204) {
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function sendSmsCodeOrder(
  phoneNumber: string,
  password: string,
  salt: string,
  hash: string,
  orderId: string,
  uniqueCode: string | undefined,
  region?: string,
  city?: string,
  street?: string,
  houseNumber?: string,
  redirectUrl?: string
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Cart/ConfirmAndSaveDelivery`;
  try {
    const data: { [key: string]: string } = {
      PhoneNumber: phoneNumber || "",
      Password: password || "",
      Salt: salt || "",
      Hash: hash || "",
      OrderId: orderId || "",
      RedirectUrl: redirectUrl || "",
    };

    if (uniqueCode !== undefined) {
      data.UniqueCode = uniqueCode;
    }

    // Добавляем поля адреса доставки только если выбрана курьерская доставка
    if (uniqueCode === "Courier") {
      data.Region = region || "";
      data.City = city || "";
      data.Street = street || "";
      data.HouseNumber = houseNumber || "";
    }

    const jsonData = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchPurchaseHistory() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Cart/PurchaseHistoryNext`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Добавляем токен авторизации, если он есть
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return {
      success: responseData.success,
      data: responseData.data,
      message: responseData.message || null,
    };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getCategories(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Admin/GetCategories`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getUsers(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/User/GetUsers`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getOrderCount(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Order/GetOrderCount`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getOrderTotalPrice(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Order/GetOrderTotalPrice`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getUsersWithLastTransactions(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/User/GetUsersWithLastTransactions`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function deleteUser(id: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/User/DeleteUser/${id}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    return true;
  } catch (error) {
    console.error(
      `There was a problem with the delete operation for user with ID: ${id}`,
      error
    );
    throw error;
  }
}

export async function getWeeklySalesData(
  token: string
): Promise<DailySalesDataViewModel[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Order/GetWeeklySalesData`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return responseData.dailySalesData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchOrderDetails(
  orderId: string
): Promise<OrderDataViewModel | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/OrderClient/GetOrderById/${orderId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null; // Возвращаем null вместо повторного выброса ошибки
  }
}

export async function fetchOk(): Promise<{ message: string } | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/OrderClient/GetOk`;
    console.log(`Fetching OK message from URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null; // Возвращаем null вместо повторного выброса ошибки
  }
}

export async function getUserById(id: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/User/GetUserById/${id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `There was a problem with the fetch operation for user with ID: ${id}`,
      error
    );
    throw error;
  }
}

export async function getAllCategories(token: string): Promise<any[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Category/GetAllCategories`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function deleteCategory(id: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Category/DeleteCategory/${id}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Category not found");
      }
      throw new Error(
        `Server responded with ${response.status}: ${response.statusText}`
      );
    }

    // Если удаление прошло успешно, сервер вернет 204 No Content
    return true;
  } catch (error) {
    console.error(`Error deleting category with ID: ${id}`, error);
    throw error;
  }
}

export async function getProductsByCategory(categoryId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/CategoryProducts/GetProductsByCategory/${categoryId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log("DATA", data);
    return data.products; // возвращаем только список продуктов
  } catch (error) {
    console.error(
      `There was a problem with the fetch operation for category with ID: ${categoryId}`,
      error
    );
    throw error;
  }
}

export async function createCategory(
  categoryData: CreateCategory,
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Category/CreateNext`;

  const formData = new FormData();
  Object.entries(categoryData).forEach(([key, value]) => {
    formData.append(key, value as any);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation", error);
    throw error;
  }
}

export async function getCategoryById(categoryId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/CategoryProducts/GetProductsByCategory/${categoryId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data; // возвращаем все данные о категории
  } catch (error) {
    console.error(
      `There was a problem with the fetch operation for category with ID: ${categoryId}`,
      error
    );
    throw error;
  }
}

export async function editCategory(
  categoryData: CreateCategory & { id: string },
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Category/EditNext`;

  const formData = new FormData();
  Object.entries(categoryData).forEach(([key, value]) => {
    formData.append(key, value as any);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation", error);
    throw error;
  }
}

export async function editProduct(
  formData: FormData, // Аналогично CreateCategory, предполагается, что CreateProduct это тип, включающий все поля продукта.
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/ProductAdmin/EditNext`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include", // Убедитесь, что cookies для аутентификации передаются с запросом
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log("Product edited successfully:", data);
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function deleteProductImage(imageId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/ProductAdmin/DeleteImage`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId }),
      credentials: "include", // Убедитесь, что cookies для аутентификации передаются с запросом
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function createProduct(
  formData: FormData,
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/ProductAdmin/CreateProduct`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include", // Для передачи cookies аутентификации
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log("Product created successfully:", data);
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchCategoriesSitemap(): Promise<Category[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/CategoryClient/GetSitemapSlugs`;
    console.log(`Fetching from URL: ${url}`); // Логирование URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      lastModified: item.LastModified,
    }));
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error; // Rethrow the error for further handling
  }
}

export async function deleteProduct(id: string, token: string): Promise<{ success: boolean; message: string }> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/ProductAdmin/DeleteProduct/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Для передачи cookies аутентификации
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the delete operation:", error);
    throw error;
  }
}

export async function getAllOrders(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Order/GetAllOrders`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include", // Убедитесь, что cookies для аутентификации передаются с запросом
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}
