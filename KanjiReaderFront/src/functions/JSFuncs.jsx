
export function questIcon(type) {
  if (type === "CorrectPer1M" || type === "CorrectPer2M") return "時"
  else if (type === "Percent") return "率"
  else if (type === "InRow1M" || type === "InRow2M") return "列"
  else if (type === "CorrectSum") return "総"
  else return "那"
}

export function getLevel(x) {
  if (x < 0) throw new Error("x must be non-negative");

  const k = Math.ceil((1 + Math.sqrt(1 + 4 * x / 5)) / 2);

  return k - 1;
}

export function getRemainXP(x, k) {
  if (x < 0) throw new Error("x must be non-negative");

  const threshold = 5 * k * (k - 1);
  return x - threshold;
}

export function getMaxXPForLevel(level) {
  if (level < 0) throw new Error("level must be non-negative");

  const nextLevelMinXP = 5 * (level + 1) * level;
  return nextLevelMinXP;
}

export function getLevelXP(level) {
  return getMaxXPForLevel(level) - getMaxXPForLevel(level - 1);
}



export function loginGit() {
  window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
}

export function unlogin() {
  localStorage.removeItem("accessToken");
  window.location.reload();
}