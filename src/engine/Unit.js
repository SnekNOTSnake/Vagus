import Entity from './Entity'

/**
 * @typedef {Number} Level
 */
export default class Unit extends Entity {
	/**
	 * @param {Level} level
	 */
	constructor(level = 1) {
		super()

		/** @type {Level} */
		this.level = level

		/** @type {Boolean} */
		this.played = false
	}

	/**
	 * @param {Boolean} played
	 */
	setPlayed(played) {
		this.played = played
	}

	/**
	 * @param {Level} level
	 */
	setLevel(level) {
		this.level = level
	}

	/**
	 * Calculate a unit's maintenance cost
	 */
	getUnitMaintenanceCost() {
		return 2 * 3 ** (this.level - 1)
	}
}
