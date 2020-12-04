import UndoManager from 'undo-manager'
import Unit from './Unit'
import Tower from './Tower'
import Hex from './Hex'
import HexUtils from './HexUtils'
import Grave from './Grave'
import TreeUtils from './TreeUtils'
import {
	UNIT_PRICE,
	UNIT_MAX_LEVEL,
	TOWER_PRICE,
	CUT_KINGDOM_TREE_GOLD_GAIN,
	UNIT_MOVE_STEPS,
} from '../constants/variables'
import Tree from './Tree'
import { generateMoveZone } from '../utils/helpers'

/**
 * @typedef {import('./World').default} World
 * @typedef {import('./Hex').default} Hex
 * @typedef {import('./ai/ArtificialIntelligence').default} AiPlayer
 * @typedef {import('./HumanPlayer').default} HumanPlayer
 * @typedef {import('./Kingdom').default} Kingdom
 * @typedef {import('./Tower').default} Tower
 * @typedef {import('./Unit').default} Unit
 * @typedef {AiPlayer & HumanPlayer} Player
 * @typedef {1|2|3|4} Level
 */
export default class Arbiter {
	/**
	 * @param {World} world
	 */
	constructor(world) {
		/** @type {World} */
		this.world = world

		/** @type {Player} */
		this.currentPlayer = null

		/** @type {Player} */
		this.winner = null

		this.undoManager = new UndoManager()

		if (this.world.config.players.length > 0) {
			this.setCurrentPlayer(this.world.config.players[0])
		}
	}

	/**
	 * @param {Player} player
	 */
	setCurrentPlayer(player) {
		this.currentPlayer = player

		this.undoManager.clear()

		player.notifyTurn(this)
	}

	undo() {
		this.undoManager.undo()
	}

	redo() {
		this.undoManager.redo()
	}

	hasUndo() {
		return this.undoManager.hasUndo()
	}

	hasRedo() {
		return this.undoManager.hasRedo()
	}

	undoAll() {
		while (this.hasUndo()) {
			this.undo()
		}
	}

	/**
	 * Buy unit for specific hex and the hex's kingdom
	 *
	 * @param {Hex} hexTarget Hex coords or regular
	 * @param {Kingdom} kingdom
	 * @param {Level} level
	 */
	buyUnitTowardsHex(hexTarget, kingdom, level = 1) {
		const hexInWorld = this.world.getHexAt(hexTarget)
		const isCapturing = hexInWorld.kingdom !== kingdom

		if (kingdom.player !== this.currentPlayer)
			throw new Error(
				"Trying to buy unit but kingdom doesn't belong to current player",
			)

		if (!hexInWorld || !kingdom)
			throw new Error('Trying to buy unit but hex or kingdom is undefiend')

		if (kingdom.gold < UNIT_PRICE * level)
			throw new Error('Trying to buy unit but not enough gold')

		// The order is important here to make sure all conditions are satisfied
		// before executing any action.
		const boughtUnit = new Unit(level)
		const undoCallback = isCapturing
			? this._placeUnitCapture(new Unit(level), kingdom, hexInWorld)
			: this._placeUnitInsideKingdom(boughtUnit, hexInWorld)
		kingdom.setGold(kingdom.gold - UNIT_PRICE * level)

		this.undoManager.add({
			undo: () => {
				kingdom.setGold(kingdom.gold + UNIT_PRICE * level)
				undoCallback()
			},
			redo: () => {
				this.buyUnitTowardsHex(hexInWorld, kingdom, level)
			},
		})
	}

	/**
	 * Buy tower for specific hex and the hex's kingdom
	 *
	 * @param {Hex} hex Hex coords or regular
	 */
	buyTowerForHex(hex) {
		const worldHex = this.world.getHexAt(hex)

		if (worldHex.player !== this.currentPlayer)
			throw new Error(
				'Trying to buy tower but hex target is not belong to current player',
			)

		if (worldHex === undefined)
			throw new Error('Trying to buy tower but hex target is undefined')

		if (worldHex.kingdom.gold < TOWER_PRICE)
			throw new Error('Trying to buy unit but not enough gold')

		// Buy tower and spawn it in the hex
		// The order is important here to make sure all conditions are satisfied
		// before executing any action.
		const undoCallback = this._spawnTowerAt(worldHex)
		worldHex.kingdom.setGold(worldHex.kingdom.gold - TOWER_PRICE)

		this.undoManager.add({
			undo: () => {
				worldHex.kingdom.setGold(worldHex.kingdom.gold + TOWER_PRICE)
				undoCallback()
			},
			redo: () => {
				this.buyTowerForHex(worldHex)
			},
		})
	}

