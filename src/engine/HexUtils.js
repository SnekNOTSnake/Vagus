import { HexUtils as HexUtilsBase } from 'react-hexgrid'
import Capital from './Capital'
import Kingdom from './Kingdom'

/**
 * @typedef {import('./World').default} World
 * @typedef {import('./Hex').default} Hex
 * @typedef {import('./Kingdom').default} Kingdom
 * @typedef {import('./Capital').default} Capital
 * @typedef {import('./Grave').default} Grave
 * @typedef {import('./Tower').default} Tower
 * @typedef {import('./Tree').default} Tree
 * @typedef {import('./Unit').default} Unit
 * @typedef {Capital|Grave|Tower|Tree|Unit} Entity
 */
export default class HexUtils extends HexUtilsBase {
	/**
	 * Returns the neighbour non-water hexs.
	 *
	 * @param {World} world
	 * @param {Hex} originHex
	 *
	 * @returns {Hex[]}
	 */
	static neighbourHexs(world, originHex) {
		return this.neighbours(originHex)
			.map((hex) => world.getHexAt(hex))
			.filter((hex) => hex !== undefined)
	}

	/**
	 * Returns neighbour hexs that has the same player with originHex
	 *
	 * @param {World} world
	 * @param {Hex} originHex
	 * @param {Hex[]} subHex Only for these hexs
	 *
	 * @returns {Hex[]} originHex's neighbour brothers
	 * 									but without the originHex
	 */
	static getNeighbourHexsSamePlayer(world, originHex, subHex = null) {
		const neighboursHexsSamePlayer = this.neighbourHexs(
			world,
			originHex,
		).filter((hex) => hex.player === originHex.player)

		if (!subHex) return neighboursHexsSamePlayer

		return neighboursHexsSamePlayer.filter((hex) => subHex.includes(hex))
	}

	/**
	 * Returns all of the coordinates that is neighbour to a region of hexs
	 *
	 * @param {Hex[]} hexs the region of hexs that need to get its neighbours of
	 *
	 * @returns {Hex[]}
	 */
	static getHexsAdjacentToHexs(hexs) {
		const adjacentHexsMap = new Map()
		const baseHexsMap = new Map()

		hexs.forEach((hex) => baseHexsMap.set(this.getID(hex), hex))

		hexs.forEach((hex) => {
			this.neighbours(hex).forEach((neighbourHex) => {
				const neighbourHexID = this.getID(neighbourHex)

				if (adjacentHexsMap.has(neighbourHexID)) return
				if (baseHexsMap.has(neighbourHexID)) return

				adjacentHexsMap.set(neighbourHexID, neighbourHex)
			})
		})

		return Array.from(adjacentHexsMap.values())
	}

	/**
	 * Returns the passed Hex's kingdom hex brothers
	 *
	 * @param {World} world
	 * @param {Hex} originHex
	 *
	 * @returns {Hex[]} The passed Hex's kingdom hex brothers
	 */
	static getAdjacentSameKingdomHexs(world, originHex) {
		const adjacentSamePlayerHexs = [originHex]

		const flagHexs = (hex) => {
			this.getNeighbourHexsSamePlayer(world, hex).forEach((sameHex) => {
				if (adjacentSamePlayerHexs.includes(sameHex)) return
				adjacentSamePlayerHexs.push(sameHex)
				flagHexs(sameHex)
			})
		}

		flagHexs(originHex)

		return adjacentSamePlayerHexs
	}

	/**
	 * Returns sorted hexs that is the most interior in a kingdom.
	 * Used to find the safest place for capital, far away from the frontline.
	 * Although called "sorted hexs", only the safest hexs are actually sorted,
	 * The not-so-safe hexs (that has less brother neighbours) are unsorted.
	 *
	 * @param {World} world
	 * @param {Kingdom} kingdom
	 *
	 * @returns {Hex[]}
	 */
	static getMostInteriorHexs(world, kingdom) {
		const mostInteriorHexs = []
		let { hexs } = kingdom
		let maxLength

		do {
			maxLength = hexs.length

			/* 
				Mapping hexs-neighbour-counts into a variable
				Creating something like this:

				hexs = [Hex, Hex, Hex, Hex]
				neighbourCounts = [1, 1, 2, 3]
			*/
			const neighbourCounts = []
			hexs.forEach((hex) =>
				neighbourCounts.push(
					this.getNeighbourHexsSamePlayer(world, hex).length,
				),
			)

			// Getting the biggest number of neighbour brothers
			const maxNeighbours = Math.max(...neighbourCounts)

			// Put the disqualified hexs into `mostInteriorHexs` array
			hexs
				.filter((_, i) => neighbourCounts[i] < maxNeighbours)
				.forEach((hex) => mostInteriorHexs.push(hex))

			// Assign the qualified hexs to `hexs` to be repeated again
			hexs = hexs.filter((_, i) => neighbourCounts[i] === maxNeighbours)
		} while (hexs.length < maxLength)

		hexs.forEach((hex) => mostInteriorHexs.push(hex))

		return mostInteriorHexs.reverse()
	}

