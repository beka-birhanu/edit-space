import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export type Comparable = number | string | Date;

export type Comparator<T> = (a: T, b: T) => -1 | 0 | 1;

export class BisectError extends Error {}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function compareArrays(arr1: Comparable[], arr2: Comparable[]): -1 | 0 | 1 {
  for (let i = 0; i < Math.min(arr1.length, arr2.length); i++) {
    if (arr1[i] < arr2[i]) return -1;
    if (arr1[i] > arr2[i]) return 1;
  }

  if (arr1.length < arr2.length) return -1;
  if (arr1.length > arr2.length) return 1;

  return 0;
}

export function bisect_left<C>(
    arr: C[],
    target: C,
    cmp: Comparator<C>,
    lo: number = 0,
    hi: number = arr.length
): number {
  if (lo < 0)
    throw new BisectError(`low parameter must be >= 0, received ${lo}`);

  let lowIx = lo;
  let highIx = hi;
  let midIx;

  while (lowIx < highIx) {
    midIx = lowIx + ((highIx - lowIx) >>> 1);
    const mKey = arr[midIx];
    if (cmp(mKey, target) < 0) {
      lowIx = midIx + 1;
    } else {
      highIx = midIx;
    }
  }
  return lowIx;
}

export function bisect_right<C>(
    arr: C[],
    target: C,
    cmp: Comparator<C>,
    lo: number = 0,
    hi: number = arr.length
): number {
  if (lo < 0)
    throw new BisectError(`low parameter must be >= 0, received ${lo}`);

  let lowIx = lo;
  let highIx = hi;
  let midIx;

  while (lowIx < highIx) {
    midIx = lowIx + ((highIx - lowIx) >>> 1);
    const mKey = arr[midIx];
    if (cmp(mKey, target) < 0) {
      highIx = midIx;
    } else {
      lowIx = midIx + 1;
    }
  }

  return lowIx;
}

export function insort_left<C>(
    arr: C[],
    target: C,
    cmp: Comparator<C>,
    lo: number = 0,
    hi: number = arr.length
): void {
  const ix = bisect_left(arr, target, cmp, lo, hi);
  arr.splice(ix, 0, target);
}

export function insort_right<C>(
    arr: C[],
    target: C,
    cmp: Comparator<C>,
    lo: number = 0,
    hi: number = arr.length
): void {
  const ix = bisect_right(arr, target, cmp, lo, hi);
  arr.splice(ix, 0, target);
}

enum Color {
  DARK_RED = "#820933",
  VIOLET = "#D84797",
  SKY_BLUE = "#3ABEFF",
  CYAN = "#26FFE6",
  PINK = "#F374AE",
  DARK_GREEN = "#32533D",
  SLATE = "#D8CFAF",
  SLATE_GREEN = "#B8B42D",
  AVOCADO = "#697A21",
  RED = "#DD403A",
  JET_DARK = "#3E363F",
}

export function randomColor(): Color {
  const colors = Object.values(Color);
  let n = colors.length;

  return colors[Math.floor(Math.random() * n)];
}

