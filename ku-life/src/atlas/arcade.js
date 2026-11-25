export const ROULETTE = [20, -8, 5, 0, -3, 10, -8, 5, 0, -3];

const prizeSlots = [
  [21, 60], [48, 53], [79, 70], [36, 86], [66, 23],
];

export function clawHitRadius(price) {
  return Math.max(4, Math.min(14, 13 - 8 * Math.log10(price / 100_000)));
}

export function clawBoard(ids, items, semester) {
  const byPrice = [...ids].sort((a, b) => items[a].price - items[b].price);
  const rotatingPrizes = byPrice.slice(3, -1);
  const selected = byPrice.length > prizeSlots.length
    ? [...byPrice.slice(0, 3), rotatingPrizes[(semester - 1) % rotatingPrizes.length], byPrice.at(-1)]
    : byPrice;
  return selected.map((id, index) => {
    const [x, y] = prizeSlots[index];
    return { id, x, y, radius: clawHitRadius(items[id].price) };
  });
}

export function clawPrize(board, x, y) {
  return board.find(prize => Math.hypot(x - prize.x, y - prize.y) <= prize.radius)?.id ?? null;
}

export function rouletteCash(balance, percent) {
  return Math.trunc(balance * percent / 100) || 0;
}
