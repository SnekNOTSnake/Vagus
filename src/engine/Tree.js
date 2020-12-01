import Entity from './Entity'
import { TREE_CONTINENTAL } from '../constants/variables'

/**
 * @typedef { import('../constants/variables').TREE_CONTINENTAL }  TREE_CONTINENTAL
 * @typedef { import('../constants/variables').TREE_COASTAL } TREE_COASTAL
 * @typedef {TREE_CONTINENTAL|TREE_COASTAL} Type
 */
export default class Tree extends Entity {
	/**
	 * @param {Type} type
	 */
	constructor(type = null) {
		super()

		if (!type) {
			this.type = TREE_CONTINENTAL
			return
		}

		/** @type {Type} */
		this.type = type
	}
}
