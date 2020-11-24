import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import GameMenu from './GameMenu'
import KingdomMenu from './KingdomMenu'
import Arbiter from '../../engine/Arbiter'

const Menu = ({ arbiter, onUpdate, onError }) => {
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
				{arbiter.currentKingdom === null ? (
					''
				) : (
					<KingdomMenu
						onArbiterError={onError}
						onUpdate={onUpdate}
						arbiter={arbiter}
					/>
				)}
				<GameMenu
					onArbiterError={onError}
					onUpdate={onUpdate}
					arbiter={arbiter}
				/>
			</div>
			{arbiter.currentKingdom === null ? (
				''
			) : (
				<div className="small-menu-top">
					<KingdomMenu
						onArbiterError={onError}
						onUpdate={onUpdate}
						arbiter={arbiter}
					/>
				</div>
			)}
			<div className="small-menu-bottom">
				<GameMenu
					onArbiterError={onError}
					onUpdate={onUpdate}
					arbiter={arbiter}
				/>
			</div>
		</div>
	)
}

Menu.propTypes = {
	arbiter: PropTypes.instanceOf(Arbiter).isRequired,
	onUpdate: PropTypes.func,
	onError: PropTypes.func,
}

Menu.defaultProps = {
	onUpdate: () => null,
	onError: () => null,
}

export default Menu
