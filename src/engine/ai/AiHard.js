import ArtificialIntelligence from './ArtificialIntelligence'

export default class AiHard extends ArtificialIntelligence {
	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 * @override
	 */
	playKingdom(arbiter, kingdom) {
		this.moveUnits(arbiter, kingdom)
		this.spendMoneyAndMergeUnits(arbiter, kingdom)
	}
}
