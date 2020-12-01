/* eslint-disable react/forbid-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom'
import { AutoSizer } from 'react-virtualized'
import querystring from 'query-string'
import { UNIT_PRICE, TOWER_PRICE } from '../../constants/variables'
import { buyTower, buyUnit } from '../hooks/hookUtils'
import Openhex from './Openhex'
import Arbiter from '../../engine/Arbiter'
import HumanPlayer from '../../engine/HumanPlayer'
import AiEasy from '../../engine/ai/AiEasy'
import AiHard from '../../engine/ai/AiHard'
import WorldGenerator from '../../engine/WorldGenerator'
import Unit from '../../engine/Unit'
import Tower from '../../engine/Tower'
import Alert from './Alert'
import Menu from './Menu'
import './Game.css'

const getWorldSize = (size) => {
	switch (size) {
		case 'tiny':
			return 24
		case 'small':
			return 32
		case 'medium':
			return 40
		case 'large':
			return 48
		case 'extreme':
			return 56
		default:
			return 40
	}
}

const getHeight = (width, height) => {
	if (width === 0) return height
	return width > 600 ? height : height - 67 * 2
}

const Game = ({ routerProps }) => {
	const [error, setError] = React.useState(null)
	const [, update] = React.useState(null)

	// Selection could be Hex or an Entity (bought unit or tower)
	const [currentKingdom, setCurrentKingdom] = React.useState(null)
	const [selection, setSelection] = React.useState(null)

	// Show Winner
	const [showWinner, setShowWinner] = React.useState(true)
	const closeAlert = () => setShowWinner(false)

	const svgPanZoom = React.useRef(null)

	// Force update
	const runUpdate = () => update({})

	// Error handlers
	const handleArbiterError = (err) => {
		// eslint-disable-next-line
		console.error(err)
		setError(err)
	}

	// World Generation
	const arbiter = React.useMemo(() => {
		const parsed = querystring.parse(routerProps.location.search)
		const config = {
			size: getWorldSize(parsed.world),
		}

		if (parsed?.players?.length >= 2 && parsed?.players?.length <= 6) {
			const players = parsed.players.map((type) => {
				// type === 'human' ? new HumanPlayer() : new AiHard()
				if (type === 'human') return new HumanPlayer()
				return parsed.difficulty === 'easy' ? new AiEasy() : new AiHard()
			})
			config.players = players
		}

		const world = WorldGenerator.generate(
			parsed.seed ? parsed.seed : null,
			config,
		)

		return new Arbiter(world)
	}, [routerProps.location.search])

	// Hex click handler
	const handleHexClick = (hex) => {
		if (arbiter.winner) return
		setError(null)

		try {
			if (selection === null) {
				if (hex.kingdom) {
					if (hex.kingdom === currentKingdom) {
						if (hex.hasUnit() && hex.entity.played === false) setSelection(hex)
					} else if (hex.kingdom.player === arbiter.currentPlayer) {
						setCurrentKingdom(hex.kingdom)
						if (hex.hasUnit() && hex.entity.played === false) setSelection(hex)
					}
				}
			} else {
				// If selecting and moving to the same hex
				if (hex === selection) {
					setSelection(null)
					return
				}

				if (
					hex.player === arbiter.currentPlayer &&
					hex.kingdom !== currentKingdom
				)
					throw new Error(
						'Trying to select another kingdom but selection is not empty',
					)

				if (selection instanceof Unit) {
					arbiter.buyUnitTowardsHex(hex, currentKingdom, selection.level)
					setSelection(null)
					return
				}
				if (selection instanceof Tower) {
					arbiter.buyTowerForHex(hex)
					setSelection(null)
					return
				}

				arbiter.moveUnit(selection, hex)
				setSelection(null)
			}
		} catch (err) {
			setSelection(null)
		}
	}

	// Shortcuts
	React.useEffect(() => {
		const keyDownHandler = (e) => {
			if (arbiter === null) return
			try {
				switch (e.code) {
					case 'KeyE':
						if (arbiter.hasUndo()) arbiter.undo()
						break

					case 'KeyF':
						if (!arbiter.winner && !selection) {
							arbiter.endTurn()
							setCurrentKingdom(null)
						}
						break

					case 'KeyA':
						if (currentKingdom?.gold >= UNIT_PRICE) buyUnit(setSelection)
						break

					case 'KeyS':
						if (currentKingdom?.gold >= TOWER_PRICE) buyTower(setSelection)
						break

					default:
						break
				}
				runUpdate()
			} catch (err) {
				handleArbiterError(err)
			}
		}
		document.addEventListener('keydown', keyDownHandler)
		return () => {
			document.removeEventListener('keydown', keyDownHandler)
		}
	}, [arbiter, currentKingdom?.gold, selection])

	return arbiter !== null ? (
		<div className="Game">
			{error !== null ? <Alert error={error} /> : ''}
			{arbiter.winner && showWinner ? (
				<div className="winner">
					<h2>Player {arbiter.winner.color + 1} Win!</h2>
					<button
						className={`bg-color-${arbiter.winner.color}`}
						type="button"
						onClick={closeAlert}
					>
						Okay
					</button>
				</div>
			) : (
				''
			)}

			<Menu
				selection={selection}
				setSelection={setSelection}
				currentKingdom={currentKingdom}
				setCurrentKingdom={setCurrentKingdom}
				arbiter={arbiter}
				onUpdate={runUpdate}
				onError={handleArbiterError}
			/>

			<div className="core">
				<AutoSizer>
					{({ width, height }) => (
						<UncontrolledReactSVGPanZoom
							width={width > 600 ? width - 400 : width}
							height={getHeight(width, height)}
							tool="auto"
							SVGBackground="rgba(0, 0, 0, 0)"
							background="rgba(0, 0, 0, 0)"
							toolbarProps={{ position: 'none' }}
							miniatureProps={{ position: 'none' }}
							detectAutoPan={false}
							scaleFactorOnWheel={1.15}
							disableDoubleClickZoomWithToolAuto
							preventPanOutside
							ref={svgPanZoom}
							style={{ transform: width > 600 ? '' : 'translateY(67px)' }}
							detectPinchGesture
						>
							<svg width={width} height={height}>
								<Openhex
									selection={selection}
									onHexClick={handleHexClick}
									onUpdate={runUpdate}
									onArbiterError={handleArbiterError}
									arbiter={arbiter}
									currentKingdom={currentKingdom}
								/>
							</svg>
						</UncontrolledReactSVGPanZoom>
					)}
				</AutoSizer>
			</div>
		</div>
	) : (
		''
	)
}

Game.propTypes = {
	routerProps: PropTypes.object.isRequired,
}

export default Game
