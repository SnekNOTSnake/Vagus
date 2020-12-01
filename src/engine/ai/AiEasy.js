import ArtificialIntelligence from './ArtificialIntelligence'
import { generateSimpleMoveZone } from '../../utils/helpers'
import { UNIT_MAX_LEVEL, UNIT_PRICE } from '../../constants/variables'
import Arbiter from '../Arbiter'

/**
 * @typedef {import('../Arbiter').default} Arbiter
 * @typedef {import('../Kingdom').default} Kingdom
 * @typedef {import('../Hex').default} Hex
 */

export default class AiEasy extends ArtificialIntelligence {
	/**
	 * @override
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	playKingdom(arbiter, kingdom) {
		// Move first only then merge units for easy AI
		this.moveUnits(arbiter, kingdom)
		this.spendMoneyAndMergeUnits(arbiter, kingdom)
	}

	/**
	 * 50% of normal move, 50% of random move
	 *
	 * @override
	 * @param {Arbiter} arbiter
	 * @param {Hex} hex
	 */
	decideAboutUnit(arbiter, hex) {
		if (Math.random() < 0.5) {
			super.decideAboutUnit(arbiter, hex)
			return
		}

		if (this.cleanCoastalTrees(arbiter, hex)) return
		if (this.cleanContinentalTrees(arbiter, hex)) return

		const moveZone = generateSimpleMoveZone(
			arbiter.world,
			hex.kingdom,
			hex.entity.level,
		).filter((moveHex) => moveHex !== hex)
		const target = moveZone[Math.floor(Math.random() * moveZone.length)]
		if (!target) return

		arbiter.moveUnit(hex, target)
	}

	/**
	 * @override
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	tryToBuildUnits(arbiter, kingdom) {
		// Only build units inside kingdom and do nothing about them
		for (let level = 1; level <= UNIT_MAX_LEVEL; level += 1) {
			while (
				kingdom.gold >= UNIT_PRICE * level &&
				this.canAiAffordBuildUnit(kingdom, level)
			) {
				if (!this.tryToBuildUnitInsideKingdom(arbiter, kingdom, level)) break
			}
		}

		// Kick start a kingdom, when all of the kingdom hexs are covered in trees.
		// The income would only be 1, while one peasant costs 2 maintenance golds.
		const hexsThatHasUnit = kingdom.hexs.filter((hex) => hex.hasUnit())
		if (hexsThatHasUnit.length <= 1 && kingdom.gold >= UNIT_PRICE)
			this.tryToAttackWithBoughtUnit(arbiter, kingdom, 1)
	}

	/**
	 * Easy AI doesn't build towers
	 *
	 * @override
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	// eslint-disable-next-line no-unused-vars
	tryToBuildTowers(arbiter, kingdom) {}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 * @override
	 */
	mergeUnits(arbiter, kingdom) {
		if (Math.random() < 0.25) super.mergeUnits(arbiter, kingdom)
	}

	/**
	 * @override
	 * @param {Hex} hexFrom
	 * @param {Hex} hexTarget
	 *
	 * @returns {Boolean}
	 */
	mergableCondition(hexFrom, hexTarget) {
		return (
			super.mergableCondition(hexFrom, hexTarget) &&
			hexFrom.entity.level === 1 &&
			hexTarget.entity.level === 1
		)
	}
}
