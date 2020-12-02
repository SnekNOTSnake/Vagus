import {
	UNIT_MAX_LEVEL,
	UNIT_PRICE,
	TOWER_PRICE,
	TREE_COASTAL,
	TREE_CONTINENTAL,
	UNIT_MOVE_STEPS,
} from '../../constants/variables'
import Player from '../Player'
import HexUtils from '../HexUtils'
import Unit from '../Unit'
import {
	generateMoveZone,
	generateMoveZoneInsideKingdom,
	generateSimpleMoveZone,
} from '../../utils/helpers'

/**
 * @typedef {Number} Color
 * @typedef {import('../Arbiter').default} Arbiter
 * @typedef {import('../Kingdom').default} Kingdom
 * @typedef {import('../Hex').default} Hex
 * @typedef {import('../World').default} World
 * @typedef {Number} Level
 */

/**
 * It's default difficulty is easy
 */
export default class ArtificialIntelligence extends Player {
	/**
	 * @param {Color} color
	 */
	constructor(color = null) {
		super(color)
		this.color = color
	}

	/**
	 * @override
	 * @param {Arbiter} arbiter
	 */
	notifyTurn(arbiter) {
		try {
			arbiter.world.kingdoms
				.filter((kingdom) => kingdom.player === arbiter.currentPlayer)
				.forEach((kingdom) => this.playKingdom(arbiter, kingdom))
		} catch (err) {
			// If AI try to do an illegal move, just catch it and pass turn
			// eslint-disable-next-line no-console
			console.warn('AI Illegal move', err)
		}
		arbiter.endTurn()
	}

	/**
	 * Meant to be overridden
	 *
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	// eslint-disable-next-line no-unused-vars
	playKingdom(arbiter, kingdom) {}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	moveUnits(arbiter, kingdom) {
		const movableUnitHexs = kingdom.hexs
			.filter((hex) => hex.hasUnit())
			.filter((hex) => hex.getUnit().played === false)

		movableUnitHexs.forEach((hex) => this.decideAboutUnit(arbiter, hex))
	}

	/**
	 * Clean trees, Attack something, run around if nothing to attack
	 *
	 * @param {Arbiter} arbiter
	 * @param {Hex} hex
	 */
	decideAboutUnit(arbiter, hex) {
		const { level } = hex.entity

		const moveZone = generateMoveZone(
			arbiter.world,
			hex,
			hex.entity.level,
			UNIT_MOVE_STEPS,
		)

		// Cleaning coastal trees is the top-most priority
		if (level <= 2 && this.cleanCoastalTrees(arbiter, moveZone, hex)) return

		// Cleaning continental trees are the next priority
		if (level <= 1 && this.cleanContinentalTrees(arbiter, moveZone, hex)) return

		// Attack something
		const attackableHexs = moveZone.filter(
			(moveHex) => moveHex.player !== hex.player,
		)
		if (attackableHexs.length > 0) {
			const hexTarget = this.findMostAttractiveHex(
				arbiter.world,
				attackableHexs,
				hex.kingdom,
				hex.entity.level,
			)
			arbiter.moveUnit(hex, hexTarget)
			return
		}

		// If nothing to attack or clean, improve defense
		if (HexUtils.isHexInPerimeter(arbiter.world, hex)) return
		this.pushUnitToBetterDefense(arbiter, moveZone, hex.kingdom)
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Hex[]} moveZone
	 * @param {Kingdom} kingdom
	 */
	pushUnitToBetterDefense(arbiter, moveZone, kingdom) {
		moveZone.some((kingdomHex) => {
			const numberOfAdjacentEnemyHexs = HexUtils.neighbourHexs(
				arbiter.world,
				kingdomHex,
			).filter((neighbourHex) => neighbourHex.kingdom !== kingdom).length

			if (
				kingdomHex.kingdom === kingdom &&
				kingdomHex.entity === null &&
				numberOfAdjacentEnemyHexs === 0
			) {
				return true
			}

			return false
		})
	}

	/**
	 * @param {World} world
	 * @param {Hex[]} attackableHexs
	 * @param {Kingdom} kingdomAttacker
	 * @param {Level} level
	 *
	 * @returns {Hex}
	 */
	findMostAttractiveHex(world, attackableHexs, kingdomAttacker, level) {
		// Find a proper hex for a proper level unit
		if (level >= 3) {
			const attractiveHex = this.findMostAttractiveHexForWitch(
				world,
				attackableHexs,
				level,
			)
			if (attractiveHex) return attractiveHex
		}

		// Or just find a hex that surrounded by ally hexs
		let maxAllure = -1
		let target = null
		attackableHexs.forEach((hex) => {
			const allure = this._getAttackAllure(world, hex, kingdomAttacker)
			if (allure > maxAllure) {
				maxAllure = allure
				target = hex
			}
		})
		return target
	}

