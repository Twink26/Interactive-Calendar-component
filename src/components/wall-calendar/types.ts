export type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
};

export type Holiday = {
  month: number;
  day: number;
  label: string;
  color?: string;
};