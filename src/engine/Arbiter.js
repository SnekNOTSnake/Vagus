import UndoManager from 'undo-manager'
import Unit from './Unit'
import Tower from './Tower'
import HexUtils from './HexUtils'
import Grave from './Grave'
import TreeUtils from './TreeUtils'

/**
 * @typedef {import('./World.js').default} World
 * @typedef {import('./Hex.js').default} Hex
 * @typedef {import('./Player.js').default} Player
 * @typedef {import('./Kingdom.js').default} Kingdom
 * @typedef {import('./Tower.js').default} Tower
 * @typedef {import('./Unit.js').default} Unit
 * @typedef {Tower|Unit} Selection
 */
export default class Arbiter {
	static UNIT_PRICE = 10
	static UNIT_MAX_LEVEL = 4
	static TOWER_PRICE = 15

	/**
	 * @param {World} world
	 */
	constructor(world) {
		/** @type {World} */
		this.world = world

		/** @type {Selection} */
		this.selection = null

		/** @type {Player} */
		this.currentPlayer = null

		/** @type {Kingdom} */
		this.currentKingdom = null

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
		this.currentKingdom = null

		this.undoManager.clear()

		player.notifyTurn(this)
	}

	/**
	 * For testing purpose
	 *
	 * @param {Kingdom} kingdom
	 */
	setCurrentKingdom(kingdom) {
		this._checkPlayerSelected()

		if (kingdom.player !== this.currentPlayer)
			throw new Error(
				"Trying to set current kingdom but it don't belong to the current player",
			)

		const lastKingdom = this.currentKingdom
		this.currentKingdom = kingdom

		this.undoManager.add({
			undo: () => {
				this.currentKingdom = lastKingdom
			},
			redo: () => this.setCurrentKingdom(kingdom),
		})
	}

