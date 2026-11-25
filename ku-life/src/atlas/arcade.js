export const ROULETTE = [20, -8, 5, 0, -3, 10, -8, 5, 0, -3];

export const CLAW_ATTEMPT_FEE = 50_000;

const prizeSlots = [
  [21, 60], [48, 53], [79, 70], [36, 86], [66, 23],
];

export function clawHitRadius(price) {
  return 8 * (100_000 / price) ** .4;
}

export function clawDropX(lockedX, depth) {
  const sway = 4 * Math.sin(depth * Math.PI / 25);
  return Math.min(100, Math.max(0, lockedX + sway));
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
