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
};

export type VariableExpense = {
  id: string;
  category: string;
  plan_amount: number;
  is_auto: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  kind: "Jajan" | "Nongkrong";
  name: string;
  qty: number;
  price: number;
};

export type SubscriptionDebt = {
  id: string;
  type: "Langganan" | "Hutang";
  name: string;
  due_day: number | null;
  amount: number;
  status: string;
};
