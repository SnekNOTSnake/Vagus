import expect from 'expect'
import {
	generateMoveZone,
	generateSimpleMoveZone,
} from '../../src/utils/helpers'
import { generateTestingWorld } from '../testUtils'
import Hex from '../../src/engine/Hex'
import Arbiter from '../../src/engine/Arbiter'
import Player from '../../src/engine/Player'
import { AiTest } from '../../src/engine/ai/AiTest'
import TreeUtils from '../../src/engine/TreeUtils'
import Unit from '../../src/engine/Unit'
import Tree from '../../src/engine/Tree'
import Tower from '../../src/engine/Tower'
import Grave from '../../src/engine/Grave'
import { UNIT_MOVE_STEPS } from '../../src/constants/variables'

const players = [
	new AiTest(), // Blue (0)
	new Player(), // Red (1)
	new Player(),
	new Player(),
	new Player(),
	new Player(),
]

describe('ArtificialIntelligence', () => {
	describe('cleanCoastalTrees', () => {
		it('Should make the selected hex unit cleans a coastal tree, not continental', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(0, -4, 4)
			const hex3 = new Hex(2, -3, 1)
			const unit1 = new Unit(1)
			const ai = arbiter.currentPlayer
			const moveZone = generateMoveZone(
				world,
				world.getHexAt(hex1),
				1,
				UNIT_MOVE_STEPS,
			)

			world.setEntityAt(hex1, unit1)
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex2))
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex3))
			ai.cleanCoastalTrees(arbiter, moveZone, world.getHexAt(hex1))

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex3)).toBeInstanceOf(Tree)
		})
	})

	describe('cleanContinentalTrees', () => {
		it('Should make the selected hex unit clean a continental tree, not coastal', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const hex3 = new Hex(0, -4, 4)
			const unit1 = new Unit(1)
			const ai = arbiter.currentPlayer
			const moveZone = generateMoveZone(
				world,
				world.getHexAt(hex1),
				1,
				UNIT_MOVE_STEPS,
			)

			world.setEntityAt(hex1, unit1)
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex2))
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex3))
			ai.cleanContinentalTrees(arbiter, moveZone, world.getHexAt(hex1))

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex3)).toBeInstanceOf(Tree)
		})
	})

	describe('findMostAttractiveHexForWitch', () => {
		it('Should attack direct tower than a hex protected by tower', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -2, 1)
			const hex3 = new Hex(1, 0, -1)
			const tower1 = new Tower()
			const tower2 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex2, tower1)
			world.setEntityAt(hex3, tower2)

			const unitLevel = 3
			const attackableHexs = generateSimpleMoveZone(world, kingdom, unitLevel)
			const target = ai.findMostAttractiveHexForWitch(
				world,
				attackableHexs,
				unitLevel,
			)

			expect(target).toBe(world.getHexAt(hex2))
		})

		it('Should attack a hex protected by tower', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, 0, -1)
			const hex3 = new Hex(2, -1, -1)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex2, tower1)

			const unitLevel = 3
			const attackableHexs = generateSimpleMoveZone(world, kingdom, unitLevel)
			const target = ai.findMostAttractiveHexForWitch(
				world,
				attackableHexs,
				unitLevel,
			)

			expect(target).toBe(world.getHexAt(hex3))
		})
	})

	describe('findMostAttractiveHex', () => {
		it('Should target a tower related hexs', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -2, 1)
			const hex3 = new Hex(1, 0, -1)
			const tower1 = new Tower()
			const tower2 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex2, tower1)
			world.setEntityAt(hex3, tower2)

			const unitLevel = 3
			const attackableHexs = generateSimpleMoveZone(world, kingdom, unitLevel)
			const target = ai.findMostAttractiveHex(
				world,
				attackableHexs,
				kingdom,
				unitLevel,
			)

			expect(target).toBe(world.getHexAt(hex2))
		})

		it('Should target a hex that surrounded by most of ally hexs if it has lower level', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -2, 1)
			const hex3 = new Hex(1, -3, 2)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex2, tower1)

			const unitLevel = 2
			const attackableHexs = generateSimpleMoveZone(world, kingdom, unitLevel)
			const target = ai.findMostAttractiveHex(
				world,
				attackableHexs,
				kingdom,
				unitLevel,
			)

			expect(target).toBe(world.getHexAt(hex3))
		})
	})

	describe('decideAboutUnit', () => {})

	describe('findHexThatNeedsTower', () => {
		it('Should find a hex that if a tower is there, it would give 5 hexs protections', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -3, 2)
			const hex3 = new Hex(0, -2, 2)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			// Conquer the crucial hex first XD
			const unit1 = new Unit(1)
			world.setEntityAt(hex1, unit1)
			arbiter.moveUnit(hex1, hex2)
			for (let i = 0; i < players.length; i += 1) {
				arbiter.endTurn()
			}
			arbiter.moveUnit(hex2, hex3)

			// Only then find the hex
			const target = ai.findHexThatNeedsTower(world, kingdom)

			expect(target).toBe(world.getHexAt(hex2))
		})
	})

	describe('tryToBuildTowers', () => {
		it('Should build tower in a hex that if a tower is there, it would give 5 hexs protections', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -3, 2)
			const hex3 = new Hex(0, -2, 2)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			// Conquer the crucial hex first XD
			const unit1 = new Unit(1)
			world.setEntityAt(hex1, unit1)
			arbiter.moveUnit(hex1, hex2)
			for (let i = 0; i < players.length; i += 1) {
				arbiter.endTurn()
			}
			arbiter.moveUnit(hex2, hex3)

			// Only then try build the tower
			ai.tryToBuildTowers(arbiter, kingdom)

			expect(world.getEntityAt(hex2)).toBeInstanceOf(Tower)
		})

		it('Should not build tower in any hex if not enough gold', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -3, 2)
			const hex3 = new Hex(0, -2, 2)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(0)
			const ai = arbiter.currentPlayer

			// Conquer the crucial hex first XD
			const unit1 = new Unit(1)
			world.setEntityAt(hex1, unit1)
			arbiter.moveUnit(hex1, hex2)
			for (let i = 0; i < players.length; i += 1) {
				arbiter.endTurn()
			}
			arbiter.moveUnit(hex2, hex3)

			// Only then try build the tower
			ai.tryToBuildTowers(arbiter, kingdom)

			expect(kingdom.hexs.some((hex) => hex.hasTower())).toBe(false)
		})

		it('Should not build tower in any hex if no suitable place', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -3, 2)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			// Conquer the crucial hex first XD
			const unit1 = new Unit(1)
			world.setEntityAt(hex1, unit1)
			arbiter.moveUnit(hex1, hex2)
			for (let i = 0; i < players.length; i += 1) {
				arbiter.endTurn()
			}
			arbiter.moveUnit(hex2, hex1)

			// Only then try build the tower
			ai.tryToBuildTowers(arbiter, kingdom)

			expect(kingdom.hexs.some((hex) => hex.hasTower())).toBe(false)
		})
	})

	describe('tryToBuildUnitsOnCoastalTrees', () => {
		it('Should build a level 1 unit on every kingdom coastal trees if possible', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, -4, 4)
			const hex2 = new Hex(2, -4, 2)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(20)
			const ai = arbiter.currentPlayer

			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex1))
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex2))
			ai.tryToBuildUnitsOnCoastalTrees(arbiter, kingdom)

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
		})

		it('Should only build a level 1 unit on kingdom coastal trees, not continental', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, -4, 4)
			const hex2 = new Hex(0, -3, 3)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(20)
			const ai = arbiter.currentPlayer

			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex1))
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex2))
			ai.tryToBuildUnitsOnCoastalTrees(arbiter, kingdom)

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Tree)
		})
	})

	describe('canAiAffordBuildUnit', () => {
		it("Should be able to calculate the survivalability of kingdom if it's about to buy more unit", () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, -4, 4)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(50)
			const ai = arbiter.currentPlayer
			const levelToBuy = 3

			expect(ai.canAiAffordBuildUnit(kingdom, levelToBuy, 1)).toBe(true)

			arbiter.buyUnitTowardsHex(hex1, kingdom, levelToBuy)
			// End turn 1 time
			for (let i = 0; i < players.length; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Unit)
		})

		it("Should be able to calculate the survivalability of kingdom if it's about to buy more unit, with further world turns", () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, -4, 4)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(50)
			const ai = arbiter.currentPlayer
			const levelToBuy = 3
			const turns = 2

			expect(ai.canAiAffordBuildUnit(kingdom, levelToBuy, turns)).toBe(false)

			arbiter.buyUnitTowardsHex(hex1, kingdom, levelToBuy)
			// End turn 2 times
			for (let i = 0; i < players.length * turns; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Grave)
		})
	})

	describe('canAiAffordMergeUnit', () => {
		it("Should be able to calculate the survivalability of kingdom if it's about to merge units", () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(20)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			expect(
				ai.canAiAffordMergeUnit(world.getHexAt(hex1), world.getHexAt(hex2), 1),
			).toBe(true)

			arbiter.moveUnit(hex1, hex2)
			// End turn 1 time
			for (let i = 0; i < players.length; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex2).level).toBe(3)
		})

		it("Should be able to calculate the survivalability of kingdom if it's about to merge units, with further world turns", () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(20)
			const ai = arbiter.currentPlayer
			const turns = 2

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			expect(
				ai.canAiAffordMergeUnit(
					world.getHexAt(hex1),
					world.getHexAt(hex2),
					turns,
				),
			).toBe(false)

			arbiter.moveUnit(hex1, hex2)
			// End turn 2 times
			for (let i = 0; i < players.length * turns; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex2)).toBeInstanceOf(Grave)
		})
	})

	describe('tryToAttackWithBoughtUnit', () => {
		it('Should able to build a level 3 unit on most attracting hex', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, -4, 4)
			const hex2 = new Hex(1, -2, 1)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(50)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex2, tower1)
			ai.tryToAttackWithBoughtUnit(arbiter, kingdom, 3)

			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
		})
	})

	describe('tryToBuildUnitsToAttack', () => {
		it('Should build units necessary, starting from level 1 to attack unprotected hexs with high allure', () => {
			const world = generateTestingWorld('constant-seed-18', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 4, -3)
			const hex2 = new Hex(-2, 4, -2)
			const hex3 = new Hex(-2, 3, -1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(20)
			const ai = arbiter.currentPlayer

			ai.tryToBuildUnitsToAttack(arbiter, kingdom)

			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex3)).toBeInstanceOf(Unit)
		})

		it('Should build units necessary, build level 2 units to attack underprotected hexs', () => {
			const world = generateTestingWorld('constant-seed-18', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 4, -3)
			const hex2 = new Hex(-2, 4, -2)
			const hex3 = new Hex(1, 3, -4)
			const hex4 = new Hex(-1, 3, -2)
			const hex5 = new Hex(0, 3, -3)
			const tower1 = new Tower()
			const tower2 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(50)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex2, tower1)
			world.setEntityAt(hex3, tower2)
			ai.tryToBuildUnitsToAttack(arbiter, kingdom)

			expect(world.getEntityAt(hex4)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex5)).toBeInstanceOf(Unit)
		})

		it('Should build units necessary, build level 3 units to attack strong points', () => {
			const world = generateTestingWorld('constant-seed-18', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 4, -3)
			const hex2 = new Hex(-1, 3, -2)
			const hex3 = new Hex(-2, 4, -2)
			const hex4 = new Hex(1, 3, -4)
			const tower1 = new Tower()
			const tower2 = new Tower()
			const tower3 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(100)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex2, tower1)
			world.setEntityAt(hex3, tower2)
			world.setEntityAt(hex4, tower3)
			ai.tryToBuildUnitsToAttack(arbiter, kingdom)

			const checkPredicat = () => {
				let towerCaptured = 0

				if (world.getEntityAt(hex2) instanceof Unit) towerCaptured += 1
				if (world.getEntityAt(hex3) instanceof Unit) towerCaptured += 1
				if (world.getEntityAt(hex4) instanceof Unit) towerCaptured += 1

				return towerCaptured === 2
			}

			expect(checkPredicat()).toBe(true)
		})
	})

	describe('tryToBuildUnits', () => {
		it("Should ignore the condition where kingdom should be able to afford new unit if it's a kingdom kickstart", () => {
			const world = generateTestingWorld('constant-seed-2', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, -2, 1)
			const hex2 = new Hex(2, -1, -1)
			const hex3 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex1))
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex3))
			ai.tryToBuildUnits(arbiter, kingdom)

			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex1)).toBeInstanceOf(Tree)
			expect(world.getEntityAt(hex3)).toBeInstanceOf(Tree)
		})
	})

	describe('tryToBuildUnitInsideKingdom', () => {
		it('Should builds a unit inside kingdom', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(30)
			const ai = arbiter.currentPlayer

			const result = ai.tryToBuildUnitInsideKingdom(arbiter, kingdom, 2)

			expect(
				kingdom.hexs.some((hex) => hex.hasUnit() && hex.entity.level === 2),
			).toBe(true)
			expect(result).toBe(true)
		})

		it('Should not build a unit to be merged with the others', () => {
			const world = generateTestingWorld('constant-seed-18', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 4, -3)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(30)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			const result = ai.tryToBuildUnitInsideKingdom(arbiter, kingdom, 2)

			expect(
				kingdom.hexs.some((hex) => hex.hasUnit() && hex.entity.level === 1),
			).toBe(true)
			expect(
				kingdom.hexs.some((hex) => hex.hasUnit() && hex.entity.level === 2),
			).toBe(false)
			expect(result).toBe(false)
		})
	})

	describe('tryToMergeWithSomeone', () => {
		it('Should make the selected hex unit merge with someone if possible', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(50)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			ai.tryToMergeWithSomeone(arbiter, world.getHexAt(hex1))

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex2).level).toBe(3)
		})

		it('Should only merge with someone if kingdom can afford it', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(10)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			ai.tryToMergeWithSomeone(arbiter, world.getHexAt(hex1))

			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBe(unit2)
		})

		it('Should only merge with someone if the merged level is still in max unit level', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(3)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(60)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			ai.tryToMergeWithSomeone(arbiter, world.getHexAt(hex1))

			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBe(unit2)
		})
	})

	describe('mergableCondition', () => {
		it('Should return true if kingdom cannot afford merging', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(1)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(60)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			expect(
				ai.mergableCondition(world.getHexAt(hex1), world.getHexAt(hex2)),
			).toBe(true)
		})

		it('Should return false if kingdom cannot afford merging', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(20)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			expect(
				ai.mergableCondition(world.getHexAt(hex1), world.getHexAt(hex2)),
			).toBe(false)
		})
	})

	describe('spendMoneyAndMergeUnits', () => {
		it('Should build a unit and attack someone on first turn', () => {
			const world = generateTestingWorld('constant-seed-5', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(-1, -3, 4)
			const kingdom1 = world.getKingdomAt(hex1)
			const kingdom2 = world.getKingdomAt(hex2)
			const ai = arbiter.currentPlayer

			expect(kingdom1.hexs.length).toBe(5)
			expect(kingdom2.hexs.length).toBe(2)

			ai.spendMoneyAndMergeUnits(arbiter, kingdom1)
			ai.spendMoneyAndMergeUnits(arbiter, kingdom2)

			expect(kingdom1.hexs.length).toBe(7) // 7 because of allure and merging
			expect(kingdom2.hexs.length).toBe(4) // 4 because of allure and merging
			expect(kingdom1.hexs.some((hex) => hex.hasUnit())).toBe(true)
			expect(kingdom2.hexs.some((hex) => hex.hasUnit())).toBe(true)
		})
	})
})
