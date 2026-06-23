export interface ExpenseRow {
  id: number;
  user_id: number;
  commerce: string;
  date: Date | string;
  amount: string | number;
  category: string;
  description: string | null;
  image_url: string | null;
  created_at: Date;
}

export interface ExpenseDto {
  id: number;
  userId: number;
  commerce: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
}

/** Convierte una fila de la tabla `expenses` al shape que consume el frontend. */
export const mapExpense = (row: ExpenseRow): ExpenseDto => ({
  id: row.id,
  userId: row.user_id,
  commerce: row.commerce,
  date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
  amount: Number(row.amount),
  category: row.category,
  description: row.description || '',
  imageUrl: row.image_url,
  createdAt: row.created_at,
});
