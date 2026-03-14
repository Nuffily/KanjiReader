export async function getUserData(setUserData) {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch("/api/getKanjiUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!response.ok || response.status === 401) {

      console.error("Unauthorized (401): Token expired or invalid");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      return;

    }

    const data = await response.json();
    console.log(data);
    setUserData(data);

  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
}

export async function getQuests(setQuests) {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch("/api/getQuests", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!response.ok || response.status === 401) {

      console.error("Unauthorized (401): Token expired or invalid");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      return;

    }

    const data = await response.json();
    console.log(data);
    setQuests(data);

  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
}


export async function getStats(setStats) {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch("/api/getStats", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!response.ok || response.status === 401) {

      console.error("Unauthorized (401): Token expired or invalid");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      return;

    }

    const data = await response.json();
    console.log(data);
    setStats(data)

  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
}