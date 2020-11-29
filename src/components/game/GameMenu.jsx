import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Arbiter from '../../engine/Arbiter'

/**
 * @typedef {import('../../engine/Arbiter').default} Arbiter
 */

/**
 * @param {{ arbiter: Arbiter }} param
 */
const GameMenu = (props) => {
	const {
		arbiter,
		selection,
		setCurrentKingdom,
		onUpdate,
		onArbiterError,
	} = props

	const handleUndo = () => {
		try {
			arbiter.undo()
			onUpdate()
		} catch (err) {
			onArbiterError(err)
		}
	}

	const handleEndTurn = () => {
		try {
			arbiter.endTurn()
			setCurrentKingdom(null)
		} catch (err) {
			onArbiterError(err)
		}
	}

	return (
		<div className="GameMenu">
			<h2>Turn {arbiter.world.turn + 1}</h2>
			<button
				className={`bg-color-${arbiter.currentPlayer.color}`}
				disabled={!arbiter.hasUndo()}
				onClick={handleUndo}
				type="button"
			>
				Undo
			</button>
			<button
				className={`bg-color-${arbiter.currentPlayer.color}`}
				disabled={arbiter.winner || selection}
				onClick={handleEndTurn}
				type="button"
			>
				End Turn
			</button>
			<Link className="home" to="/">
				H
			</Link>
		</div>
	)
}

GameMenu.propTypes = {
	arbiter: PropTypes.instanceOf(Arbiter).isRequired,
	selection: PropTypes.object,
	setCurrentKingdom: PropTypes.func,
	onUpdate: PropTypes.func,
	onArbiterError: PropTypes.func,
}

GameMenu.defaultProps = {
	selection: null,
	setCurrentKingdom: () => null,
	onUpdate: () => {},
	onArbiterError: () => null,
}

export default GameMenu
