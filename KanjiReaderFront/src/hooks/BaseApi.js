async function apiFetch(endpoint) {
  // Выводим все доступные JS куки для теста
  console.log("Current document.cookie:", document.cookie);

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

export async function getUserData() {
  return await apiFetch("/api/getKanjiUserData");
}

export async function getQuests() {
  return await apiFetch("/api/getQuests");
}

export async function getStats() {
  return await apiFetch("/api/getStats");
}

export async function sendGameResult(payload) {
  console.log("Current document.cookie (on POST):", document.cookie);
  
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const response = await fetch("/api/checkResult", { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        "Authorization": "Bearer " + token 
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error("Server error");
    return await response.json();
  } catch (err) {
    console.error("Failed to sync game results:", err);
    return null;
  }
}