import { setCookie } from "./getRefreshToken";
import Category from "./interfaces/category.interace";
import { Product } from "./interfaces/product.interface";
import { getSessionFromLocalStorage } from "./session";

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

export async function sendSmsCode(phoneNumber: string, smsCode: string, hashedCode: string, salt: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/SendCode`;
  try {
    const data = {
      phoneNumber: phoneNumber,
      smsCode: smsCode,
      hashedCode: hashedCode,
      salt: salt
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const responseData = await response.json();
    
    console.log("Response data:", responseData);

    if (responseData && responseData.token) {
      localStorage.setItem('accessToken', responseData.token);
      console.log("Token saved successfully");
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
  console.log(`da budet START!!!!`)
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/User`;
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      // Если сервер вернул 401 Unauthorized, значит токен истек
      console.log('Access token has expired. Refreshing token...');
      const newToken = await refreshToken();
      
      if (newToken) {
        // Если удалось получить новый токен, сохраняем его в localStorage
        localStorage.setItem('accessToken', newToken);
        
        // Повторяем запрос с новым токеном
        const retryResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return data;
        } else {
          throw new Error(`HTTP error! Status: ${retryResponse.status}`);
        }
      } else {
        // Если не удалось получить новый токен, удаляем accessToken из localStorage
        localStorage.removeItem('accessToken');
        return null;
      }
    } else if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function refreshToken() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/Refresh`;
  console.log('Debug: Entering refreshToken function');
  try {
    console.log('Debug: Fetching refresh token from server');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Включить отправку cookie с refreshToken
    });
    console.log('Debug: Response status code:', response.status);
    console.log('Debug: Current cookies:', document.cookie);
    if (!response.ok) {
      console.log('Debug: Server response:', response);
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const { token } = await response.json();
    console.log("Debug: Received token:", token); // Отладочное сообщение для проверки токена

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // Устанавливаем срок действия на 7 дней от текущей даты

    setCookie('token', token, { expires: expirationDate, secure: true, sameSite: 'strict' }); // Сохраняем новый access token в cookie
    return token;
  } catch (error) {
    console.error('There was a problem with the token refresh operation:', error);
    throw error; // Повторно выбрасываем ошибку для последующей обработки
  }
}
// метод logout
export async function logout() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/Account/LogoutNext`;
  console.log('Debug: Attempting to log out');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Необходимо для отправки cookies с refreshToken
    });

    console.log('Debug: Logout response status code:', response.status);
    if (!response.ok) {
      const message = await response.text();
      console.log('Debug: Server response:', message);
      throw new Error(`Logout failed with status (${response.status}): ${message}`);
    }

    console.log('Debug: Successfully logged out');
    return "Вы успешно вышли.";
  } catch (error) {
    console.error('There was a problem with the logout operation:', error);
    throw error; // Повторно выбрасываем ошибку для последующей обработки
  }
}