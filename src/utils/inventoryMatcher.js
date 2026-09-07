/**
 * Normalizes item names for accurate comparison and typo tolerance.
 * Handles common transpositions (e.g., "espon" -> "epson") and punctuation.
 */
export const normalizeItemName = (str) => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/\bespon\b/g, "epson") // Fix common transposition typo
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Calculates Levenshtein distance between two strings
 */
export const levenshteinDistance = (a, b) => {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
};

/**
 * Finds the corresponding inventory item from an item row in a transaction
 */
export const findMatchingInventoryItem = (trxItem, inventoryList = []) => {
  if (!trxItem || !inventoryList || inventoryList.length === 0) return null;

  // 1. Direct ID match (highest confidence)
  if (trxItem.inventoryId) {
    const directMatch = inventoryList.find((inv) => inv.id === trxItem.inventoryId);
    if (directMatch) return directMatch;
  }

  const rawItemName = trxItem.namaBarang || trxItem.nama || "";
  const normItem = normalizeItemName(rawItemName);
  if (!normItem) return null;

  // 2. Exact normalized match
  const exactMatch = inventoryList.find((inv) => {
    const normInv = normalizeItemName(inv.nama || inv.namaBarang || inv.name);
    return normInv === normItem;
  });
  if (exactMatch) return exactMatch;

  // 3. Substring inclusion match (e.g. "epson l4360" in "epson l4360 eco tank")
  const substringMatch = inventoryList.find((inv) => {
    const normInv = normalizeItemName(inv.nama || inv.namaBarang || inv.name);
    return normInv.includes(normItem) || normItem.includes(normInv);
  });
  if (substringMatch) return substringMatch;

  // 4. Token & Model Number match (e.g. "l4360", "l5290", "qct1250")
  const itemTokens = normItem.split(" ").filter((t) => t.length >= 2);
  let bestTokenMatch = null;
  let maxTokenScore = 0;

  for (const inv of inventoryList) {
    const normInv = normalizeItemName(inv.nama || inv.namaBarang || inv.name);
    const invTokens = normInv.split(" ").filter((t) => t.length >= 2);

    let commonCount = 0;
    let hasModelNumberMatch = false;

    for (const t of itemTokens) {
      if (invTokens.includes(t)) {
        commonCount++;
        // Check if token looks like a specific model (contains numbers like 4360, 5290, etc.)
        if (/\d/.test(t)) {
          hasModelNumberMatch = true;
        }
      }
    }

    // Heavy boost if distinct alphanumeric model number matches
    const score = commonCount + (hasModelNumberMatch ? 3 : 0);
    if (score > maxTokenScore && (hasModelNumberMatch || commonCount >= 2)) {
      maxTokenScore = score;
      bestTokenMatch = inv;
    }
  }

  if (bestTokenMatch) return bestTokenMatch;

  // 5. Fuzzy Levenshtein match for small typos
  let bestFuzzyMatch = null;
  let minDistance = Infinity;

  for (const inv of inventoryList) {
    const normInv = normalizeItemName(inv.nama || inv.namaBarang || inv.name);
    const dist = levenshteinDistance(normItem, normInv);
    if (dist <= 3 && dist < minDistance) {
      minDistance = dist;
      bestFuzzyMatch = inv;
    }
  }

  return bestFuzzyMatch;
};

