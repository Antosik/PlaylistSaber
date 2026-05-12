const SS_CURVE: Array<{ at: number; value: number }> = [
	{ at: 0, value: 0 },
	{ at: 0.6, value: 0.18223233667439062 },
	{ at: 0.65, value: 0.5866010012767576 },
	{ at: 0.7, value: 0.6125565959114954 },
	{ at: 0.75, value: 0.6451808210101443 },
	{ at: 0.8, value: 0.6872268862950283 },
	{ at: 0.825, value: 0.7150465663454271 },
	{ at: 0.85, value: 0.7462290664143185 },
	{ at: 0.875, value: 0.7816934560296046 },
	{ at: 0.9, value: 0.825756123560842 },
	{ at: 0.91, value: 0.8488375988124467 },
	{ at: 0.92, value: 0.8728710341448851 },
	{ at: 0.93, value: 0.9039994071865736 },
	{ at: 0.94, value: 0.9417362980580238 },
	{ at: 0.95, value: 1 },
	{ at: 0.955, value: 1.0388633331418984 },
	{ at: 0.96, value: 1.0871883573850478 },
	{ at: 0.965, value: 1.1552120359501035 },
	{ at: 0.97, value: 1.2485807759957321 },
	{ at: 0.9725, value: 1.3090333065057616 },
	{ at: 0.975, value: 1.3807102743105126 },
	{ at: 0.9775, value: 1.4664726399289512 },
	{ at: 0.98, value: 1.5702410055532239 },
	{ at: 0.9825, value: 1.697536248647543 },
	{ at: 0.985, value: 1.8563887693647105 },
	{ at: 0.9875, value: 2.058947159052738 },
	{ at: 0.99, value: 2.324506282149922 },
	{ at: 0.99125, value: 2.4902905794106913 },
	{ at: 0.9925, value: 2.685667856592722 },
	{ at: 0.99375, value: 2.9190155639254955 },
	{ at: 0.995, value: 3.2022017597337955 },
	{ at: 0.99625, value: 3.5526145337555373 },
	{ at: 0.9975, value: 3.996793606763322 },
	{ at: 0.99825, value: 4.325027383589547 },
	{ at: 0.999, value: 4.715470646416203 },
	{ at: 0.9995, value: 5.019543595874787 },
	{ at: 1, value: 5.367394282890631 },
];

const BL_CURVE: Array<{ at: number; value: number }> = [
	{ at: 0, value: 0 },
	{ at: 45, value: 0.015 },
	{ at: 50, value: 0.03 },
	{ at: 55, value: 0.06 },
	{ at: 60, value: 0.105 },
	{ at: 65, value: 0.16 },
	{ at: 68, value: 0.24 },
	{ at: 70, value: 0.285 },
	{ at: 80, value: 0.563 },
	{ at: 84, value: 0.695 },
	{ at: 88, value: 0.826 },
	{ at: 94.5, value: 1.015 },
	{ at: 95, value: 1.046 },
	{ at: 100, value: 1.12 },
	{ at: 110, value: 1.18 },
	{ at: 114, value: 1.25 },
];

function interpolate(curve: Array<{ at: number; value: number }>, x: number): number {
	const first = curve[0];
	const last = curve[curve.length - 1];

	if (x <= first.at) return first.value;
	if (x >= last.at) return last.value;

	let lo = 0;
	let hi = curve.length - 1;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (curve[mid].at <= x) lo = mid;
		else hi = mid;
	}

	const t = (x - curve[lo].at) / (curve[hi].at - curve[lo].at);
	return curve[lo].value + t * (curve[hi].value - curve[lo].value);
}

/** ScoreSaber pp multiplier. accuracy: decimal 0–1. rawPP = map.pp × result */
export function applySsCurve(accuracy: number): number {
	return interpolate(SS_CURVE, accuracy);
}

/** BeatLeader pp multiplier. accuracyPct: percentage 0–114. rawPP = stars × 42.114296 × result */
export function applyBlCurve(accuracyPct: number): number {
	return interpolate(BL_CURVE, accuracyPct);
}
