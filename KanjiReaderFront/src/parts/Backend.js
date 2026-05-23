// Внутренний базовый клиент для запросов
async function apiFetch(endpoint) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.warn(`Token missing, skipping request to: ${endpoint}`);
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized (401): Token expired or invalid");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        // Здесь можно сделать window.location.reload(), если нужно выкинуть юзера на авторизацию
      }
      return null;
    }

    const data = await response.json();
    console.log(`Data from ${endpoint}:`, data);
    return data;

  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    return null;
  }
}

// Теперь экспортируемые функции просто возвращают чистые данные
export async function getUserData() {
  return await apiFetch("/api/getKanjiUserData");
}

export async function getQuests() {
  return await apiFetch("/api/getQuests");
}

export async function getStats() {
  return await apiFetch("/api/getStats");
}