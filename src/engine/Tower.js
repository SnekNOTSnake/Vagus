import Entity from './Entity'

/**
 * @typedef {Number} Level
 */
export default class Tower extends Entity {
	/**
	 * @param {Level} level
	 */
	constructor(level = 2) {
		super()

		/** @type {Level} */
		this.level = level
	}
}
