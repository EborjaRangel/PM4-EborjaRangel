export type MockCartItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  qty: number;
};

export const mockCartItems: MockCartItem[] = [
  {
    id: 1,
    name: "Auriculares Pulse Pro X",
    category: "Audio",
    price: 129.99,
    qty: 1,
  },
  {
    id: 2,
    name: "Smartwatch Pulse Active",
    category: "Wearables",
    price: 189.5,
    qty: 2,
  },
];

export function getMockCartTotals() {
  const subtotal = mockCartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const shipping = subtotal > 250 ? 0 : 14.9;
  const taxes = subtotal * 0.12;
  const total = subtotal + shipping + taxes;
  return { subtotal, shipping, taxes, total };
}
