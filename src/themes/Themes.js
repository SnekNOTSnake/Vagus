import continentalTree0 from './images/trees/continental/tree-1.svg'
import continentalTree1 from './images/trees/continental/tree-2.svg'
import continentalTree2 from './images/trees/continental/tree-3.svg'
import coastalTree0 from './images/trees/coastal/tree-1.svg'
import coastalTree1 from './images/trees/coastal/tree-2.svg'
import coastalTree2 from './images/trees/coastal/tree-3.svg'
import unit1 from './images/unit-1.svg'
import unit2 from './images/unit-2.svg'
import unit3 from './images/unit-3.svg'
import unit4 from './images/unit-4.svg'
import capital from './images/capital.svg'
import grave from './images/grave.svg'
import tower from './images/tower.svg'
import shield from './images/shield.svg'
import wtf from './images/wtf.svg'
import gold1 from './images/gold/gold-1.svg'
import gold5 from './images/gold/gold-5.svg'
import gold25 from './images/gold/gold-25.svg'
import gold50 from './images/gold/gold-50.svg'
import gold100 from './images/gold/gold-100.svg'

import Capital from '../engine/Capital'
import Grave from '../engine/Grave'
import Tower from '../engine/Tower'
import Tree from '../engine/Tree'
import Unit from '../engine/Unit'

export default class Themes {
	static trees = {
		continental: [continentalTree0, continentalTree1, continentalTree2],
		coastal: [coastalTree0, coastalTree1, coastalTree2],
	}

	static units = [unit1, unit2, unit3, unit4]

	static getImageFor(entity) {
		switch (true) {
			case entity instanceof Tree:
				if (entity.type === Tree.CONTINENTAL)
					return this.trees.continental[entity.id % 3]
				return this.trees.coastal[entity.id % 3]

			case entity instanceof Unit:
				return this.units[entity.level - 1]

			case entity instanceof Capital:
				return capital

			case entity instanceof Grave:
				return grave

			case entity instanceof Tower:
				return tower

			default:
				return wtf
		}
	}

	/**
	 * @param {'shield'} name
	 */
	static getSpecialImageFor(name) {
		switch (name) {
			case 'shield':
				return shield
			default:
				return wtf
		}
	}

	static getImageForGold(gold) {
		switch (true) {
			case gold <= 5:
				return gold1
			case gold <= 25:
				return gold5
			case gold <= 50:
				return gold25
			case gold <= 100:
				return gold50
			default:
				return gold100
		}
	}
}
