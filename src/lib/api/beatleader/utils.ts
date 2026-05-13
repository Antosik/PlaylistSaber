// BL: rawPP = stars × PP_PER_STAR × applyBlCurve(95) ≈ the pp at 95% accuracy
export const PP_PER_STAR = 42.114296;

/** Base PP from star rating for BeatSaver-ranked diffs on the BeatLeader leaderboard. */
export function basePpFromStars(stars: number): number {
	return stars * PP_PER_STAR;
}
