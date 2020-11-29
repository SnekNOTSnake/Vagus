import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import GameMenu from './GameMenu'
import KingdomMenu from './KingdomMenu'
import Arbiter from '../../engine/Arbiter'

const Menu = ({
	arbiter,
	currentKingdom,
	selection,
	setSelection,
	setCurrentKingdom,
	onUpdate,
	onError,
}) => {
	return (
		<div className="Menu">
			<div className="big-menu">
				<div
					className={`current-player-color bg-color-${arbiter.currentPlayer.color}`}
				>
					<Link className="home-link" to="/">
						Home
					</Link>
				</div>
				{currentKingdom === null ? (
					''
				) : (
					<KingdomMenu
						currentKingdom={currentKingdom}
						selection={selection}
						setSelection={setSelection}
						arbiter={arbiter}
						onArbiterError={onError}
						onUpdate={onUpdate}
					/>
				)}
				<GameMenu
					selection={selection}
					setCurrentKingdom={setCurrentKingdom}
					arbiter={arbiter}
					onArbiterError={onError}
					onUpdate={onUpdate}
				/>
			</div>
			{currentKingdom === null ? (
				''
			) : (
				<div className="small-menu-top">
					<KingdomMenu
						currentKingdom={currentKingdom}
						selection={selection}
						setSelection={setSelection}
						arbiter={arbiter}
						onArbiterError={onError}
						onUpdate={onUpdate}
					/>
				</div>
			)}
			<div className="small-menu-bottom">
				<GameMenu
					selection={selection}
					setCurrentKingdom={setCurrentKingdom}
					arbiter={arbiter}
					onArbiterError={onError}
					onUpdate={onUpdate}
				/>
			</div>
		</div>
	)
}

Menu.propTypes = {
	arbiter: PropTypes.instanceOf(Arbiter).isRequired,
	selection: PropTypes.object,
	setSelection: PropTypes.func,
	currentKingdom: PropTypes.object,
	setCurrentKingdom: PropTypes.func,
	onUpdate: PropTypes.func,
	onError: PropTypes.func,
}

Menu.defaultProps = {
	selection: null,
	setSelection: () => null,
	currentKingdom: null,
	setCurrentKingdom: () => null,
	onUpdate: () => null,
	onError: () => null,
}

export default Menu
