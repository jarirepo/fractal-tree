import Stats from 'stats.js';
import { saveAs, FileSaverOptions } from 'file-saver';

import { FractalTree, TreeNode } from './fractal-tree';
import { Vector } from './geometry/vector';
import { Matrix4 } from './geometry/matrix';
import { toRadian } from './geometry/utils';
import { Plane } from './geometry/plane';
import { Constants } from './geometry/constants';

const stats = new Stats();
stats.showPanel( 0 ); // fps
stats.dom.style.position = 'relative';
document.querySelector('#stats').appendChild(stats.dom);

const canvas = document.querySelector<HTMLCanvasElement>('canvas#scene');
const context = canvas.getContext('2d');
context.globalAlpha = 1;
context.fillStyle = '#111';
context.fillRect(0, 0, canvas.width, canvas.height);

const scale = 120;
const transform: DOMMatrix2DInit = {
	m11: scale,
	m12: 0,
	m21: 0,
	m22: -scale,
	m41: canvas.width / 2,
	m42: canvas.height / 2 + 250
};

// Create isometric view matrix
// const proj = new Matrix4();
const Rx = Matrix4.forRotationX(toRadian(35.26 - 100));
const Rz = Matrix4.forRotationZ(toRadian(45));
let view = Rx.mult(Rz);

const viewRotation = Matrix4.forRotationZ(.01);

const fractalTree = new FractalTree(
	new TreeNode(null, new Vector(0, 0, 0), new Vector(0, 0, 1).normalize().scale(1)), {
		N: 1000,
		rmin: Math.pow(.2, 2),
		rmax: Math.pow(.4, 2),
		envelope: [
			new Plane(new Vector(-1, 0, .4).normalize(), -2),
			new Plane(new Vector(1, 0, .4).normalize(), -2),
			new Plane(new Vector(0, -1, .4).normalize(), -2),
			new Plane(new Vector(0, 1, .4).normalize(), -2),
			new Plane(new Vector(0, 0, 1).normalize(), -5),
			new Plane(new Vector(0, 0, -1).normalize(), 1.5)
		]
	}
);
console.log(fractalTree);

/** Keyboard handler */
document.body.onkeyup = (e: KeyboardEvent) => {
	switch (e.key) {
		case 's':
		case 'S':
			if (e.shiftKey && canvas.toBlob) {
				canvas.toBlob(blob => {
					// saveAs(blob, `fractal-tree.png`);
					const file = new File([blob], `fractal-tree.png`, { type: 'image/png' })
					saveAs(file);
				});
			}
			break;
	}
};

/** Main loop */
function animate(time = 0): void {
	stats.begin();

	context.fillStyle = '#111';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.save();
	context.setTransform(transform);

	context.lineWidth = 1 / scale;

	// Fractal tree - attraction points
	const Pview = fractalTree.attractors.map(v => v.pos.applyTransform(view));
	let zmin = 1e9, zmax = -1e9;
	for (const p of Pview) {
		if (p.z < zmin) {
			zmin = p.z;
		} else if (p.z > zmax) {
			zmax = p.z;
		}
	}

	Pview.forEach(p => {
		context.beginPath();
		context.arc(p.x, p.y, 2 / scale, 0, Constants.TWO_PI);
		context.fillStyle = '#666';
		context.fill();	
	});

	// Fractal tree - nodes/branches
	for (let k = 1; k < fractalTree.nodes.length; k++) {
		const p0 = fractalTree.nodes[k].parent.pos.applyTransform(view);
		const p1 = fractalTree.nodes[k].pos.applyTransform(view);
		context.beginPath();
		context.moveTo(p0.x, p0.y);
		context.lineTo(p1.x, p1.y);
		const alpha = (.5 * (p0.z + p1.z) - zmin) / (zmax - zmin);
		context.strokeStyle = `rgba(255,200,100,${alpha})`;
		// context.lineWidth = (2 + 10 * (1 - (k - 1) / (fractalTree.nodes.length - 1))) / scale;
		
		const mx = (p1.x + p0.x) / 2;
		const my = (p1.y + p0.y) / 2;
		const mz = (p1.z + p0.z) / 2;
		const d = mx * mx + my * my + mz * mz;

		context.lineWidth = 20 / (1 + d) / scale;

		context.stroke();	
	}
	if (!fractalTree.isCompleted()) {
		fractalTree.grow();
	}

	// Apply view rotation
	view = view.mult(viewRotation);

	context.restore();
	stats.end();
	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
