import Category from "./interfaces/category.interace";
import { Product } from "./interfaces/product.interface";

// console.log("Development API URL:", process.env.NEXT_PUBLIC_API_URL);

export async function fetchCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/CategoryClient/IndexJson`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error; // Выброс ошибки для последующей обработки
  }
}

export async function fetchCategoryDetails(slug: string): Promise<Category | null> {
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

export async function fetchProducts(minPrice: number = 0, maxPrice: number = 1000000, categoryId: string = ''): Promise<Product[] | null> {
  try {
    const queryParams = new URLSearchParams({
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      ...(categoryId && { categoryId })
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

export async function fetchProductDetails(slug: string): Promise<Product | null> {
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
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
