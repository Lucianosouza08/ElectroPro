import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RESISTIVITY = {
  copper: 0.0172, // ohm * mm^2 / m
  aluminum: 0.0282,
};

export const CONVERSION_FACTORS = {
  KW_TO_HP: 1.34102,
  KW_TO_CV: 1.35962,
  HP_TO_KW: 0.7457,
  CV_TO_KW: 0.7355,
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
