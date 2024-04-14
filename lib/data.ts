export async function fetchCategories() {
    try {
      const response = await fetch('https://localhost:7264/CategoryClient/IndexJson');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error; // Выброс ошибки для последующей обработки
    }
  }