	/**
	 * @param {World} world
	 * @param {Hex[]} attackableHexs
	 * @param {Level} level
	 *
	 * @returns {Hex}
	 */
	findMostAttractiveHexForWitch(world, attackableHexs, level) {
		let targetHex = null

		// Attacking the tower directly is the top priority
		const predicat = attackableHexs.some((hex) => {
			if (hex.hasTower() && hex.entity.level < level) {
				targetHex = hex
				return true
			}
			return false
		})
		if (predicat) return targetHex

		// Or attacking a hex protected by tower is a good point
		attackableHexs.some((hex) => {
			if (HexUtils.isHexProtectedByTower(world, hex)) {
				targetHex = hex
				return true
			}
			return false
		})

		return targetHex
	}

	/**
	 * Number of hexs surrounding the `hexTarget` that
	 * has the same player as `hexAttacker`
	 *
	 * @param {World} world
	 * @param {Hex} hexTarget
	 * @param {Kingdom} kingdomAttacker
	 */
	_getAttackAllure(world, hexTarget, kingdomAttacker) {
		const filteredNeighbours = HexUtils.neighbourHexs(world, hexTarget).filter(
			(hex) => hex.player === kingdomAttacker.player,
		)
		return filteredNeighbours.length
	}

	/**
	 * Returns true if a coastal tree was cleaned
	 *
	 * @param {Arbiter} arbiter
	 * @param {Hex[]} moveZone
	 * @param {Hex} hex
	 *
	 * @returns {Boolean}
	 */
	cleanCoastalTrees(arbiter, moveZone, hex) {
		const coastalTreeHexs = moveZone
			.filter((kingdomHex) => kingdomHex.hasTree())
			.filter((kingdomHex) => kingdomHex.entity.type === TREE_COASTAL)

		if (coastalTreeHexs.length > 0) {
			arbiter.moveUnit(hex, coastalTreeHexs[0])
			return true
		}

		return false
	}

