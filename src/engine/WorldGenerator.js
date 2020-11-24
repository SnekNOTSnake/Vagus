import Seedrandom from 'seedrandom'
import { GridGenerator } from 'react-hexgrid'
import diamondSquare from './diamondSquare'
import Hex from './Hex'
import HexUtils from './HexUtils'
import Kingdom from './Kingdom'
import World from './World'
import worldConfig from './worldConfig'
import HumanPlayer from './HumanPlayer'
import AIPlayer from './AIPlayer'
import TreeUtils from './TreeUtils'

const defaultPlayers = [
	new HumanPlayer(),
	new AIPlayer(),
	new AIPlayer(),
	new AIPlayer(),
	new AIPlayer(),
	new AIPlayer(),
]

/**
 * @typedef {World} World
 * @typedef {String|Number} Seed
 * @typedef {Kingdom} Kingdom
 * @typedef {Hex} Hex
 */
export default class WorldGenerator {
	/**
	 * @param {Seed} seed Seed to generate island and random events (trees...)
	 * @param {Object} customConfig World generation config
	 *
	 * @returns {World}
	 */
	static generate(seed = null, customConfig = {}) {
		const config = { ...worldConfig, ...customConfig }
		// `seedrandom(seed)` generates a function
		config.random = new Seedrandom(seed)

		const worldHexsLength =
			Math.floor((config.size * 8) / config.players.length) *
			config.players.length

		const depth = 8
		const pixels = 2 ** depth + 1
		const roughness = Math.log(config.size)
		const heights = diamondSquare(depth, true, roughness, config.random)
		let worldHexs = []
		const hexs = []
		const hexsMap = new Map()
		const sortByHeight = (hexA, hexB) => {
			return hexB._height - hexA._height
		}

		// R
		for (let r = -config.size; r < config.size; r += 1) {
			// eslint-disable-next-line no-bitwise
			const offset = r >> 1
			let qIndex = 0
			// Q
			for (let q = -offset - config.size; q < config.size - offset; q += 1) {
				const { x, y } = { x: qIndex, y: r + config.size }
				const pixel = {
					x: Math.floor((pixels * x) / (config.size * 2)),
					y: Math.floor((pixels * y) / (config.size * 2)),
				}

				const hex = new Hex(q, r, -q - r)
				hex._height = heights[pixel.x][pixel.y]

				hexs.push(hex)

				qIndex += 1
			}
		}

		for (let i = 0; i < hexs.length; i += 1) {
			const hex = hexs[i]
			hexsMap.set(HexUtils.getID(hex), hex)
		}

		hexs.sort(sortByHeight)

		worldHexs.push(hexs[0])

		do {
			const adjacentHexs = HexUtils.getHexsAdjacentToHexs(worldHexs)
				.map((hex) => hexsMap.get(HexUtils.getID(hex)))
				.filter((hex) => hex !== undefined)

			adjacentHexs.sort(sortByHeight)

			worldHexs = worldHexs.concat(adjacentHexs.slice(0, config.players.length))
		} while (worldHexs.length < worldHexsLength)

		for (let i = 0; i < worldHexs.length; i += 1) {
			delete worldHexs[1]._height
		}

		// Create the world
		const world = new World(worldHexs, config)

		this.setPlayerColors(config.players)
		this.setRandomHexColor(world)
		this.initKingdoms(world)
		this.initCapitals(world)
		this.initKingdomsGold(world)
		TreeUtils.spawnInitialTrees(world)

		return world
	}

	/**
	 * Setting players' color based on its index (color 0, color 1, color 2 ...)
	 *
	 * @param {Players[]} players
	 */
	static setPlayerColors(players) {
		players.forEach((player, i) => player.setColor(i))
	}

	/**
	 * It works by pointing a random hex,
	 * and then set its `player` to player 0, 1, 2, 3, and back to 0, 1, 2, 3 ...
	 *
	 * @param {World} world
	 */
	static setRandomHexColor(world) {
		const { hexs } = world
		const { players } = world.config
		// Random `0 - hexs.length` contained array
		const array = this._shuffle(
			Array.from(new Array(hexs.length).keys()),
			world.config.random,
		)

		// Point to a random hex, and then set its player
		hexs.forEach((_, i) => {
			const player = players[i % players.length]
			hexs[array[i]].setPlayer(player)
		})
	}

	/**
	 * Make the "2 or more adjacent same player hexs" to form a kingdom
	 *
	 * @param {World} world
	 */
	static initKingdoms(world) {
		const { hexs } = world

		hexs.forEach((hex) => {
			if (hex.kingdom) return

			const adjacentSameHexs = HexUtils.getAdjacentSameKingdomHexs(world, hex)
			if (adjacentSameHexs.length < 2) return

			const kingdom = new Kingdom(adjacentSameHexs)
			world.addKingdom(kingdom)
			adjacentSameHexs.forEach((sameHex) => sameHex.setKingdom(kingdom))
		})
	}

	/**
	 * Create capitals for each kingdoms
	 *
	 * @param {World} world
	 */
	static initCapitals(world) {
		const { kingdoms } = world

		kingdoms.forEach((kingdom) => HexUtils.createKingdomCapital(world, kingdom))
	}

	/**
	 * Just a regular array shuffler
	 *
	 * @param {Any[]} array
	 * @param {Function} random A function to generate random number, 0 - 1
	 *
	 * @returns {Any[]}
	 */
	static _shuffle(array, random) {
		const newArr = array.slice()

		for (let i = newArr.length - 1; i > 0; i -= 1) {
			const rand = Math.floor(random() * (i + 1))
			;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
		}
		return newArr
	}

	/**
	 * Initialize balances for all kingdoms
	 *
	 * @param {World} world
	 */
	static initKingdomsGold(world) {
		const { kingdoms } = world

		kingdoms.forEach((kingdom) => {
			kingdom.setGold(kingdom.getIncome() * 5)
		})
	}

	/**
	 * For testing purpose.
	 * Generates a pointy-hexagon world with a total of 60 small hexs.
	 *
	 * @param {Player[]} players
	 * @param {Seed} seed
	 */
	static generateHexagonWorldNoInitialTree(seed, players = defaultPlayers) {
		const hexs = this.hexagonWorld(4)
		const world = new World(hexs, {
			...worldConfig,
			players,
			random: Seedrandom(seed),
		})

		this.setPlayerColors(players)
		this.setRandomHexColor(world)
		this.initKingdoms(world)
		this.initCapitals(world)
		this.initKingdomsGold(world)

		return world
	}

	/**
	 * For testing purpose
	 * Generates hexagons that has coords to forms a giant pointy-hexagon.
	 * The center is empty, marking a `0 0 0` coords.
	 *
	 * @param {Number} size
	 */
	static hexagonWorld(size) {
		const origin = new Hex(0, 0, 0)

		// `GridGenerator.hexagon()` Generates the pointy-hexagon world
		return GridGenerator.hexagon(size)
			.map((baseHex) => Hex.fromBaseHex(baseHex))
			.filter((hex) => !hex.isSameAs(origin))
	}
}
