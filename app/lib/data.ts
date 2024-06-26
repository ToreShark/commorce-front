import { setCookie } from "./getRefreshToken";
import Category from "./interfaces/category.interace";
import { Product } from "./interfaces/product.interface";
import { getSessionFromLocalStorage } from "./session";
import Cookie from "js-cookie";
import { CartItemInterface } from "./interfaces/cart.item.interface";

// console.log("Development API URL:", process.env.NEXT_PUBLIC_API_URL);

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
    const url = `${process.env.NEXT_PUBLIC_API_URL}/Product/GetProducts?minPrice=${minPrice}&maxPrice=${maxPrice}&categoryId=${categoryId}`;
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

export async function fetchProductDetails(
  slug: string
): Promise<Product | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/Product/IndexDetail/${slug}`;
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
      setCookie("token", responseData.token, 1/144);
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
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

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
export async function fetchRegionsAndCities() {
  try {
    const sessionId = Cookie.get("ASP.NET_SessionId"); // Make sure you have imported Cookie from 'js-cookie'
    const headers = {
      "Content-Type": "application/json",
      // Ensure the session cookie is included in the request if it exists
      ...(sessionId ? { Cookie: `ASP.NET_SessionId=${sessionId}` } : {}),
    };

    const response = await fetch(
      `https://localhost:7264/Cart/GetRegionsAndCities`, // Your ASP.NET Core endpoint
      {
        method: "GET",
        headers: headers,
        credentials: "include", // Ensure cookies are sent with the request for session management
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an issue fetching the regions and cities:", error);
    return null; // Returning null on error can simplify error handling in your React components
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
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    console.log(jsonData);

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
    console.log("Response data:", responseData);
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
    console.log("Response data:", responseData);
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
        "Authorization": `Bearer ${token}`
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();

    console.log("Response data:", responseData);

    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getUsers(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/User/GetUsers`;
  console.log("Getting users...");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getOrderCount(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Order/GetOrderCount`;
  console.log("Getting order count...");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getOrderTotalPrice(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/Order/GetOrderTotalPrice`;
  console.log("Getting total order price...");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getUsersWithLastTransactions(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Admin/User/GetUsersWithLastTransactions`;
  console.log("Getting users with last transactions...");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}