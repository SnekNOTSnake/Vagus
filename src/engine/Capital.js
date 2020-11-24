import Entity from './Entity'

/**
 * @typedef {Number} Level
 */
export default class Capital extends Entity {
	/**
	 * @param {Level} level
	 */
	constructor(level = 1) {
		super()

		/** @type {Level} */
		this.level = level
	}
}