	/**
	 * Returns true if a continental tree was cleaned
	 *
	 * @param {Arbiter} arbiter
	 * @param {Hex[]} moveZone
	 * @param {Hex} hex
	 *
	 * @returns {Boolean}
	 */
	cleanContinentalTrees(arbiter, moveZone, hex) {
		const continentalTreeHexs = moveZone
			.filter((kingdomHex) => kingdomHex.hasTree())
			.filter((kingdomHex) => kingdomHex.entity.type === TREE_CONTINENTAL)

		if (continentalTreeHexs.length > 0) {
			arbiter.moveUnit(hex, continentalTreeHexs[0])
			return true
		}

		return false
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	spendMoneyAndMergeUnits(arbiter, kingdom) {
		this.spendMoney(arbiter, kingdom)
		this.mergeUnits(arbiter, kingdom)
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	mergeUnits(arbiter, kingdom) {
		kingdom.hexs
			.filter((hex) => hex.hasUnit())
			.filter((hex) => hex.entity.played === false)
			.forEach((hex) => this.tryToMergeWithSomeone(arbiter, hex))
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Hex} hex
	 */
	tryToMergeWithSomeone(arbiter, hex) {
		const moveZone = generateMoveZoneInsideKingdom(
			arbiter.world,
			hex,
			hex.entity.level,
			UNIT_MOVE_STEPS,
		)

		const mergableHexs = moveZone.filter((kingdomHex) => kingdomHex.hasUnit())

		mergableHexs.some((mergableHex) => {
			if (!this.mergableCondition(hex, mergableHex)) return false
			arbiter.moveUnit(hex, mergableHex)
			return true
		})
	}

	/**
	 * @param {Hex} hexFrom
	 * @param {Hex} hexTarget
	 *
	 * @returns {Boolean}
	 */
	mergableCondition(hexFrom, hexTarget) {
		if (!this.canAiAffordMergeUnit(hexFrom, hexTarget)) return false
		return true
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	spendMoney(arbiter, kingdom) {
		this.tryToBuildTowers(arbiter, kingdom)
		this.tryToBuildUnits(arbiter, kingdom)
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	tryToBuildTowers(arbiter, kingdom) {
		while (kingdom.gold >= TOWER_PRICE) {
			const hexTarget = this.findHexThatNeedsTower(arbiter.world, kingdom)
			if (!hexTarget) return
			arbiter.buyTowerForHex(hexTarget)
		}
	}

	/**
	 * @param {World} world
	 * @param {Kingdom} kingdom
	 *
	 * @returns {Hex}
	 */
	findHexThatNeedsTower(world, kingdom) {
		let target = null

		kingdom.hexs
			.filter((hex) => hex.entity === null)
			.some((hex) => {
				if (this.getNumberOfProtectionsByNewTower(world, hex) >= 5) {
					target = hex
					return true
				}
				return false
			})

		return target
	}

	/**
	 * @param {World} world
	 * @param {Hex} hex
	 *
	 * @returns {Number}
	 */
	getNumberOfProtectionsByNewTower(world, hex) {
		return HexUtils.neighbourHexs(world, hex)
			.filter((neighbourHex) => neighbourHex.player === hex.player)
			.filter(
				(neighbourHex) => !HexUtils.isHexProtectedByTower(world, neighbourHex),
			).length
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	tryToBuildUnits(arbiter, kingdom) {
		this.tryToBuildUnitsOnCoastalTrees(arbiter, kingdom)
		this.tryToBuildUnitsToAttack(arbiter, kingdom)

		// Kick start a kingdom, when all of the kingdom hexs are covered in trees.
		// The income would only be 1, while one peasant costs 2 maintenance golds.
		const hexsThatHasUnit = kingdom.hexs.filter((hex) => hex.hasUnit())
		if (hexsThatHasUnit.length <= 1 && kingdom.gold >= UNIT_PRICE)
			this.tryToAttackWithBoughtUnit(arbiter, kingdom, 1)
	}

	/**
	 * Attack with units level 1 to 4
	 *
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	tryToBuildUnitsToAttack(arbiter, kingdom) {
		for (let level = 1; level <= UNIT_MAX_LEVEL; level += 1) {
			if (!this.canAiAffordBuildUnit(kingdom, level)) return
			while (
				kingdom.gold >= UNIT_PRICE * level &&
				this.canAiAffordBuildUnit(kingdom, level)
			) {
				if (!this.tryToAttackWithBoughtUnit(arbiter, kingdom, level)) break
			}
		}
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 * @param {Level} level
	 *
	 * @returns {Boolean}
	 */
	tryToAttackWithBoughtUnit(arbiter, kingdom, level) {
		const attackableHexs = generateSimpleMoveZone(arbiter.world, kingdom, level)
		if (attackableHexs.length < 1) return false

		const targetHex = this.findMostAttractiveHex(
			arbiter.world,
			attackableHexs,
			kingdom,
			level,
		)
		arbiter.buyUnitTowardsHex(targetHex, kingdom, level)
		return true
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 * @param {Level} level
	 *
	 * @returns {Boolean}
	 */
	tryToBuildUnitInsideKingdom(arbiter, kingdom, level) {
		let target = null
		kingdom.hexs.some((hex) => {
			if (hex.entity === null || hex.hasTree() || hex.hasGrave()) {
				target = hex
				return true
			}
			return false
		})

		if (!target) return false
		arbiter.buyUnitTowardsHex(target, kingdom, level)
		return true
	}

	/**
	 * Calculate kingdom survivalability if there would be another unit bought
	 *
	 * @param {Kingdom} kingdom
	 * @param {Level} level
	 * @param {Number} turnToSurvive
	 *
	 * @returns {Boolean}
	 */
	canAiAffordBuildUnit(kingdom, level, turnToSurvive = 1) {
		const imaginaryUnit = new Unit(level)
		const newKingdomDifference =
			kingdom.getDifference() - imaginaryUnit.getUnitMaintenanceCost()

		const finalKingdomGold =
			kingdom.gold - UNIT_PRICE * level + newKingdomDifference * turnToSurvive

		return finalKingdomGold >= 0
	}

	/**
	 * Calculate kingdom survivalability if there would be units merged
	 *
	 * @param {Hex} unitHex1
	 * @param {Hex} unitHex2
	 * @param {Number} turnToSurvive
	 */
	canAiAffordMergeUnit(unitHex1, unitHex2, turnToSurvive = 1) {
		const { kingdom } = unitHex1
		const excludedMaintenance =
			unitHex1.entity.getUnitMaintenanceCost() +
			unitHex2.entity.getUnitMaintenanceCost()
		const mergedMaintenanceCost = new Unit(
			unitHex1.entity.level + unitHex2.entity.level,
		).getUnitMaintenanceCost()

		const newKingdomDifference =
			kingdom.getDifference() + (excludedMaintenance - mergedMaintenanceCost)
		const finalKingdomGold = kingdom.gold + newKingdomDifference * turnToSurvive

		return finalKingdomGold >= 0
	}

	/**
	 * @param {Arbiter} arbiter
	 * @param {Kingdom} kingdom
	 */
	tryToBuildUnitsOnCoastalTrees(arbiter, kingdom) {
		while (kingdom.gold >= UNIT_PRICE) {
			if (!this.canAiAffordBuildUnit(kingdom, 1)) return

			const coastalTreeHexs = kingdom.hexs
				.filter((kingdomHex) => kingdomHex.hasTree())
				.filter((kingdomHex) => kingdomHex.entity.type === TREE_COASTAL)

			if (coastalTreeHexs.length < 1) return

			arbiter.buyUnitTowardsHex(coastalTreeHexs[0], kingdom, 1)
		}
	}
}
