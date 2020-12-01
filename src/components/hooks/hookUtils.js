import { UNIT_MAX_LEVEL } from '../../constants/variables'
import Tower from '../../engine/Tower'
import Unit from '../../engine/Unit'

/**
 * TBH I don't think this file belongs to `hooks` folder because nobody is
 * really calling any hook APIs.
 */

/**
 * @param {Function} setSelectionFunc
 */
export const buyUnit = (setSelectionFunc) => {
	setSelectionFunc((initVal) => {
		if (initVal instanceof Unit)
			if (initVal.level >= UNIT_MAX_LEVEL) return new Unit(1)
			else return new Unit(initVal.level + 1)
		return new Unit(1)
	})
}

/**
 * @param {Function} setSelectionFunc
 */
export const buyTower = (setSelectionFunc) => {
	setSelectionFunc(new Tower())
}
