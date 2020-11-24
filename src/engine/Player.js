/**
 * @typedef {Number} Color
 */
export default class Player {
	/**
	 * @param {Color} color
	 */
	constructor(color = null) {
		/** @type {Color} */
		this.color = color
	}

	// eslint-disable-next-line
	notifyTurn() {}

	/**
	 * @param {Number} color 1 step number from 0 to 6
	 */
	setColor(color) {
		this.color = color
	}
}
