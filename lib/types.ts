export type Income = {
  id: string;
  source: string;
  type: string;
  amount: number;
};

export type Saving = {
  id: string;
  description: string;
  priority: string | null;
  amount: number;
};

export type FixedExpense = {
  id: string;
  category: string;
  amount: number;
  envelope_id?: string | null;
};

export type VariableExpense = {
  id: string;
  category: string;
  plan_amount: number;
  is_auto: boolean;
  envelope_id?: string | null;
};

// Fitur Budgetin' Plus — Alokasi Budget (%). Satu "envelope" adalah kategori
// custom (mis. "Kebutuhan Sehari-hari") yang dapat jatah persen (0..1) dari
// total pemasukan bulan itu. fixed_expenses & variable_expenses bisa di-assign
// ke satu envelope lewat kolom envelope_id.
export type BudgetEnvelope = {
  id: string;
  name: string;
  percentage: number; // pecahan 0..1, bukan 0..100
  sort_order: number;
};

export type Transaction = {
  id: string;
  date: string;
  kind: "Jajan" | "Nongkrong";
  name: string;
  qty: number;
  price: number;
};

export type Profile = {
  user_id: string;
  campus: string | null;
  is_plus: boolean;
};

export type SubscriptionDebt = {
  id: string;
  type: "Langganan" | "Hutang";
  name: string;
  due_day: number | null;
  amount: number;
  status: string;
};
