import HexUtils from './HexUtils'
import Player from './Player'

/**
 * @typedef {Number} Color
 * @typedef {import('../engine/Arbiter').default} Arbiter
 * @typedef {import('../engine/Kingdom').default} Kingdom
 */
export default class AIPlayer extends Player {
	/**
	 * @param {Color} color
	 */
	constructor(color = null) {
		super(color)
	}

	/**
	 * @param {Arbiter} arbiter
	 */
	notifyTurn(arbiter) {
		try {
			arbiter.world.kingdoms
				.filter((kingdom) => kingdom.player === this)
				.forEach((kingdom) => {
					this.playKingdom(arbiter, kingdom)
				})
		} catch (err) {
			// If AI try to do an illegal move, just catch it and pass turn
			// eslint-disable-next-line no-console
			console.warn('AI Illegal move', err)
		}
		arbiter.endTurn()
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	playKingdom(arbiter, kingdom) {
		const hexsProtections = { 0: [], 1: [], 2: [], 3: [], 4: [] }
		const neighbourHexs = HexUtils.getHexsAdjacentToKingdom(
			arbiter.world,
			kingdom,
		)

		// Getting the protecting neighbour hexs
		neighbourHexs.forEach((hex) => {
			const protectingUnits = HexUtils.getProtectingUnits(arbiter.world, hex)
			const maxLevel = protectingUnits.length > 0 ? protectingUnits[0].level : 0
			hexsProtections[maxLevel].push(hex)
		})

		// Buy units
		kingdom.hexs
			.filter((hex) => hex.entity === null)
			.some((hex) => {
				if (kingdom.gold < 10) return true
				arbiter.buyUnitTowardsHex(hex, hex.kingdom)
				return false
			})

		// Capture neighbour hexs
		const movableHexUnits = kingdom.hexs.filter(
			(hex) => hex.hasUnit() && hex.entity.played === false,
		)
		movableHexUnits.some((hex) => {
			const unprotectedHex = hexsProtections[0].shift()
			if (unprotectedHex === undefined) return true
			arbiter.moveUnit(hex, unprotectedHex)
			return false
		})
	}
}
