

export function getLevel(x) {
  if (x < 0) throw new Error("x must be non-negative");

  const k = Math.floor((1 + Math.sqrt(1 + 4 * x / 5)) / 2);

  return k;
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


const CLIENT_ID = "Ov23liOda3qqFTKeKow1";

export function loginGit() {
  window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
}

export function unlogin() {
  localStorage.removeItem("accessToken");
  window.location.reload();
}
