import { ValidateBy } from 'class-validator';
import { toLocalDateString } from './timezone.util';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const toDbDate = (date: string) => new Date(`${date}T00:00:00Z`);

export const fromDbDate = (date: Date) => date.toISOString().slice(0, 10);

export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false;
  const date = toDbDate(value);
  return !Number.isNaN(date.getTime()) && fromDbDate(date) === value;
}

export const IsPastDate = () =>
  ValidateBy({
    name: 'isPastDate',
    validator: {
      validate: (value) =>
        isDateOnly(value) &&
        value >= '1900-01-01' &&
        value <= toLocalDateString(new Date()),
      defaultMessage: (args) =>
        `${args?.property} must be a YYYY-MM-DD date, not in the future`,
    },
  });
