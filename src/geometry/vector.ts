import { roundEps } from './utils';
import { Matrix4 } from './matrix';

const { cos, random, sin, sqrt } = Math;

export class Vector {

	constructor(public x: number = 0, public y: number = 0, public z = 0, public w = 1) { }

	static random(): Vector {
		return new Vector(
			2 * random() - 1,
			2 * random() - 1,
			2 * random() - 1
		);
	}

	public clone(): Vector {
		return new Vector(this.x, this.y, this.z);
	}

	public set(x: number, y: number, z: number): Vector {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	public add(v: Vector): Vector {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}

	public sub(v: Vector): Vector {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}

	public scale(value: number): Vector {
		this.x *= value;
		this.y *= value;
		this.z *= value;
		return this;
	}

	public null(): Vector {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		return this;
	}

	public magSq(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	public mag(): number {
		return sqrt(this.magSq());
	}

	public distSq(v: Vector): number {
		const dx = this.x - v.x;
		const dy = this.y - v.y;
		const dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	}

	public dist(v: Vector): number {
		return sqrt(this.distSq(v));
	}

	public normalize(): Vector {
		const m = this.mag();
		this.x /= m;
		this.y /= m;
		this.z /= m;
		return this;
	}

	public dot(v: Vector): number {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	public cross(v: Vector, out?: Vector): Vector {
		if (!out) {
			return new Vector(
				this.y * v.z - this.z * v.y,
				this.z * v.x - this.x * v.z,
				this.x * v.y - this.y * v.x
			);
		}
		out.x = this.y * v.z - this.z * v.y;
		out.y = this.z * v.x - this.x * v.z;
		out.z = this.x * v.y - this.y * v.x;
		return out;
	}

	public translate(tx: number, ty: number, tz: number): Vector {
		this.x += tx;
		this.y += ty;
		this.z += tz;
		return this;
	}

	public rotateX(angle: number): Vector {
		const c = cos(angle);
		const s = sin(angle);
		const y = c * this.y - s * this.z;
		this.z = s * this.y + c * this.z;
		this.y = y;
		return this;
	}

	public rotateZ(angle: number): Vector {
		const c = cos(angle);
		const s = sin(angle);
		const x = c * this.x - s * this.y;
		this.y = s * this.x + c * this.y;
		this.x = x; 
		return this;
	}

	public applyTransform(T: Matrix4, out?: Vector): Vector {
		const [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33] = T.data;
		const x = this.x * m00 + this.y * m01 + this.z * m02 + this.w * m03;
		const y = this.x * m10 + this.y * m11 + this.z * m12 + this.w * m13;
		const z = this.x * m20 + this.y * m21 + this.z * m22 + this.w * m23;
		const w = this.x * m30 + this.y * m31 + this.z * m32 + this.w * m33;
		if (!out) {
			return new Vector(x, y, z, w);
		}
		out.x = x;
		out.y = y;
		out.z = z;
		out.w = w;
		return out;
	}

	public applyEps(): Vector {
		this.x = roundEps(this.x);
		this.y = roundEps(this.y);
		this.z = roundEps(this.z);
		return this;
	}

	public blend(v: Vector, w: number): Vector {
		return new Vector(
			(1 - w) * this.x + w * v.x,
			(1 - w) * this.y + w * v.y,
			(1 - w) * this.z + w * v.z
		);
	}
}

export const createNullVector = () => new Vector(0, 0, 0);