	/**
	 * @param {Hex} hex
	 *
	 * @returns {Function} Callback function for undo manager
	 */
	_spawnTowerAt(hex) {
		// Make sure the hex is clear
		if (hex.entity !== null)
			throw new Error('Trying to spawn tower at a non-empty area')

		hex.setEntity(new Tower())

		return () => hex.setEntity(null)
	}

	/**
	 * Cycle the turn
	 */
	endTurn() {
		// reset played units
		this._resetUnits()

		// Check who won
		if (this._checkWhoWon()) {
			this.winner = this.currentPlayer
			return
		}

		// Decide the next player
		let nextIndex = this.world.config.players.indexOf(this.currentPlayer) + 1
		if (nextIndex >= this.world.config.players.length) {
			nextIndex = 0
			this.world.increaseTurn()
		}
		const nextPlayer = this.world.config.players[nextIndex]

		// Grow the trees!
		TreeUtils.spawnTrees(this.world)

		// Turn graves into trees
		this.world.hexs
			.filter((hex) => hex.player === nextPlayer)
			.filter((hex) => hex.hasGrave())
			.forEach((hex) => TreeUtils.spawnTreeOnWorldHex(this.world, hex))

		// Let the next player pay the kingdom, on the second turn
		if (this.world.turn > 0) this._calculateKingdomBalance(nextPlayer)

		// Set the next player, and notify them
		this.setCurrentPlayer(nextPlayer)
	}

	/**
	 * Reset played units for the current player
	 */
	_resetUnits() {
		this.world.kingdoms
			.filter((kingdom) => kingdom.player === this.currentPlayer)
			.forEach((currentPlayerKingdom) => {
				currentPlayerKingdom.hexs
					.filter((hex) => hex.hasUnit())
					.forEach((hex) => {
						hex.entity.setPlayed(false)
					})
			})
	}

	/**
	 * Check whether there is a player won the game
	 */
	_checkWhoWon() {
		return this.world.hexs.every(
			(hex) => hex.kingdom === this.world.hexs[0].kingdom,
		)
	}

	/**
	 * Calculate kingdom's balance.
	 * Kill units if kingdom is bankroupt.
	 *
	 * @param {Player} player
	 */
	_calculateKingdomBalance(player) {
		this.world.kingdoms
			.filter((kingdom) => kingdom.player === player)
			.forEach((kingdom) => {
				const totalKingdomGold =
					kingdom.gold + kingdom.getIncome() - kingdom.getOutcome()

				if (totalKingdomGold < 0) {
					// Kill starving soldiers
					kingdom.hexs
						.filter((hex) => hex.hasUnit())
						.forEach((hex) => {
							hex.setEntity(new Grave())
						})

					// Reset gold
					kingdom.setGold(0)
					return
				}

				kingdom.setGold(totalKingdomGold)
			})
	}

	/**
	 * @param {Hex} from Hex coords or regular
	 * @param {Hex} to Hex coords or regular
	 */
	moveUnit(from, to) {
		const fromHex = this.world.getHexAt(from)
		const toHex = this.world.getHexAt(to)
		const isCapturing = fromHex.kingdom !== toHex.kingdom
		const moveZone = generateMoveZone(
			this.world,
			fromHex,
			fromHex.entity.level,
			UNIT_MOVE_STEPS,
		)

		if (fromHex.player !== this.currentPlayer)
			throw new Error("Trying to move a unit but it's not their turn")

		if (fromHex.getUnit().played)
			throw new Error('Trying to take a unit but it has been played')

		if (!moveZone.includes(toHex))
			throw new Error('Trying to move a unit towards outside moveZone')

		const undoCallback = isCapturing
			? this._placeUnitCapture(fromHex, fromHex.kingdom, toHex)
			: this._placeUnitInsideKingdom(fromHex, toHex)

		this.undoManager.add({
			undo: undoCallback,
			redo: () => this.moveUnit(fromHex, toHex),
		})
	}

