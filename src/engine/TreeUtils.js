import { TREE_COASTAL, TREE_CONTINENTAL } from '../constants/variables'
import HexUtils from './HexUtils'
import Tree from './Tree'

/**
 * @typedef {import('./Hex').default} Hex
 * @typedef {import('./Tree').default} Tree
 * @typedef {import('./World').default} World
 * @typedef {import('./worldConfig').default} Config
 */
export default class TreeUtils {
	/**
	 * @param {World} world
	 * @param {Hex} hex
	 *
	 * @returns {Tree}
	 */
	static spawnTreeOnWorldHex(world, hex) {
		const type = HexUtils.isHexCoastal(world, hex)
			? TREE_COASTAL
			: TREE_CONTINENTAL
		const tree = hex.setEntity(new Tree(type))
		return tree
	}

	/**
	 * Spawn some trees at the beginning of the world
	 *
	 * @param {World} world
	 */
	static spawnInitialTrees(world) {
		world.hexs
			.filter((hex) => hex.entity === null)
			.forEach((hex) => {
				if (world.config.treesInitialSpawnProbability > world.config.random())
					this.spawnTreeOnWorldHex(world, hex)
			})
	}

	/**
	 * Grow the trees!
	 *
	 * @param {World} world
	 * @param {Config} config
	 */
	static spawnTrees(world) {
		this.spawnCoastalTrees(world)
		this.spawnContinentalTrees(world)
	}

	/**
	 * @param {World} world
	 */
	static spawnCoastalTrees(world) {
		const potentialSpawn = []

		world.hexs
			.filter((hex) => HexUtils.isHexCoastal(world, hex))
			.filter((hex) => hex.hasTree())
			.forEach((hex) =>
				HexUtils.neighbourHexs(world, hex)
					.filter((neighbourHex) => HexUtils.isHexCoastal(world, neighbourHex))
					.filter((neighbourHex) => neighbourHex.entity === null)
					.forEach((neighbourHex) => potentialSpawn.push(neighbourHex)),
			)

		potentialSpawn
			.filter(() => {
				const probability = this.getProbability(
					world,
					world.config.coastalTreesGrowMaxProbability,
				)
				return Math.random() < probability
			})
			.forEach((hex) => this.spawnTreeOnWorldHex(world, hex))
	}

	/**
	 * @param {World} world
	 */
	static spawnContinentalTrees(world) {
		const potentialSpawn = []

		world.hexs
			.filter((hex) => hex.hasTree())
			.forEach((hex) =>
				HexUtils.neighbourHexs(world, hex)
					.filter((neighbourHex) => !HexUtils.isHexCoastal(world, neighbourHex))
					.filter((neighbourHex) => neighbourHex.entity === null)
					.forEach((neighbourHex) => potentialSpawn.push(neighbourHex)),
			)

		potentialSpawn
			.filter(() => {
				const probability = this.getProbability(
					world,
					world.config.continentalTreesGrowMaxProbability,
				)
				return world.config.random() < probability
			})
			.forEach((hex) => this.spawnTreeOnWorldHex(world, hex))
	}

	/**
	 * @param {World} world
	 * @param {Number} maxProbability
	 */
	static getProbability(world, maxProbability) {
		return (
			((1 - Math.E ** (-world.turn * world.config.treesGrowOverTime)) *
				maxProbability) /
			world.config.players.length
		)
	}

	/**
	 * Transforms capital and/or units in a single hex into a tree
	 *
	 * @param {World} world
	 *
	 * @returns {Func}
	 */
	static transformSingleHexUnitsToTrees(world) {
		const undoCallbacks = []

		world.hexs
			.filter((hex) => hex.hasCapital() || hex.hasUnit())
			.filter((hex) => !hex.kingdom)
			.forEach((hex) => {
				const hexLastEntity = hex.entity
				TreeUtils.spawnTreeOnWorldHex(world, hex)

				undoCallbacks.push(() => {
					hex.setEntity(hexLastEntity)
				})
			})

		return () => undoCallbacks.reverse().forEach((func) => func())
	}
}
