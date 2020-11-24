import AIPlayer from './AIPlayer'
import HumanPlayer from './HumanPlayer'

/**
 * @typedef {import('./HumanPlayer').default} HumanPlayer
 * @typedef {import('./AIPlayer').default} AIPlayer
 */

const defaults = {
	/**
	 * Random number generator, must returns between 0 and 1.
	 */
	random: Math.random,

	/**
	 * Size of the island.
	 * 10 is small, 14 is medium, 18 is big.
	 *
	 * @type {Number}
	 */
	size: 14,

	/**
	 * Players
	 *
	 * @type {(HumanPlayer|AIPlayer)[]}
	 */
	players: [new HumanPlayer(), new AIPlayer(), new AIPlayer(), new AIPlayer()],

	/**
	 * Probability of spawning initial trees over each empty hexs
	 *
	 * @type {Number} floating point
	 */
	treesInitialSpawnProbability: 1 / 16,

	/**
	 * Max probability of spawning coastal tree around a coastal tree
	 */
	coastalTreesGrowMaxProbability: 1.0,

	/**
	 * Max probability of spawning coastal tree around a coastal tree
	 */
	continentalTreesGrowMaxProbability: 0.25,

	/**
	 * 100% means 63% at first turn,
	 * and about 5 turns to reach max proba.
	 *
	 * MAX PROBA: the probability that
	 * a tree grow on an adjacent empty hex.
	 * It starts from zero
	 * and is reached more and more while the game last.
	 *
	 * This proba is divided by the numbers of players
	 * to limit trees over growing during others players turn.
	 */
	treesGrowOverTime: 0.1,
}

export default defaults