	/**
	 * @param {Hex|Unit} unitFrom
	 * @param {Kingdom} kingdomFrom
	 * @param {Hex} to
	 *
	 * @returns {Function} Callback function for undo manager
	 */
	_placeUnitCapture(unitFrom, kingdomFrom, to) {
		const isBoughtUnit = !(unitFrom instanceof Hex)
		const fromEntity = isBoughtUnit ? unitFrom : unitFrom.entity
		const undoCallbacks = []

		// The hex should be adjacent to kingdom
		if (!HexUtils.isHexAdjacentKingdom(this.world, to, kingdomFrom))
			throw new Error(
				'Trying to capture a hex but hex is not adjacent to kingdom',
			)

		// The hex should have a lower level of protections or level 4 attacker
		const protectingUnits = HexUtils.getProtectingUnits(
			this.world,
			to,
			fromEntity.level,
		)
		if (protectingUnits.length > 0)
			throw new Error(
				'Trying to capture a hex but it has an equal or higher level of protection',
			)

		// Save it if player decided to undo their action
		const lastHexEntity = to.entity
		const lastHexKingdom = to.kingdom
		const lastHexPlayer = to.player

		// If hex has capital, reset its gold
		if (to.hasCapital()) {
			const lastHexKingdomGold = to.kingdom.gold
			to.kingdom.setGold(0)

			undoCallbacks.push(() => to.kingdom.setGold(lastHexKingdomGold))
		}

		// Place unit from "from" to "to"
		to.setEntity(fromEntity)
		to.entity.setPlayed(true)
		if (!isBoughtUnit) unitFrom.setEntity(null)

		undoCallbacks.push(() => {
			if (!isBoughtUnit) unitFrom.setEntity(to.entity)
			fromEntity.setPlayed(false)
			to.setEntity(lastHexEntity)
		})

		// Remove the hex from enemy's kingdom
		if (to.kingdom) {
			to.kingdom.removeHex(to)

			undoCallbacks.push(() => to.kingdom.addHex(to))

			// Remove kingdom if it only has 1 hex
			if (to.kingdom.hexs.length < 2) {
				const lastKingdom = to.kingdom
				const lastKingdomHexs = to.kingdom.hexs

				to.kingdom.hexs[0].setKingdom(null)

				undoCallbacks.push(() => {
					to.kingdom.hexs[0].setKingdom(lastKingdom)
				})

				to.kingdom.removeHex(to.kingdom.hexs[0])
				this.world.removeKingdom(to.kingdom)

				undoCallbacks.push(() => {
					this.world.addKingdom(lastKingdom)
					lastKingdom.addHex(lastKingdomHexs[0])
					lastKingdom.hexs[0].setKingdom(lastKingdom)
				})
			}
		}

		// Set the hex's kingdom to the conqueror's kingdom
		to.setKingdom(kingdomFrom)
		to.setPlayer(kingdomFrom.player)
		kingdomFrom.addHex(to)

		undoCallbacks.push(() => {
			kingdomFrom.removeHex(to)
			to.setPlayer(lastHexPlayer)
			to.setKingdom(lastHexKingdom)
		})

		undoCallbacks.push(HexUtils.mergeKingdomsOnCapture(this.world, to))
		undoCallbacks.push(HexUtils.splitKingdomsOnCapture(this.world, to))

		// Build a new capital for the split and/or merged kingdoms
		undoCallbacks.push(HexUtils.rebuildKingdomsCapital(this.world))
		undoCallbacks.push(TreeUtils.transformSingleHexUnitsToTrees(this.world))

		return () => undoCallbacks.reverse().forEach((func) => func())
	}

	/**
	 * @param {Hex | Unit} from
	 * @param {Hex} to
	 *
	 * @returns {Function} Callback function for undo manager
	 */
	_placeUnitInsideKingdom(from, to) {
		const isBoughtUnit = !(from instanceof Hex)
		const fromEntity = isBoughtUnit ? from : from.entity
		const undoCallbacks = []

		// Make sure the hex is not reserved by tower or capital
		if (to.hasCapital() || to.hasTower())
			throw new Error(
				'Trying to place unit in a hex reserved by a tower or capital',
			)

		// If it already has a unit, merge if possible, throw error otherwise
		if (to.hasUnit()) {
			if (to.entity.level + fromEntity.level > UNIT_MAX_LEVEL)
				throw new Error(
					'Trying to merge two units but they exceeds the maximum level possible',
				)

			// Merge `fromEntity` unit and unit inside "to"
			const lastFromEntity = fromEntity
			to.entity.setLevel(to.entity.level + fromEntity.level)
			if (!isBoughtUnit) from.setEntity(null)

			undoCallbacks.push(() => {
				if (!isBoughtUnit) from.setEntity(lastFromEntity)
				to.entity.setLevel(to.entity.level - lastFromEntity.level)
			})
		} else {
			// Gain gold if hex kingdom has tree
			if (to.hasTree())
				to.kingdom.setGold(to.kingdom.gold + CUT_KINGDOM_TREE_GOLD_GAIN)

			const lastFromEntity = fromEntity
			const lastHexEntity = to.entity
			to.setEntity(fromEntity)
			if (!isBoughtUnit) {
				from.setEntity(null)
				fromEntity.setPlayed(true)
			}
			if (isBoughtUnit && lastHexEntity instanceof Tree) {
				fromEntity.setPlayed(true)
			}

			undoCallbacks.push(() => {
				to.entity.setPlayed(false)
				if (!isBoughtUnit) {
					from.setEntity(lastFromEntity)
				}
				if (lastHexEntity instanceof Tree)
					to.kingdom.setGold(to.kingdom.gold - CUT_KINGDOM_TREE_GOLD_GAIN)
				to.setEntity(lastHexEntity)
			})
		}

		return () => undoCallbacks.reverse().forEach((func) => func())
	}
}
