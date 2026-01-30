import { supabase, Expense } from './supabase';

export interface CreateExpenseInput {
  amount: number;
  category: string;
  description?: string;
  date: string;
  idempotencyKey: string;
}

export interface ListExpensesParams {
  category?: string;
  sort?: 'date_desc' | 'date_asc';
}

export interface ListExpensesResponse {
  items: Expense[];
  total: string;
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data: existing, error: checkError } = await supabase
    .from('expenses')
    .select('*')
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Failed to check existing expense: ${checkError.message}`);
  }

  if (existing) {
    return existing as Expense;
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      amount: input.amount,
      category: input.category,
      description: input.description || null,
      date: input.date,
      idempotency_key: input.idempotencyKey,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create expense: ${error.message}`);
  }

  return data as Expense;
}

export async function listExpenses(params: ListExpensesParams = {}): Promise<ListExpensesResponse> {
  let query = supabase.from('expenses').select('*');

  if (params.category) {
    query = query.eq('category', params.category);
  }

  const sortOrder = params.sort === 'date_asc' ? true : false;
  query = query.order('date', { ascending: sortOrder });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list expenses: ${error.message}`);
  }

  const items = (data || []) as Expense[];
  const total = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  return {
    items,
    total: total.toFixed(2),
  };
}
