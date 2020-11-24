import React from 'react'
import PropTypes from 'prop-types'
import Arbiter from '../../engine/Arbiter'
import Themes from '../../themes/Themes'
import Unit from '../../engine/Unit'
import Tower from '../../engine/Tower'

/**
 * @typedef {import('../../engine/Arbiter').default} Arbiter
 */

/**
 * @param {{ arbiter: Arbiter }} param
 */
const KingdomMenu = ({ arbiter, onUpdate, onArbiterError }) => {
	const handleBuyUnit = () => {
		try {
			arbiter.buyUnit()
			onUpdate()
		} catch (err) {
			onArbiterError(err)
		}
	}

	const handleBuyTower = () => {
		try {
			arbiter.buyTower()
			onUpdate()
		} catch (err) {
			onArbiterError(err)
		}
	}

	const renderSelection = () => {
		if (arbiter.selection === null) return ''
		return <img alt="selection" src={Themes.getImageFor(arbiter.selection)} />
	}

	const renderDifference = () => {
		const difference = arbiter.currentKingdom.getDifference()
		return difference >= 0 ? (
			<span>
				(<span style={{ color: 'rgb(31, 142, 36)' }}>+{difference}</span>)
			</span>
		) : (
			<span>
				(<span style={{ color: 'rgb(220, 0, 78)' }}>{difference}</span>)
			</span>
		)
	}

	return (
		<div className="KingdomMenu">
			<div className="stats">
				<div className="gold">
					<h2>
						<img
							src={Themes.getImageForGold(arbiter.currentKingdom.gold)}
							alt=""
						/>{' '}
						{arbiter.currentKingdom.gold}
						{renderDifference()}
					</h2>
					<p>Income: {arbiter.currentKingdom.getIncome()}</p>
					<p>Outcome: {arbiter.currentKingdom.getOutcome()}</p>
				</div>
				<div className="selection">
					<h2>Selection</h2>
					<div className="figure">{renderSelection()}</div>
				</div>
			</div>
			<div className="store">
				<button
					className={`bg-color-${arbiter.currentPlayer.color}`}
					disabled={arbiter.currentKingdom.gold < 10}
					onClick={handleBuyUnit}
					type="button"
				>
					<img src={Themes.getImageFor(new Unit())} alt="buy unit" />{' '}
					<span>10</span>
				</button>
				<button
					className={`bg-color-${arbiter.currentPlayer.color}`}
					disabled={arbiter.currentKingdom.gold < 15}
					onClick={handleBuyTower}
					type="button"
				>
					<img src={Themes.getImageFor(new Tower())} alt="buy tower" />{' '}
					<span>15</span>
				</button>
			</div>
		</div>
	)
}

KingdomMenu.propTypes = {
	arbiter: PropTypes.instanceOf(Arbiter).isRequired,
	onUpdate: PropTypes.func,
	onArbiterError: PropTypes.func,
}

KingdomMenu.defaultProps = {
	onUpdate: () => null,
	onArbiterError: () => null,
}

export default KingdomMenu
