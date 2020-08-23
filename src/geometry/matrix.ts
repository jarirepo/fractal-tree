const { cos, sin } = Math;

export class Matrix {

	readonly data: number[];

	constructor(readonly rows: number, readonly cols: number) {
		this.data = [];
		for (let i = 0; i < rows * cols; i++) {
			this.data.push(0);
		}
		this.init();
	}

	public null(): Matrix {
		if (this.data) {
			for (let i = 0; i < this.data.length; i++) {
				this.data[i] = 0;
			}
		}
		return this;
	}

	public mult(m: Matrix): Matrix | null {
		if (this.cols !== m.rows) {
			console.error('Incompatible matrices for multiplication');
			return null;
		}

		const result = new Matrix(this.rows, m.cols).null();

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < m.cols; j++) {
				for (let k = 0; k < this.cols; k++) {
					result.data[j + i * result.cols] += this.data[k + i * this.cols] * m.data[j + k * m.cols];
				}
			}
		}
		return result;
	}

	private init(): void {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[j + i * this.cols] = (this.cols === this.rows && i === j) ? 1 : 0;
			}
		}
		// console.log('New matrix:', this);
	}
}

export class Matrix4 extends Matrix {

	constructor() {
		super(4, 4);
	}

	static forRotationX(angle: number): Matrix {
		const c = cos(angle);
		const s = sin(angle);
		const m = new Matrix4();
		m.data[5] = c;
		m.data[6] = -s;
		m.data[9] = s;
		m.data[10] = c;
		return m;
	}

	static forRotationY(angle: number): Matrix4 {
		const c = cos(angle);
		const s = sin(angle);
		const m = new Matrix4();
		m.data[0] = c;
		m.data[2] = s;
		m.data[8] = -s;
		m.data[10] = c;
		return m;
	}

	static forRotationZ(angle: number): Matrix4 {
		const c = cos(angle);
		const s = sin(angle);
		const m = new Matrix4();
		m.data[0] = c;
		m.data[1] = -s;
		m.data[4] = s;
		m.data[5] = c;
		return m;
	}

	static forTranslation(tx?: number, ty?: number, tz?: number): Matrix4 {
		const m = new Matrix4();
		m.data[12] = tx || 0;
		m.data[13] = ty || 0;
		m.data[14] = tz || 0;
		// m.data[3] = tx || 0;
		// m.data[7] = ty || 0;
		// m.data[11] = tz || 0;
		return m;
	}
}