	/**
	 * Create kingdom's capital in the safest empty hex
	 * if the safest empty hex is full, go for safest hex with trees
	 * if all hexs are full, get the safest reserved hex, remove the `entity`
	 *
	 * @param {World} world
	 * @param {Kingdom} kingdom
	 *
	 * @returns {Hex} The hex with the capital
	 */
	static createKingdomCapital(world, kingdom) {
		let capitalHex = null

		const interiorHexs = this.getMostInteriorHexs(world, kingdom)

		// Create kingdom's capital in the safest empty hex
		const rebuilt = interiorHexs.some((hex) => {
			if (hex.entity !== null) return false

			world.setEntityAt(hex, new Capital())
			capitalHex = hex
			return true
		})

		if (rebuilt) return capitalHex

		// If the safest empty hex is full
		const interiorTreeHexs = interiorHexs.filter((hex) => hex.hasTree())
		if (interiorTreeHexs.length > 0) {
			;[capitalHex] = interiorTreeHexs
		} else {
			// If all hexs are full
			;[capitalHex] = interiorHexs
		}

		world.setEntityAt(capitalHex, new Capital())

		return capitalHex
	}

	/**
	 * Returns true if one of the hex's neighbours is the specified kingdom.
	 *
	 * @param {World} world
	 * @param {Hex} originHex
	 * @param {Kingdom} kingdom
	 *
	 * @returns {Boolean}
	 */
	static isHexAdjacentKingdom(world, originHex, kingdom) {
		return this.neighbourHexs(world, originHex).some(
			(hex) => hex.kingdom === kingdom,
		)
	}

	/**
	 * Returns all units that has higher or equal level to attacker.
	 * Including the hex itself and its neighbours.
	 *
	 * @param {World} world
	 * @param {Hex} originHex
	 * @param {Number} level
	 *
	 * @returns {Entity[]}
	 */
	static getProtectingUnits(world, originHex, level = -5) {
		const hex = world.getHexAt(originHex)
		const protectingUnits = []

		this.getNeighbourHexsSamePlayer(world, originHex).forEach((nHex) => {
			if (nHex.hasUnit() || nHex.hasCapital() || nHex.hasTower()) {
				protectingUnits.push(nHex.entity)
			}
		})

		if (hex.hasUnit() || hex.hasCapital() || hex.hasTower()) {
			protectingUnits.push(hex.entity)
		}

		protectingUnits.sort((a, b) => b.level - a.level)

		return protectingUnits.filter((unit) => unit.level >= level)
	}

	/**
	 * Check the captured hex's neighbours.
	 * If one of them belongs to the same player, merge the adjacent kingdoms and
	 * hex with the largest kingdom
	 *
	 * @param {World} world
	 * @param {Hex} hex
	 *
	 * @return {Func} Callback function for undo manager
	 */
	static mergeKingdomsOnCapture(world, hex) {
		const undoCallback = []
		const allyKingdomsSet = new Set()
		const allySingleHexs = []

		this.getNeighbourHexsSamePlayer(world, hex).forEach((neighbourHex) => {
			if (neighbourHex.kingdom) return allyKingdomsSet.add(neighbourHex.kingdom)
			return allySingleHexs.push(neighbourHex)
		})

		// Get the largest kingdom
		const allyKingdoms = Array.from(allyKingdomsSet)
		allyKingdoms.sort((a, b) => b.hexs.length - a.hexs.length)
		const largestKingdom = allyKingdoms.shift()
		allyKingdomsSet.delete(largestKingdom)

		// Remove the merged kingdoms and move their resources to the largets one
		allyKingdoms.forEach((kingdom) => {
			const lastKingdomHexs = kingdom.hexs
			const lastKingdomGold = kingdom.gold
			let lastKingdomCapitalHex = null

			// Move resources
			largestKingdom.setGold(largestKingdom.gold + kingdom.gold)
			kingdom.setGold(0)

			// Remove hexs from kingdom
			kingdom.hexs.forEach((kingdomHex) => {
				if (kingdomHex.hasCapital()) {
					lastKingdomCapitalHex = kingdomHex
					kingdomHex.setEntity(null)
				}
				kingdomHex.setKingdom(largestKingdom)
				largestKingdom.addHex(kingdomHex)
				kingdom.removeHex(kingdomHex)
			})

			// Remove kingdom
			world.removeKingdom(kingdom)

			undoCallback.push(() => {
				world.addKingdom(kingdom)
				lastKingdomHexs.forEach((LKHex) => {
					kingdom.addHex(LKHex)
					LKHex.setKingdom(kingdom)
					largestKingdom.removeHex(LKHex)
				})
				lastKingdomCapitalHex.setEntity(new Capital())
				kingdom.setGold(lastKingdomGold)
				largestKingdom.setGold(largestKingdom.gold - lastKingdomGold)
			})
		})

		// Merge the singleHexs with the largest kingdom
		allySingleHexs.forEach((singleHex) => {
			largestKingdom.addHex(singleHex)
			singleHex.setKingdom(largestKingdom)
		})

		undoCallback.push(() => {
			allySingleHexs.forEach((singleHex) => {
				largestKingdom.removeHex(singleHex)
				singleHex.setKingdom(null)
			})
		})

		// Return the callback
		return () => {
			undoCallback.reverse().forEach((func) => func())
		}
	}

