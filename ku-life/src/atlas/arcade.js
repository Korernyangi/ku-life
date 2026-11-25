export const ROULETTE = [20, -8, 5, 0, -3, 10, -8, 5, 0, -3];

export const CLAW_ATTEMPT_FEE = 50_000;

const prizeSlots = [
  15, 32.5, 50, 67.5, 85,
];

export function clawHitRadius(price) {
  return 8 * (100_000 / price) ** .4;
}

export function clawBoard(ids, items, semester) {
  const byPrice = [...ids].sort((a, b) => items[a].price - items[b].price);
  const rotatingPrizes = byPrice.slice(3, -1);
  const selected = byPrice.length > prizeSlots.length
    ? [...byPrice.slice(0, 3), rotatingPrizes[(semester - 1) % rotatingPrizes.length], byPrice.at(-1)]
    : byPrice;
  return selected.map((id, index) => {
    const x = prizeSlots[index];
    return { id, x, radius: clawHitRadius(items[id].price) };
  });
}

export function clawPrize(board, x) {
  const nearest = board.reduce((best, prize) =>
    !best || Math.abs(x - prize.x) < Math.abs(x - best.x) ? prize : best, null);
  return nearest && Math.abs(x - nearest.x) <= nearest.radius ? nearest.id : null;
}

export function rouletteCash(balance, percent) {
  return Math.trunc(balance * percent / 100) || 0;
}
