import { Plane } from './geometry/plane';
import { Vector } from './geometry/vector';

interface FractalTreeOptions {
	/** Envelope for the attraction points (tree crown) */
	envelope: Plane[];
	/** Number of randomly generated attraction points */
	N: number;
	/** Minimum squared distance threshold */
	rmin: number;
	/** Maximum squared distance threshold */
	rmax: number;
}

class AttractionPoint {
	reached = false;
	weight = 1;
	constructor(readonly pos: Vector) { }
}

export class TreeNode {

	readonly force: Vector;

	/** Counter for the number of times a branch has been found near a particular attractor point */
	count = 0;
	readonly originalDir: Vector;

	constructor(readonly parent: TreeNode, readonly pos: Vector, readonly dir: Vector) {
		this.force = new Vector();
		this.originalDir = dir.clone();
	}

	public next(): TreeNode {
		return new TreeNode(this, this.pos.clone().add(this.dir), this.dir.clone());
	}

	public applyForce(f: Vector): void {
		this.count++;
		this.force.add(f);
	}

	public reset(): void {
		this.dir.set(this.originalDir.x, this.originalDir.y, this.originalDir.z);
		this.force.set(0, 0, 0);
		this.count = 0;
	}
}

export class FractalTree {

	readonly attractors: AttractionPoint[] = [];
	readonly nodes: TreeNode[];

	constructor(readonly root: TreeNode, readonly options: FractalTreeOptions) {
		this.nodes = [root];
		this.init();
	}

	public isCompleted(): boolean {
		return this.attractors.filter(v => !v.reached).length === 0;
	}

	public grow(): void {
		// Add the contributions from all near attractor points
		this.attractors.filter(attractor => !attractor.reached).forEach(attractor => {
			let rmin = 1e6;
			let closestNode: TreeNode = null;

			for (const node of this.nodes) {
				const r = node.pos.distSq(attractor.pos);
				if (r < this.options.rmin) {
					attractor.reached = true;
					break;
				} else if (!closestNode || r < rmin) {
					rmin = r;
					closestNode = node;
				}
			}

			if (closestNode) {
				// Apply force contribution to the closest tree node
				// const v = attractor.pos.clone().sub(closestNode.pos);
				// const r2 = v.magSq();
				// const f = v.normalize().scale(attractor.weight / (1 + r2));
				const f = attractor.pos.clone().sub(closestNode.pos).normalize().scale(attractor.weight);
				closestNode.applyForce(f);
			}
		});

		// Remove all reached attractors
		for (let k = this.attractors.length - 1; k >= 0; k--) {
			if (this.attractors[k].reached) {
				this.attractors.splice(k, 1);
			}
		}

		// Create a new branch with a new directionn for each affected tree node in the current iteration
		const dt = .005;
		for (let k = this.nodes.length - 1; k >= 0; k--) {
			const node = this.nodes[k];
			if (node.count > 0) {
				node.dir.add(node.force).scale(1 / (1 + node.count));
				// const acc = node.force.scale(1 / 1.0);
				// const vel = acc.scale(dt);
				// node.dir.set(vel.x, vel.y, vel.z);
				const nextNode = node.next();
				nextNode.reset();
				this.nodes.push(nextNode);
			}
			node.reset();
		}
	}

	private init(): void {
		this.generateAttractors();

		// Sort the attractors in ascending z-value
		this.attractors.sort((a, b) => a.pos.z - b.pos.z);

		// Compute the center of all attraction points
		const center = this.attractors
			.map(attractor => attractor.pos)
			.reduce((sum, v) => sum.add(v), new Vector())
			.scale(1 / this.attractors.length);

		const r = this.attractors.map(attractor => attractor.pos.dist(center));
		const rmax = Math.max(...r);

		for (let k = 0; k < this.attractors.length; k++) {
			// this.attractors[k].weight = .1; 
			this.attractors[k].weight = .2 * r[k] / rmax; 
		}

		this.growStem(this.root);
		console.log('Stem grow completed', this.nodes[this.nodes.length - 1]);
	}

	/** "Hit and run" sampling within polytype - much faster than "rejection sampling" **/
	private generateAttractors(): void {
		// Rejection sampling - could be very slow for larger spaces
		// let iter = 0;
		// const scale = 100;
		// while (this.attractors.length < this.options.N || iter > 1e9) {
		// 	const p = Vector.random().scale(scale);
		// 	const insideEnvelope = this.options.envelope
		// 		.map(plane => plane.isPointInside(p))
		// 		.reduce((result, val) => result && val, true);
		// 	if (insideEnvelope) {
		// 		this.attractors.push(new AttractionPoint(p));
		// 	}
		// 	iter++;
		// }

		const MAXITER = 1e6;
		let i = 0;
		const plane0 = this.options.envelope[i];
		let p = plane0.n.clone().scale(-plane0.d);
		let iter = 0;

		while (this.attractors.length < this.options.N || iter > MAXITER) {
			i = (i + 1) % this.options.envelope.length;
			const plane1 = this.options.envelope[i];
			const d = Math.abs(plane1.distance(p)) * Math.random();
			const p1 = p.clone().add(plane1.n.clone().scale(d));
			const inside = this.options.envelope
				.map(plane => plane.isPointInside(p1))
				.reduce((result, val) => result && val, true);
			if (inside) {
				this.attractors.push(new AttractionPoint(p1));
				p = p1;
			}
			iter++;
		}
		console.log('Iterations:', iter);
	}

	/** Initial growing of the tree stem */
	private growStem(node: TreeNode): void {
		const found = this.attractors.filter(v => !v.reached && node.pos.distSq(v.pos) < this.options.rmax).length > 0;
		if (!found) {
			const nextNode = node.next();
			this.nodes.push(nextNode);
			this.growStem(nextNode);
		}
	}
}
