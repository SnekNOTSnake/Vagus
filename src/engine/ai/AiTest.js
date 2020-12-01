/* eslint-disable max-classes-per-file */
import ArtificialIntelligence from './ArtificialIntelligence'
import AiEasy from './AiEasy'

/**
 * This file is to make testing ArtificialIntelligence files easier
 *
 * @typedef {Number} Color
 * @typedef {import('../Arbiter').default} Arbiter
 */

export class AiTest extends ArtificialIntelligence {
	/**
	 * @override
	 * @param {Arbiter} arbiter
	 */
	notifyTurn(arbiter) {}
}

export class AiEasyTest extends AiEasy {
	/**
	 * @override
	 * @param {Arbiter} arbiter
	 */
	notifyTurn(arbiter) {}
}