	/**
	 * Runs `splitKingdom` on every enemy neighbour's kingdoms.
	 *
	 * @param {World} world
	 * @param {Hex} capturedHex
	 *
	 * @returns {Func}
	 */
	static splitKingdomsOnCapture(world, capturedHex) {
		let undoCallbacks = false

		// The neighbourHexs should not be `null` or the `capturedHex's kingdom`
		this.neighbourHexs(world, capturedHex)
			.filter((hex) => hex.kingdom !== null)
			.filter((hex) => hex.kingdom !== capturedHex.kingdom)
			.some((enemyHex) => {
				undoCallbacks = this.splitKingdom(world, enemyHex.kingdom)
				return Boolean(undoCallbacks)
			})

		return undoCallbacks || (() => {})
	}

	/**
	 * @param {World} world
	 * @param {Kingdom} kingdom
	 *
	 * @returns {Func}
	 */
	static splitKingdom(world, kingdom) {
		const undoCallbacks = []

		// Skip the splitting if the kingdom is not split (it has all of its lands)
		if (
			this.getAdjacentSameKingdomHexs(world, kingdom.hexs[0]).length ===
			kingdom.hexs.length
		)
			return false

		const goldPerHex = kingdom.gold / kingdom.hexs.length
		let kingdomHexs = kingdom.hexs.slice()

		const subKingdoms = []
		const singleHexs = []

		// Getting the split kingdom remains
		while (kingdomHexs.length > 0) {
			const subKingdom = this.getAdjacentSameKingdomHexs(world, kingdomHexs[0])

			if (subKingdom.length < 2) {
				singleHexs.push(subKingdom[0])
			} else {
				subKingdoms.push(subKingdom)
			}

			// Filter the hexs that kingdomHexs doesn't have from subKingdom
			kingdomHexs = kingdomHexs.filter((hex) => !subKingdom.includes(hex))
		}

		// Sort the kingdoms from the widest to the narrowest
		subKingdoms.sort((a, b) => b.length - a.length)

		// Remove kingdom from single hexs
		singleHexs.forEach((hex) => {
			kingdom.removeHex(hex)
			hex.setKingdom(null)

			undoCallbacks.push(() => {
				hex.setKingdom(kingdom)
				kingdom.addHex(hex)
			})
		})

		// Create new sub kingdoms, but keep the largest kingdom
		subKingdoms.slice(1).forEach((subKingdom) => {
			const newKingdom = new Kingdom(subKingdom)
			newKingdom.gold = Math.ceil(newKingdom.hexs.length * goldPerHex)
			world.addKingdom(newKingdom)

			newKingdom.hexs.forEach((hex) => {
				kingdom.removeHex(hex)
				hex.setKingdom(newKingdom)

				undoCallbacks.push(() => {
					hex.setKingdom(kingdom)
					kingdom.addHex(hex)
				})
			})

			undoCallbacks.push(() => {
				world.removeKingdom(newKingdom)
				newKingdom.setGold(0)
			})
		})

		// Remove kingdom from world if it has no subkingdoms
		if (subKingdoms.length < 1) {
			world.removeKingdom(kingdom)
			undoCallbacks.push(() => world.addKingdom(kingdom))
		}

		// Re-set the kingdom's gold based on its number of hexs
		const lastKingdomGold = kingdom.gold
		kingdom.setGold(Math.ceil(kingdom.hexs.length * goldPerHex))
		undoCallbacks.push(() => kingdom.setGold(lastKingdomGold))

		return () => undoCallbacks.reverse().forEach((func) => func())
	}

	/**
	 * Create a capital for each kingdoms that doesn't have one
	 *
	 * @param {World} world
	 *
	 * @returns {Func}
	 */
	static rebuildKingdomsCapital(world) {
		const undoCallbacks = []

		world.kingdoms
			.filter((kingdom) => kingdom.hexs.length > 1)
			.forEach((kingdom) => {
				if (kingdom.hasCapital()) return
				const capitalHex = this.createKingdomCapital(world, kingdom)

				undoCallbacks.push(() => capitalHex.setEntity(null))
			})

		return () => undoCallbacks.reverse().forEach((func) => func())
	}
}
