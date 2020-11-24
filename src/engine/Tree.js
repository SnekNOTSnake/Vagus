import Entity from './Entity'

/**
 * @typedef {'CONTINENTAL'|'COASTAL'} Type
 */
export default class Tree extends Entity {
	static CONTINENTAL = 'continental'
	static COASTAL = 'coastal'

	/**
	 * @param {Type} type
	 */
	constructor(type = null) {
		super()

		if (!type) {
			this.type = Tree.CONTINENTAL
			return
		}

		/** @type {Type} */
		this.type = type
	}
}
