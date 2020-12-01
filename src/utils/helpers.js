import { UNIT_MAX_LEVEL } from '../constants/variables'
import HexUtils from '../engine/HexUtils'

/**
 * @typedef {import('../engine/World').default} World
 * @typedef {import('../engine/Hex').default} Hex
 * @typedef {import('../engine/Kingdom').default} Kingdom
 * @typedef {Number} Level
 */

/**
 *
 * @param {World} world
 * @param {Kingdom} kingdom
 * @param {Level} level
 */
export const generateSimpleMoveZone = (world, kingdom, level) => {
	const adjacentHexs = HexUtils.getHexsAdjacentToKingdom(world, kingdom)

	const validAdjacentHexsMoves = adjacentHexs.filter(
		(hex) => HexUtils.getProtectingUnits(world, hex, level).length < 1,
	)

	return validAdjacentHexsMoves
}

/**
 * @param {World} world
 * @param {Kingdom} kingdom
 * @param {Level} level
 */
export const generateMoveZone = (world, kingdom, level) => {
	const adjacentHexs = HexUtils.getHexsAdjacentToKingdom(world, kingdom)

	const validInsideKingdomMoves = kingdom.hexs
		.filter((hex) => !hex.hasTower() && !hex.hasCapital())
		.filter((hex) =>
			hex.hasUnit() ? hex.entity.level + level <= UNIT_MAX_LEVEL : true,
		)

	const validAdjacentHexsMoves = adjacentHexs.filter(
		(hex) => HexUtils.getProtectingUnits(world, hex, level).length < 1,
	)

	return validAdjacentHexsMoves.concat(validInsideKingdomMoves)
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
 * @param {Kingdom} kingdom
 * @param {Level} level
 */
export const generateMoveZoneInsideKingdom = (kingdom, level) => {
	return kingdom.hexs
		.filter((hex) => !hex.hasTower() && !hex.hasCapital())
		.filter((hex) =>
			hex.hasUnit() ? hex.entity.level + level <= UNIT_MAX_LEVEL : true,
		)
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
