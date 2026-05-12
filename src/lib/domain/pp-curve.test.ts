import { describe, it, expect } from 'vitest';
import { applySsCurve, applyBlCurve } from '$lib/domain/pp-curve';

// #region ScoreSaber curve

describe('applySsCurve (ScoreSaber)', () => {
	it('returns 0 at 0% accuracy', () => {
		expect(applySsCurve(0)).toBe(0);
	});

	it('returns ~0.182 at 60% accuracy (curve anchor)', () => {
		expect(applySsCurve(0.6)).toBeCloseTo(0.18223233667439062, 6);
	});

	it('returns 1.0 at 95% accuracy (reference point)', () => {
		expect(applySsCurve(0.95)).toBe(1);
	});

	it('returns a value above 1 for accuracy above 95%', () => {
		expect(applySsCurve(0.97)).toBeGreaterThan(1);
	});

	it('returns ~5.367 at 100% accuracy (maximum)', () => {
		expect(applySsCurve(1.0)).toBeCloseTo(5.367394282890631, 4);
	});

	it('is monotonically increasing', () => {
		const pts = [0, 0.6, 0.75, 0.85, 0.90, 0.95, 0.97, 0.99, 1.0];
		for (let i = 1; i < pts.length; i++) {
			expect(applySsCurve(pts[i])).toBeGreaterThan(applySsCurve(pts[i - 1]));
		}
	});

	it('interpolates between defined points', () => {
		// 0.925 lies between 0.92 (0.8728) and 0.93 (0.9039)
		const v = applySsCurve(0.925);
		expect(v).toBeGreaterThan(0.8728710341448851);
		expect(v).toBeLessThan(0.9039994071865736);
	});

	it('clamps input below 0 to 0', () => {
		expect(applySsCurve(-0.1)).toBe(0);
	});

	it('clamps input above 1 to the 100% value', () => {
		expect(applySsCurve(1.5)).toBeCloseTo(applySsCurve(1.0), 6);
	});
});

// #endregion ScoreSaber curve

// #region BeatLeader curve

describe('applyBlCurve (BeatLeader)', () => {
	it('returns 0 at 0% accuracy', () => {
		expect(applyBlCurve(0)).toBe(0);
	});

	it('returns ~0.285 at 70% accuracy (curve anchor)', () => {
		expect(applyBlCurve(70)).toBeCloseTo(0.285, 6);
	});

	it('returns ~1.046 at 95% accuracy (reference point)', () => {
		expect(applyBlCurve(95)).toBeCloseTo(1.046, 6);
	});

	it('returns ~1.12 at 100% accuracy', () => {
		expect(applyBlCurve(100)).toBeCloseTo(1.12, 6);
	});

	it('returns ~1.25 at 114% accuracy (modifier cap)', () => {
		expect(applyBlCurve(114)).toBeCloseTo(1.25, 6);
	});

	it('is monotonically increasing', () => {
		const pts = [0, 45, 60, 70, 80, 88, 95, 100, 110, 114];
		for (let i = 1; i < pts.length; i++) {
			expect(applyBlCurve(pts[i])).toBeGreaterThan(applyBlCurve(pts[i - 1]));
		}
	});

	it('interpolates between defined points', () => {
		// 75 lies between 70 (0.285) and 80 (0.563)
		const v = applyBlCurve(75);
		expect(v).toBeGreaterThan(0.285);
		expect(v).toBeLessThan(0.563);
	});

	it('accepts accuracy above 100 (modifiers)', () => {
		// Super Fast Song (SF) gives +5% score, so accuracy can reach ~105
		expect(applyBlCurve(105)).toBeGreaterThan(applyBlCurve(100));
	});

	it('clamps input below 0 to 0', () => {
		expect(applyBlCurve(-5)).toBe(0);
	});

	it('clamps input above 114 to the 114% value', () => {
		expect(applyBlCurve(120)).toBeCloseTo(applyBlCurve(114), 6);
	});
});
// #endregion BeatLeader curve

// #region Raw PP calculation helpers
describe('rawPP formula verification', () => {
	it('ScoreSaber: rawPP = map.pp × applySsCurve(accuracy)', () => {
		// A 300pp map at 95% accuracy = 300 × 1.0 = 300pp
		const mapPP = 300;
		const rawPP = mapPP * applySsCurve(0.95);
		expect(rawPP).toBeCloseTo(300, 1);
	});

	it('BeatLeader: rawPP = stars × 42.114296 × applyBlCurve(accuracyPct)', () => {
		// A 6-star map at 95% accuracy
		const PP_PER_STAR = 42.114296;
		const stars = 6;
		const rawPP = stars * PP_PER_STAR * applyBlCurve(95);
		// 6 × 42.114296 × 1.046 ≈ 264.5
		expect(rawPP).toBeCloseTo(264.5, 0);
	});
});
// #endregion Raw PP calculation helpers
