/**
 * @typedef {import('./Hex').default} Hex
 * @typedef {import('./Player').default} Player
 */
export default class Kingdom {
	/**
	 * @param {Hex[]} hexs
	 */
	constructor(hexs) {
		/**
		 * The kingdom always keep tracks of its land
		 *
		 * @type {Hex[]}
		 */
		this.hexs = hexs

		/** @type {Player} */
		this.player = this.hexs[0].player

		/** @type {Number} */
		this.gold = 0
	}

	/**
	 * @param {Number} gold
	 */
	setGold(gold) {
		this.gold = Math.ceil(gold)
	}

	/**
	 * @param {Hex} originHex
	 */
	removeHex(originHex) {
		this.hexs = this.hexs.filter((hex) => hex !== originHex)
	}

	/**
	 * @param {Hex} hex
	 */
	addHex(hex) {
		this.hexs.push(hex)
	}

	/**
	 * @returns {Boolean}
	 */
	hasCapital() {
		return this.hexs.some((hex) => hex.hasCapital())
	}

	/**
	 * Get kingdom's income (not filled with tree or grave hexs)
	 *
	 * @returns {Number}
	 */
	getIncome() {
		return this.hexs
			.filter((hex) => !hex.hasTree())
			.filter((hex) => !hex.hasGrave()).length
	}

	/**
	 * Get kingdom's outcome
	 *
	 * @returns {Number}
	 */
	getOutcome() {
		return this.hexs
			.filter((hex) => hex.hasUnit())
			.reduce((p, c) => p + c.entity.getUnitMaintenanceCost(), 0)
	}

	/**
	 * Get kingdom's income and outcome difference
	 *
	 * @returns {Number}
	 */
	getDifference() {
		return this.getIncome() - this.getOutcome()
	}
}