	/**
	 * @param {Selection} selection
	 */
	setSelection(selection) {
		this.selection = selection
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
	 * Buy Units
	 */
	buyUnit() {
		this._checkKingdomSelected()

		if (this.selection instanceof Tower)
			throw new Error('Trying to buy unit but selection has tower')

		if (
			this.selection instanceof Unit &&
			this.selection.level >= Arbiter.UNIT_MAX_LEVEL
		)
			throw new Error('Trying to buy unit but selection has the maximum level')

		if (this.currentKingdom.gold < Arbiter.UNIT_PRICE)
			throw new Error('Trying to buy unit but not enough gold')

		this.currentKingdom.setGold(this.currentKingdom.gold - Arbiter.UNIT_PRICE)
		if (this.selection === null) {
			this.setSelection(new Unit())
		} else {
			this.selection.setLevel(this.selection.level + 1)
		}

		this.undoManager.add({
			undo: () => {
				if (this.selection.level - 1 === 0) this.setSelection(null)
				else this.selection.setLevel(this.selection.level - 1)
				this.currentKingdom.setGold(
					this.currentKingdom.gold + Arbiter.UNIT_PRICE,
				)
			},
			redo: () => {
				this.buyUnit()
			},
		})
	}

	/**
	 * buy Towers
	 */
	buyTower() {
		this._checkKingdomSelected()

		if (this.selection !== null)
			throw new Error('Trying to buy tower selection is not empty')

		if (this.currentKingdom.gold < Arbiter.TOWER_PRICE)
			throw new Error('Trying to buy unit but not enough gold')

		this.currentKingdom.setGold(this.currentKingdom.gold - Arbiter.TOWER_PRICE)
		this.setSelection(new Tower())

		this.undoManager.add({
			undo: () => {
				this.setSelection(null)
				this.currentKingdom.setGold(
					this.currentKingdom.gold + Arbiter.TOWER_PRICE,
				)
			},
			redo: () => {
				this.buyTower()
			},
		})
	}

	/**
	 * Cycle the turn
	 */
	endTurn() {
		// Make sure the selection is empty
		if (this.selection !== null)
			throw new Error('Trying to end the turn but selection is not empty')

		// reset played units
		this._resetUnits()

		// Check who won
		if (this._checkWhoWon()) {
			// eslint-disable-next-line
			window.alert(`Player with a color of ${this.currentPlayer.color} won`)
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
	 * Determine what action when clicking on a certain hex
	 *
	 * @param {Hex} originHex
	 */
	smartAction(originHex) {
		const hex = this.world.getHexAt(originHex)

		if (this.selection === null) {
			if (hex.kingdom) {
				if (hex.kingdom === this.currentKingdom) {
					if (hex.hasUnit()) {
						this.takeUnitAt(hex)
					}
				} else if (hex.kingdom.player === this.currentPlayer) {
					this.currentKingdom = hex.kingdom

					if (hex.hasUnit() && hex.entity.played === false) this.takeUnitAt(hex)
				}
			}
		} else {
			if (
				hex.player === this.currentPlayer &&
				hex.kingdom !== this.currentKingdom
			)
				throw new Error(
					'Trying to select another kingdom but selection is not empty',
				)
			this.placeAt(hex)
		}
	}

	/**
	 * @param {Hex} originHex
	 *
	 * @returns {Unit} Selected unit
	 */
	takeUnitAt(originHex) {
		this._checkKingdomSelected()

		const hex = this.world.getHexAt(originHex)

		if (this.selection !== null)
			throw new Error('Attempting to take a unit but selection is not empty')

		if (hex.kingdom !== this.currentKingdom)
			throw new Error('Attempting to take a unit outside selected kingdom')

		if (!hex.hasUnit())
			throw new Error('Attempting to take a unit but the hex has no unit')

		if (hex.getUnit().played)
			throw new Error('Attempting to take a unit but it has been played')

		this.setSelection(this.world.removeUnitAt(hex))

		this.undoManager.add({
			undo: () => this.placeAt(originHex),
			redo: () => this.takeUnitAt(originHex),
		})
	}

	/**
	 * @param {Hex} originHex
	 */
	placeAt(originHex) {
		const hex = this.world.getHexAt(originHex)

		if (hex === undefined)
			throw new Error('Attempting to place entity at hex but hex is undefined')

		if (this.selection instanceof Unit) {
			this._placeUnitAt(hex)
		} else if (this.selection instanceof Tower) {
			this._placeTowerAt(hex)
		}
	}

	/**
	 * @param {Hex} hex
	 */
	_placeUnitAt(hex) {
		if (hex.kingdom !== this.currentKingdom) {
			this._placeUnitCapture(hex)
		} else {
			this._placeUnitInsideKingdom(hex)
		}
	}

	/**
	 * @param {Hex} hex
	 */
	_placeUnitCapture(hex) {
		// Actions able to be undone
		const undoCallbacks = []

		// The hex should be adjacent to kingdom
		if (!HexUtils.isHexAdjacentKingdom(this.world, hex, this.currentKingdom))
			throw new Error(
				'Trying to capture a hex but hex is not adjacent to kingdom',
			)

		// The hex should have a lower level of protections or level 4 attacker
		const protectingUnits = HexUtils.getProtectingUnits(
			this.world,
			hex,
			this.selection.level,
		)
		if (
			protectingUnits.length > 0 &&
			this.selection.level < Arbiter.UNIT_MAX_LEVEL
		)
			throw new Error(
				'Trying to capture a hex but it has an equal or higher level of protection',
			)

		// Save it if player decided to undo their action
		const lastHexEntity = hex.entity
		const lastHexKingdom = hex.kingdom
		const lastHexPlayer = hex.player

		// If hex has capital, reset its gold
		if (hex.hasCapital()) {
			const lastHexKingdomGold = hex.kingdom.gold
			hex.kingdom.setGold(0)

			undoCallbacks.push(() => hex.kingdom.setGold(lastHexKingdomGold))
		}

		// Place unit from selection to hex
		hex.setEntity(this.selection)
		hex.entity.setPlayed(true)
		this.setSelection(null)

		undoCallbacks.push(() => {
			this.setSelection(hex.entity)
			this.selection.setPlayed(false)
			hex.setEntity(lastHexEntity)
		})

		// Remove the hex from enemy's kingdom
		if (hex.kingdom) {
			hex.kingdom.removeHex(hex)

			undoCallbacks.push(() => hex.kingdom.addHex(hex))

			// Remove kingdom if it only has 1 hex
			if (hex.kingdom.hexs.length < 2) {
				const lastKingdom = hex.kingdom
				const lastKingdomHexs = hex.kingdom.hexs

				hex.kingdom.hexs[0].setKingdom(null)

				undoCallbacks.push(() => {
					hex.kingdom.hexs[0].setKingdom(lastKingdom)
				})

				hex.kingdom.removeHex(hex.kingdom.hexs[0])
				this.world.removeKingdom(hex.kingdom)

				undoCallbacks.push(() => {
					this.world.addKingdom(lastKingdom)
					lastKingdom.addHex(lastKingdomHexs[0])
					lastKingdom.hexs[0].setKingdom(lastKingdom)
				})
			}
		}

		// Set the hex's kingdom to the conqueror's kingdom
		hex.setKingdom(this.currentKingdom)
		hex.setPlayer(this.currentKingdom.player)
		this.currentKingdom.addHex(hex)

		undoCallbacks.push(() => {
			this.currentKingdom.removeHex(hex)
			hex.setPlayer(lastHexPlayer)
			hex.setKingdom(lastHexKingdom)
		})

		undoCallbacks.push(HexUtils.mergeKingdomsOnCapture(this.world, hex))
		undoCallbacks.push(HexUtils.splitKingdomsOnCapture(this.world, hex))

		// Build a new capital for the split and/or merged kingdoms
		undoCallbacks.push(HexUtils.rebuildKingdomsCapital(this.world))
		undoCallbacks.push(TreeUtils.transformSingleHexUnitsToTrees(this.world))

		// Reselect kingdom if it's disappeared because of merging
		if (this.currentKingdom !== hex.kingdom) {
			const lastSelectedKingdom = this.currentKingdom

			this.currentKingdom = hex.kingdom

			undoCallbacks.push(() => {
				this.currentKingdom = lastSelectedKingdom
			})
		}

		this.undoManager.add({
			undo: () => undoCallbacks.reverse().forEach((func) => func()),
			redo: () => this._placeUnitAt(hex),
		})
	}

	/**
	 * @param {Hex} hex
	 */
	_placeUnitInsideKingdom(hex) {
		const undoCallbacks = []

		// Make sure the hex is not reserved by tower or capital
		if (hex.hasCapital())
			throw new Error('Trying to place unit in a hex reserved by a capital')

		if (hex.hasTower())
			throw new Error('Trying to place unit in a hex reserved by a tower')

		// If it already has a unit, merge if possible, throw error otherwise
		if (hex.hasUnit()) {
			if (hex.entity.level + this.selection.level > Arbiter.UNIT_MAX_LEVEL)
				throw new Error(
					'Trying to merge two units but they exceeds the maximum level possible',
				)

			// Merge the unit in the hex and unit in the selection
			const lastUnitSelection = this.selection
			hex.entity.setLevel(hex.entity.level + this.selection.level)
			this.setSelection(null)

			undoCallbacks.push(() => {
				this.setSelection(lastUnitSelection)
				hex.entity.setLevel(hex.entity.level - lastUnitSelection.level)
			})
		} else {
			// The hex has tree or grave, mark the unit as `played`
			if (hex.hasTree() || hex.hasGrave()) this.selection.setPlayed(true)

			const lastUnitSelection = this.selection
			const lastHexEntity = hex.entity
			hex.setEntity(this.selection)
			this.setSelection(null)

			undoCallbacks.push(() => {
				hex.entity.setPlayed(false)
				this.setSelection(lastUnitSelection)
				hex.setEntity(lastHexEntity)
			})
		}

		this.undoManager.add({
			undo: () => undoCallbacks.reverse().forEach((f) => f()),
			redo: () => this._placeUnitAt(hex),
		})
	}

	/**
	 * @param {Hex} hex
	 */
	_placeTowerAt(hex) {
		// Make sure the hex is inside the current kingdom
		if (hex.kingdom !== this.currentKingdom)
			throw new Error('Trying to place tower outside current kingdom')

		// Make sure the hex is clear
		if (hex.entity !== null)
			throw new Error('Trying to place tower at a non-empty area')

		hex.setEntity(this.selection)
		this.setSelection(null)

		this.undoManager.add({
			undo: () => {
				this.setSelection(hex.entity)
				hex.setEntity(null)
			},
			redo: () => this._placeTowerAt(hex),
		})
	}

	/**
	 * @param {Player} player must be this player
	 */
	_checkPlayerSelected() {
		if (this.currentPlayer === null) throw new Error('No player selected')
	}

	_checkKingdomSelected() {
		if (this.currentKingdom === null) throw new Error('No kingdom selected')
		this._checkPlayerSelected()
	}
}
