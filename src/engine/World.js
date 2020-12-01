import HexUtils from './HexUtils'

/**
 * @typedef {import('./Hex.js').default} Hex
 * @typedef {import('./Kingdom.js').default} Kingdom
 * @typedef {import('./Capital').default} Capital
 * @typedef {import('./Grave').default} Grave
 * @typedef {import('./Tower').default} Tower
 * @typedef {import('./Tree').default} Tree
 * @typedef {import('./Unit').default} Unit
 * @typedef {Capital|Grave|Tower|Tree|Unit} Entity
 */
export default class World {
	/**
	 * @param {Hex[]} hexs
	 * @param {Object} config Config from WorldConfig
	 */
	constructor(hexs, config) {
		/** @type {Hex[]} */
		this.hexs = hexs
		this.config = config

		/** @type {Kingdom[]} */
		this.kingdoms = []
		/** @type {Number} */
		this.turn = 0

		this._hexMap = new Map()
		this.hexs.forEach((hex) => this._hexMap.set(HexUtils.getID(hex), hex))
	}

	/**
	 * @param {Hex} hex Could be coords or normal hex
	 *
	 * @returns {Hex}
	 */
	getHexAt(hex) {
		return this._hexMap.get(HexUtils.getID(hex))
	}

	/**
	 * For testing purpose
	 *
	 * @param {Hex} hex Could be coords or normal hex
	 *
	 * @returns {Entity}
	 */
	getEntityAt(hex) {
		return this.getHexAt(hex).entity
	}

	/**
	 * Add turn by 1
	 */
	increaseTurn() {
		this.turn += 1
	}

	/**
	 * @param {Kingdom} kingdom
	 */
	addKingdom(kingdom) {
		this.kingdoms.push(kingdom)
	}

	/**
	 * @param {Kingdom} kingdom
	 */
	removeKingdom(kingdom) {
		this.kingdoms = this.kingdoms.filter((k) => k !== kingdom)
	}

	/**
	 * @param {Hex} hex Could be coords or normal hex
	 * @param {Entity} entity
	 */
	setEntityAt(hex, entity) {
		this.getHexAt(hex).setEntity(entity)
	}

	/**
	 * @param {Hex} hex Could be coords or normal hex
	 *
	 * @returns {Unit}
	 */
	removeUnitAt(hex) {
		const worldHex = this.getHexAt(hex)
		const { entity } = worldHex

		if (!worldHex.hasUnit())
			throw new Error('Attempting to remove unit but the hex has no unit')

		worldHex.setEntity(null)

		return entity
	}

	/**
	 * For testing purpose.
	 *
	 * @param {Hex} hex Could be coords or normal hex
	 *
	 * @returns {Kingdom}
	 */
	getKingdomAt(originHex) {
		const hex = this.getHexAt(originHex)
		return hex.kingdom
	}
}
