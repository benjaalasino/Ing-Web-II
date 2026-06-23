export const toYearMonthKey = (value: string | Date): string => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export interface MonthYear {
  month: number;
  year: number;
}

export const getMonthYear = (value: string | Date = new Date()): MonthYear => {
  const date = new Date(value);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};
