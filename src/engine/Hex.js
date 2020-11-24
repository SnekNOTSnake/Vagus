import { Hex as HexBase } from 'react-hexgrid'
import HexUtils from './HexUtils'
import Grave from './Grave'
import Tree from './Tree'
import Unit from './Unit'
import Capital from './Capital'
import Tower from './Tower'

/**
 * @typedef {import('./Player').default} Player
 * @typedef {import('./Kingdom').default} Kingdom
 * @typedef {import('./Capital').default} Capital
 * @typedef {import('./Grave').default} Grave
 * @typedef {import('./Tower').default} Tower
 * @typedef {import('./Tree').default} Tree
 * @typedef {import('./Unit').default} Unit
 * @typedef {Capital|Grave|Tower|Tree|Unit} Entity
 */
export default class Hex extends HexBase {
	/**
	 * @param {Number} q
	 * @param {Number} r
	 * @param {Number} s
	 * @param {Player} player
	 */
	constructor(q, r, s, player = null) {
		super(q, r, s)

		/** @type {Number} */
		this.hash = HexUtils.getID(this)

		/** @type {Player} */
		this.player = player

		/** @type {Kingdom} */
		this.kingdom = null

		/** @type {Entity} */
		this.entity = null
	}

	/**
	 * Transform a baseHex into this project's Hex
	 *
	 * @param {Hex} baseHex
	 *
	 * @returns {Hex}
	 */
	static fromBaseHex(baseHex) {
		return new Hex(baseHex.q, baseHex.r, baseHex.s)
	}

	/**
	 * @param {Player} player
	 */
	setPlayer(player) {
		this.player = player
	}

	/**
	 * @param {Kingdom} kingdom
	 */
	setKingdom(kingdom) {
		this.kingdom = kingdom
	}

	/**
	 *
	 * @param {Entity} entity
	 */
	setEntity(entity) {
		this.entity = entity
	}

	/**
	 * @returns {Boolean}
	 */
	hasTree() {
		return this.entity instanceof Tree
	}

	/**
	 * @returns {Boolean}
	 */
	hasGrave() {
		return this.entity instanceof Grave
	}

	/**
	 * @returns {Boolean}
	 */
	hasUnit() {
		return this.entity instanceof Unit
	}

	/**
	 * @returns {Boolean}
	 */
	hasCapital() {
		return this.entity instanceof Capital
	}

	/**
	 * @returns {Boolean}
	 */
	hasTower() {
		return this.entity instanceof Tower
	}

	/**
	 * @returns {Unit}
	 */
	getUnit() {
		if (!this.hasUnit())
			throw new Error('Attempting to get unit but hex has no unit')
		return this.entity
	}

	/**
	 * For testing purpose.
	 * Return true if `this` hex and the passed hex has the same coords
	 *
	 * @param {Hex} hex
	 */
	isSameAs(hex) {
		return this.q === hex.q && this.r === hex.r && this.r === hex.r
	}
}
