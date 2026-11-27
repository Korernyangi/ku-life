const statuses = ['free', 'purchase_required', 'unlimited'];
const demoKey = 'ku-life:rewind-preview:access';

export function readRewindStorage(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

export function createRewindAccess(getToken, mockStorage = null) {
  async function request(path, body) {
    const token = await getToken();
    if (!token) throw new Error('로그인한 계정으로 이용권을 확인해 주세요.');
    const response = await fetch('/api/rewind-' + path, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json' }) },
      ...(body && { body: JSON.stringify(body) }),
    });
    if (!response.ok) throw new Error('치팅모드 서버에 연결하지 못했어요. 다시 시도해 주세요.');
    return response.json();
  }

  if (mockStorage) {
    const read = () => readRewindStorage(mockStorage, demoKey) ?? { status: 'free', starts: {} };
    const write = value => mockStorage.setItem(demoKey, JSON.stringify(value));
    return {
      access: async () => read().status,
      start: async ({ requestId }) => {
        const demo = read();
        if (Object.hasOwn(demo.starts, requestId)) return { branchId: demo.starts[requestId] };
        if (demo.status === 'purchase_required') return { branchId: null };
        const branchId = requestId;
        demo.starts[requestId] = branchId;
        if (demo.status === 'free') demo.status = 'purchase_required';
        write(demo);
        return { branchId };
      },
      checkout: async () => '?rewind=preview-checkout',
      completePurchase() {
        write({ ...read(), status: 'unlimited' });
      },
      reset() {
        mockStorage.removeItem(demoKey);
      },
    };
  }

  return {
    async access() {
      const { status } = await request('access');
      if (!statuses.includes(status)) throw new Error('이용권 상태를 확인하지 못했어요. 다시 시도해 주세요.');
      return status;
    },
    async start(selection) {
      const { branchId, status } = await request('start', selection);
      if (status === 'purchase_required' && !branchId) return { branchId: null };
      if (typeof branchId !== 'string' || !branchId) throw new Error('분기 시작을 확인하지 못했어요.');
      return { branchId };
    },
    async checkout() {
      const { checkoutUrl } = await request('checkout', {});
      const url = new URL(checkoutUrl);
      if (url.protocol !== 'https:' || !(url.hostname === 'groble.im' || url.hostname.endsWith('.groble.im'))) {
        throw new Error('그로블 결제 주소를 확인하지 못했어요.');
      }
      return url.href;
    },
  };
}
