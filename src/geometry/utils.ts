import { Constants } from './constants';

const { abs, floor, log, random, sqrt } = Math;

export function randInt(min: number, max: number): number {
	return floor(min + random() * (max - min) + .5);
}

/** Returns a random number from the normal distribution */
export function randNorm(mean = 0, sigma = 1): number {
	const sgn = (random() < .5) ? -1 : 1;
	return mean + sgn * sigma * sqrt(-2 * log(random()));
}

export const toRadian = (value: number): number => Constants.D2R * value;

export const roundEps = (value: number): number => (abs(value) > Constants.EPS) ? value : 0;

export const uniqueValueFilter = (v: number, i: number, arr: number[]): boolean => arr.indexOf(v) === i;
