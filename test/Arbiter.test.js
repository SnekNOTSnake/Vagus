import expect from 'expect'
import Arbiter from '../src/engine/Arbiter'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import Grave from '../src/engine/Grave'
import Kingdom from '../src/engine/Kingdom'
import { generateTestingWorld } from './testUtils'

describe('Arbiter', () => {
	describe('takeUnitAt', () => {
		it('Should put unit in selection and remove it from hex', () => {
			const world = generateTestingWorld('constant-seed-2')
			const hex1 = new Hex(-3, 0, 3)
			const hex2 = new Hex(-4, 1, 3)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)

			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex1)).toBe(unit)

			arbiter.takeUnitAt(hex1)

			expect(arbiter.selection).toBe(unit)
			expect(world.getEntityAt(hex1)).toBeNull()
		})

		it('Should break when no kingdom is selected', () => {
			const world = generateTestingWorld('constant-seed-2')
			const hex1 = new Hex(-3, 0, 3)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.takeUnitAt(hex1)).toThrow(/No kingdom selected/i)
			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex1)).toBe(unit)
		})
	})

	describe('placeAt', () => {
		it('Should place a unit from selection to a same-kingdom hex', () => {
			const world = generateTestingWorld('constant-seed-2')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 2, -1)
			const unit = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)

			expect(world.getEntityAt(hex1)).toBeNull()

			arbiter.setSelection(unit)
			arbiter.placeAt(hex1)

			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex1)).toBe(unit)
		})

		it('Should can no longer move when upgrading a played unit', () => {
			const world = generateTestingWorld('constant-seed-2')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, 1, -1)
			const unit1 = new Unit()
			const unit2 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			unit1.setPlayed(true)
			world.setEntityAt(hex1, unit1)

			expect(world.getEntityAt(hex1)).toBe(unit1)

			arbiter.setSelection(unit2)
			arbiter.placeAt(hex1)

			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex1).level).toBe(2)
			expect(world.getEntityAt(hex1).played).toBe(true)
			expect(() => arbiter.takeUnitAt(hex1)).toThrow(
				/Attempting to take a unit but it has been played/i,
			)
		})

		it('Can capture a single new hex and unit cannot move again', () => {
			const world = generateTestingWorld('constant-seed-2')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, 0, -1)
			const hex2 = new Hex(2, -1, -1)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(true)
			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getHexAt(hex2).player).toBe(arbiter.currentPlayer)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(true)
		})

		it('Can not capture a hex not neighbour to kingdom', () => {
			const world = generateTestingWorld('constant-seed-2')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, 0, -1)
			const hex2 = new Hex(3, -2, -1)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)

			expect(() => arbiter.placeAt(hex2)).toThrow(
				/Trying to capture a hex but hex is not adjacent to kingdom/i,
			)
			expect(arbiter.selection).toBe(unit1)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(false)
		})

		it("Can merge a single player's hex to our kingdom when linked", () => {
			const world = generateTestingWorld('constant-seed-2')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(3, -1, -2)
			const hex2 = new Hex(3, 0, -3)
			const hex3 = new Hex(4, 0, -4)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getHexAt(hex3).kingdom).toBe(kingdom)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(true)
			expect(kingdom.hexs.includes(world.getHexAt(hex3))).toBe(true)
		})

		it('Can merge two kingdoms to a single one, with money of these two kingdoms', () => {
			const world = generateTestingWorld('constant-seed-2')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -1, -1)
			const hex3 = new Hex(3, -1, -2)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)
			const kingdomsGoldSum = world.getKingdomAt(hex3).gold + kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(kingdom.hexs).toHaveLength(6)
			expect(kingdom.gold).toBe(kingdomsGoldSum)
		})

		it('Merge two kingdoms together without duplicating the kingdom that has two adjacents hexs to the captured hex', () => {
			const world = generateTestingWorld('constant-seed-9')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, -2, 3)
			const hex2 = new Hex(-1, -1, 2)
			const hex3 = new Hex(-1, 0, 1)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)
			const kingdomsGoldSum = world.getKingdomAt(hex3).gold + kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(kingdom.gold).toBe(kingdomsGoldSum)
			expect(kingdom.hexs).toHaveLength(7)
			expect(world.getKingdomAt(hex1)).toBe(kingdom)
			expect(world.getKingdomAt(hex2)).toBe(kingdom)
			expect(world.getKingdomAt(hex3)).toBe(kingdom)
		})

		it('Always keep the current kingdom selected when merging current kingdom to a bigger one', () => {
			const world = generateTestingWorld('constant-seed-9')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, -2, 3)
			const hex2 = new Hex(-1, -1, 2)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(arbiter.currentKingdom).toBe(kingdom)
		})

		it('Can capture a hex from an opponent kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, 0, -2)
			const hex2 = new Hex(1, -1, 0)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(true)
			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getHexAt(hex2).player).toBe(arbiter.currentPlayer)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(true)
		})

		it('Cannot capture a hex protected by opponent', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, 0, -2)
			const hex2 = new Hex(3, -2, -1)
			const unit1 = new Unit()
			const unit2 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			world.setEntityAt(hex2, unit2)

			expect(() => arbiter.placeAt(hex2)).toThrow(
				/Trying to capture a hex but it has an equal or higher level of protection/i,
			)
			expect(arbiter.selection).toBe(unit1)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(false)
		})

		it('Cannot kill an opponent unit if same level (and not level 4)', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, 0, -2)
			const hex2 = new Hex(3, -2, -1)
			const unit1 = new Unit(1)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			world.setEntityAt(hex2, unit2)

			expect(() => arbiter.placeAt(hex2)).toThrow(
				/Trying to capture a hex but it has an equal or higher level of protection/i,
			)
			expect(arbiter.selection).toBe(unit1)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(false)
		})

		it('Split opponent kingdom in two little kingdoms when cutting', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, -2, 1)
			const hex2 = new Hex(0, -1, 1)
			const subKingdomHex1 = new Hex(1, -1, 0)
			const subKingdomHex2 = new Hex(-2, 1, 1)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getKingdomAt(subKingdomHex1)).toBeInstanceOf(Kingdom)
			expect(world.getKingdomAt(subKingdomHex2)).toBeInstanceOf(Kingdom)
			expect(world.getKingdomAt(subKingdomHex2)).not.toBe(
				world.getKingdomAt(subKingdomHex1),
			)
		})

		it('Split opponent kingdom in two single hexs and kill main kingdom if kingdom has only 3 hexs', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 1, 1)
			const hex2 = new Hex(-4, 2, 2)
			const subKingdomHex1 = new Hex(-4, 1, 3)
			const subKingdomHex2 = new Hex(-4, 3, 1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(world.kingdoms.includes(opponentKingdom)).toBe(false)
			expect(world.getHexAt(subKingdomHex1).kingdom).toBeNull()
			expect(world.getHexAt(subKingdomHex2).kingdom).toBeNull()
		})

		it('Kill opponent 2-hex kingdom if I capture one of them', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 3, -2)
			const hex2 = new Hex(0, 3, -3)
			const subKingdomHex1 = new Hex(1, 3, -4)
			const unit1 = new Unit(2)
			const opponentKingdom = world.getKingdomAt(hex2)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.kingdoms.includes(opponentKingdom)).toBe(false)
			expect(world.getHexAt(subKingdomHex1).kingdom).toBeNull()
		})

		it('Can capture hexs protected by level 4 unit with level 4 unit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -2, -1)
			const unit1 = new Unit(4)
			const unit2 = new Unit(4)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex2, unit2)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(true)
		})
	})

	describe('takeUnitAt and placeAt', () => {
		it('Just moving a unit should still having a move', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 0, 1)
			const hex2 = new Hex(2, -2, 0)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)

			world.setEntityAt(hex1, unit1)
			expect(world.getEntityAt(hex1)).toBe(unit1)

			arbiter.takeUnitAt(hex1)
			expect(world.getEntityAt(hex1)).toBeNull()
			expect(arbiter.selection).toBe(unit1)

			arbiter.placeAt(hex2)

			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(false)
		})
	})

	describe('buyUnit', () => {
		it('Must decrease kingdom money', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 1, 1)
			const kingdom = world.getKingdomAt(hex1)
			const previousGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.buyUnit()

			expect(kingdom.gold).toBe(previousGold - Arbiter.UNIT_PRICE)
			expect(arbiter.selection).toBeInstanceOf(Unit)
		})

		it('Should upgrade selected unit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 1, 1)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const previousKingdomGold = kingdom.gold
			const previousUnitLevel = unit1.level

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.buyUnit()

			expect(kingdom.gold).toBe(previousKingdomGold - Arbiter.UNIT_PRICE)
			expect(arbiter.selection.level).toBe(previousUnitLevel + 1)

			arbiter.buyUnit()

			expect(kingdom.gold).toBe(previousKingdomGold - Arbiter.UNIT_PRICE * 2)
			expect(arbiter.selection.level).toBe(previousUnitLevel + 2)
		})

		it('Throw error when not enough money', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 1, 1)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			kingdom.setGold(5)

			expect(() => arbiter.buyUnit()).toThrow(
				/Trying to buy unit but not enough gold/i,
			)
			expect(kingdom.gold).toBe(5)
			expect(arbiter.selection).toBeNull()
		})

		it('Throw error when selection already have a max level unit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 1, 1)
			const unit1 = new Unit(4)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)

			expect(() => arbiter.buyUnit()).toThrow(
				/Trying to buy unit but selection has the maximum level/i,
			)
			expect(arbiter.selection.level).toBe(4)
		})
	})

	describe('buyUnit and placeAt', () => {
		it('Can buy and place a powerful unit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 0, 1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.buyUnit()
			arbiter.buyUnit()
			arbiter.placeAt(hex1)

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex1).level).toBe(2)
			expect(world.getEntityAt(hex1).played).toBe(false)
		})

		it('Cannot move a unit to another owned kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, 0, -2)
			const hex2 = new Hex(-1, -3, 4)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.buyUnit()

			expect(() => arbiter.placeAt(hex2)).toThrow(
				/Trying to capture a hex but hex is not adjacent to kingdom/i,
			)
			expect(world.getHexAt(hex2).entity).toBeNull()
			expect(arbiter.selection).toBeInstanceOf(Unit)
		})
	})

	describe('smartAction', () => {
		it('Selects kingdom AND takes unit when clicking on a unit in another kingdom, and not only selects kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, -3, 4)
			const hex2 = new Hex(2, -1, -1)
			const unit1 = new Unit()
			const kingdom1 = world.getKingdomAt(hex1)
			const kingdom2 = world.getKingdomAt(hex2)

			arbiter.setCurrentPlayer(kingdom1.player)
			arbiter.setCurrentKingdom(kingdom1)
			world.setEntityAt(hex2, unit1)
			arbiter.smartAction(hex2)

			expect(arbiter.currentKingdom).toBe(kingdom2)
			expect(arbiter.selection).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBeNull()
		})

		it('Moves a unit in kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, 0, -3)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			arbiter.smartAction(hex1)
			expect(arbiter.selection).toBe(unit1)
			expect(world.getEntityAt(hex1)).toBeNull()

			arbiter.smartAction(hex2)
			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(false)
		})

		it('Captures a hex', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, 1, -3)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			arbiter.smartAction(hex1)
			arbiter.smartAction(hex2)

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getHexAt(hex2).player).toBe(arbiter.currentPlayer)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(true)
			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(true)
		})

		it('Can capture a hex from an opponent kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(1, -1, 0)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			arbiter.smartAction(hex1)
			arbiter.smartAction(hex2)

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getHexAt(hex2).player).toBe(arbiter.currentPlayer)
			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(true)
			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(true)
		})

		it('Selects kingdom even if I click on a hex with an unit that has already moved this turn', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(-1, -3, 4)
			const unit1 = new Unit()
			unit1.setPlayed(true)
			const kingdom1 = world.getKingdomAt(hex1)
			const kingdom2 = world.getKingdomAt(hex2)

			arbiter.setCurrentPlayer(kingdom1.player)
			arbiter.setCurrentKingdom(kingdom1)
			world.setEntityAt(hex2, unit1)
			arbiter.smartAction(hex2)

			expect(arbiter.currentKingdom).toBe(kingdom2)
			expect(arbiter.selection).toBe(null)
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(true)
			expect(() => arbiter.smartAction(hex2)).toThrow(
				/Attempting to take a unit but it has been played/i,
			)
		})
	})

	describe('endTurn', () => {
		it('Should reset units moved', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(1)
			unit1.setPlayed(true)
			const unit2 = new Unit(1)
			unit2.setPlayed(true)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1).played).toBe(false)
			expect(world.getEntityAt(hex2).played).toBe(false)
		})

		it('Kills units if not enough money to pay them', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(4)
			const unit2 = new Unit(4)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getHexAt(hex1).entity).toBeInstanceOf(Grave)
			expect(world.getHexAt(hex2).entity).toBeInstanceOf(Grave)
		})

		it('Keeps a trace of kingdom economy', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(1)
			const unit2 = new Unit(2)
			const unit1cost = unit1.getUnitMaintenanceCost()
			const unit2cost = unit2.getUnitMaintenanceCost()
			const kingdom = world.getKingdomAt(hex1)
			let lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(kingdom.gold).toBe(
				lastKingdomGold + kingdom.getIncome() - kingdom.getOutcome(),
			)
			expect(kingdom.getIncome()).toBe(5)
			expect(kingdom.getOutcome()).toBe(unit1cost + unit2cost)

			lastKingdomGold = kingdom.gold
			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(kingdom.gold).toBe(
				lastKingdomGold + kingdom.getIncome() - kingdom.getOutcome(),
			)
			expect(kingdom.getIncome()).toBe(5)
			expect(kingdom.getOutcome()).toBe(unit1cost + unit2cost)
		})

		it('keeps a trace of kingdom economy when units die', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(4)
			const unit2 = new Unit(4)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Grave)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Grave)
			expect(kingdom.gold).toBe(0)
			expect(kingdom.getIncome()).toBe(3)
			expect(kingdom.getOutcome()).toBe(0)
		})
	})
})
