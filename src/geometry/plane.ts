import { roundEps } from './utils';
import { Vector } from './vector';

export class Plane {
	
	constructor(readonly n: Vector, readonly d: number) { }

	/** Returns a plane defined by three vertices */
	static create(p0: Vector, p1: Vector, p2: Vector): Plane {
		const n = p1.clone().sub(p0).cross(p2.clone().sub(p0)).normalize().applyEps();
		const d = -n.dot(p0);
		return new Plane(n, d);
	}

	/** Returns the distance from the given point to this plane */
	public distance(p: Vector): number {
		return roundEps(this.n.dot(p) + this.d);
	}

	/** Returns true if the given point is inside the plane */
	public isPointInside(p: Vector): boolean {
		return Math.sign(this.distance(p)) <= 0;
	}
}
