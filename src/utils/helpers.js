import { UNIT_MAX_LEVEL } from '../constants/variables'
import HexUtils from '../engine/HexUtils'
import Hex from '../engine/Hex'

/**
 * @typedef {import('../engine/World').default} World
 * @typedef {import('../engine/Hex').default} Hex
 * @typedef {import('../engine/Kingdom').default} Kingdom
 * @typedef {Number} Level
 */

/**
 * Get hexs inside a kingdom that are reachable within stepsAllowed
 *
 * @param {World} world
 * @param {Hex} startingHex
 * @param {Number} steps
 */
const getKingdomHexsWithinReach = (world, startingHex, steps) => {
	const moveZone = [startingHex]

	// Get all inside-kingdom-hexs reachable within (stepsAllowed - 1) steps
	let step = 1
	let extended = true
	while (extended && step <= steps) {
		step += 1
		extended = false

		// eslint-disable-next-line no-loop-func
		moveZone.forEach((moveHex) => {
			HexUtils.neighbourHexs(world, moveHex)
				.filter((nHex) => nHex.kingdom === startingHex.kingdom)
				.filter((nHex) => !moveZone.includes(nHex))
				.forEach((nHex) => {
					moveZone.push(nHex)
					extended = true
				})
		})
	}

	return moveZone
}

/**
 * Only the adjacent hexs, excluding passed hexs
 *
 * @param {World} world
 * @param {Hex[]} hexs
 */
const getWorldHexsAdjacentToHexs = (world, hexs) => {
	const neighbours = []
	hexs.forEach((moveHex) => {
		HexUtils.neighbourHexs(world, moveHex)
			.filter((nHex) => !neighbours.includes(nHex) && !hexs.includes(nHex))
			.forEach((nHex) => neighbours.push(nHex))
	})
	return neighbours
}

/**
 * @param {World} world
 * @param {Hex|Kingdom} source
 * @param {Level} level
 * @param {Number} steps Leave it empty if `source` is a `Kingdom`
 *
 * @returns {Hex[]}
 */
export const generateSimpleMoveZone = (world, source, level, steps = 9001) => {
	const isBoughtUnit = !(source instanceof Hex)
	const kingdom = isBoughtUnit ? source : source.kingdom
	const startingHex = isBoughtUnit ? source.hexs[0] : source

	const moveZone = getKingdomHexsWithinReach(world, startingHex, steps - 1)
	const moveZoneNeighbours = getWorldHexsAdjacentToHexs(world, moveZone)

	// Only hexs that are belong to enemies
	const moveZoneFiltered = moveZone
		.concat(moveZoneNeighbours)
		.filter((moveHex) => moveHex.kingdom !== kingdom)
		.filter((moveHex) => {
			return !HexUtils.getProtectingUnits(world, moveHex, level).length
		})

	return moveZoneFiltered
}

/**
 * @param {World} world
 * @param {Hex|Kingdom} source
 * @param {Level} level
 * @param {Number} steps Leave it empty if `source` is a `Kingdom`
 *
 * @returns {Hex[]}
 */
export const generateMoveZone = (world, source, level, steps = 9001) => {
	const isBoughtUnit = !(source instanceof Hex)
	const kingdom = isBoughtUnit ? source : source.kingdom
	const startingHex = isBoughtUnit ? source.hexs[0] : source

	const moveZone = getKingdomHexsWithinReach(world, startingHex, steps - 1)
	const moveZoneNeighbours = getWorldHexsAdjacentToHexs(world, moveZone)

	const moveZoneFiltered = moveZone
		.concat(moveZoneNeighbours)
		.filter((moveHex) => {
			// If hex belongs to enemy
			if (moveHex.kingdom !== kingdom) {
				return !HexUtils.getProtectingUnits(world, moveHex, level).length
			}

			// If hex is inside kingdom
			if (moveHex.hasTower() || moveHex.hasCapital()) return false
			if (moveHex.hasUnit() && moveHex.entity.level + level > UNIT_MAX_LEVEL)
				return false
			return true
		})
		.filter((moveHex) => {
			if (!isBoughtUnit) return moveHex !== source
			return true
		})

	return moveZoneFiltered
}

/**
 * @param {Kingdom} kingdom
 */
export const generateMoveZoneForTower = (kingdom) => {
	const validInsideKingdomMoves = kingdom.hexs.filter(
		(hex) => hex.entity === null,
	)

	return validInsideKingdomMoves
}

/**
 * @param {World} world
 * @param {Hex|Kingdom} source
 * @param {Level} level
 * @param {Number} steps Leave it empty if `source` is a `Kingdom`
 */
export const generateMoveZoneInsideKingdom = (
	world,
	source,
	level,
	steps = 9001,
) => {
	const isBoughtUnit = !(source instanceof Hex)
	const startingHex = isBoughtUnit ? source.hexs[0] : source

	const moveZone = getKingdomHexsWithinReach(world, startingHex, steps)

	const moveZoneFiltered = moveZone
		.filter((moveHex) => {
			if (moveHex.hasTower() || moveHex.hasCapital()) return false
			if (moveHex.hasUnit() && moveHex.entity.level + level > UNIT_MAX_LEVEL)
				return false
			return true
		})
		.filter((moveHex) => {
			if (!isBoughtUnit) return moveHex !== source
			return true
		})

	return moveZoneFiltered
}

/**
 * Get the viewBox for the entire Hexgrid.
 * It works by getting the smallest hex coords and the higest hex coords.
 *
 * @param {Hex[]} hexs
 * @param {Object} layout
 * @param {Number} padding
 *
 * @returns {[Number, Number, Number, Number]} First two are coords,
 * 																						 Last two are viewBox size
 */
export const createViewBox = (hexs, layout, padding) => {
	const initPixel = HexUtils.hexToPixel(hexs[0], layout)
	const coords = [initPixel.x, initPixel.y, initPixel.x, initPixel.y]

	hexs.forEach((hex) => {
		const hexCoords = HexUtils.hexToPixel(hex, layout)

		coords[0] = Math.min(hexCoords.x, coords[0])
		coords[1] = Math.min(hexCoords.y, coords[1])
		coords[2] = Math.max(hexCoords.x, coords[2])
		coords[3] = Math.max(hexCoords.y, coords[3])
	})

	coords[0] -= layout.size.x
	coords[1] -= layout.size.y

	// viewBox size, find the biggest place (coords in px) of the hex
	coords[2] += layout.size.x
	coords[3] += layout.size.y

	const viewBox = [
		coords[0],
		coords[1],

		/*
		 The reason why the highest hex coords is getting substracted
		 by the *initialCoords* is because
		 - If we don't substract it, it'll just be a regular coords, not `size`
		 - initalCoords are always less than or equal 0, making it an addition
		 - so, (200 - -100) + (10 * 2) = 320 viewBox size
		*/
		coords[2] - coords[0] + padding * 2,
		coords[3] - coords[1] + padding * 2,
	]

	return viewBox
}
