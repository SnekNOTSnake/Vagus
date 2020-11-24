/* eslint-disable react/forbid-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom'
import { AutoSizer } from 'react-virtualized'
import querystring from 'query-string'
import Openhex from './Openhex'
import Arbiter from '../../engine/Arbiter'
import HumanPlayer from '../../engine/HumanPlayer'
import AIPlayer from '../../engine/AIPlayer'
import WorldGenerator from '../../engine/WorldGenerator'
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
	const [arbiter, setArbiter] = React.useState(null)
	const [, update] = React.useState(null)
	const svgPanZoom = React.useRef(null)

	// Force update
	const runUpdate = () => update({})

	// Error handlers
	const handleArbiterError = (err) => {
		// eslint-disable-next-line
		console.error(err)
		setError(err)
	}
	const handleCleanError = () => {
		setError(null)
	}

	// World Generation
	React.useEffect(() => {
		const parsed = querystring.parse(routerProps.location.search)
		const config = {
			size: getWorldSize(parsed.world),
		}
		if (parsed?.players?.length >= 2 && parsed?.players?.length <= 6) {
			const players = parsed.players.map((type) =>
				type === 'human' ? new HumanPlayer() : new AIPlayer(),
			)
			config.players = players
		}

		const world = WorldGenerator.generate(
			parsed.seed ? parsed.seed : null,
			config,
		)
		const arb = new Arbiter(world)

		setArbiter(arb)
	}, [routerProps.location.search])

	// Shortcuts
	React.useEffect(() => {
		const keyDownHandler = (e) => {
			if (arbiter === null) return
			try {
				switch (e.code) {
					case 'KeyE':
						if (arbiter.hasUndo()) arbiter.undo()
						break
					case 'KeyR':
						if (!arbiter.winner && !arbiter.selection) arbiter.endTurn()
						break
					case 'KeyA':
						if (arbiter.currentKingdom?.gold >= Arbiter.UNIT_PRICE)
							arbiter.buyUnit()
						break
					case 'KeyS':
						if (arbiter.currentKingdom?.gold >= Arbiter.TOWER_PRICE)
							arbiter.buyTower()
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
	}, [arbiter])

	return arbiter !== null ? (
		<div className="Game">
			{error !== null ? <Alert error={error} /> : ''}
			<Menu
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
									onHexClick={handleCleanError}
									onUpdate={runUpdate}
									onArbiterError={handleArbiterError}
									arbiter={arbiter}
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
