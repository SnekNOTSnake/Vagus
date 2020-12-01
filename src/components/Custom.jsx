import React from 'react'
import { Link } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import querystring from 'query-string'
import PropTypes from 'prop-types'
import style from './styles/Custom.module.css'

const defaultPlayers = [
	{ id: uuid(), type: 'human' },
	{ id: uuid(), type: 'ai' },
	{ id: uuid(), type: 'ai' },
	{ id: uuid(), type: 'ai' },
]

const Custom = ({ routerProps }) => {
	// Inputs
	const [inputs, setInputs] = React.useState({
		seed: '',
		worldSize: 'large',
		aiDifficulty: 'hard',
	})
	const inputChange = (e) => {
		const { name, value } = e.currentTarget
		setInputs((initVal) => {
			const newVal = { ...initVal }
			newVal[name] = value
			return newVal
		})
	}

	// Players
	const [players, setPlayers] = React.useState(defaultPlayers)
	const deletePlayer = (id) => {
		setPlayers((initVal) => {
			return initVal.filter((player) => player.id !== id)
		})
	}
	const addPlayer = () => {
		if (players.length >= 6) return
		setPlayers((initVal) => initVal.concat({ id: uuid(), type: 1 }))
	}
	const changePlayer = (id) => {
		setPlayers((initVal) => {
			const array = initVal.slice()

			const index = array.findIndex((player) => player.id === id)
			const type = array[index].type === 'human' ? 'ai' : 'human'
			// Create new object to force update
			const player = { ...array[index] }
			player.type = type
			array[index] = player

			return array
		})
	}

	// Play Button
	const handlePlayButtonClick = () => {
		const rawQuery = {
			world: inputs.worldSize,
			difficulty: inputs.aiDifficulty,
			players: players.map((player) => player.type),
		}
		if (inputs.seed) rawQuery.seed = inputs.seed
		const query = querystring.stringify(rawQuery)
		routerProps.history.push(`/game/?${query}`)
	}

	return (
		<div className={`${style.Custom} literature`}>
			<div className="maxWidth">
				<h1>Custom</h1>
				<input
					placeholder="Seed"
					type="text"
					value={inputs.seed}
					onChange={inputChange}
					name="seed"
				/>
				<div className={style.select}>
					<select
						onChange={inputChange}
						value={inputs.worldSize}
						name="worldSize"
					>
						<option value="tiny">Tiny world</option>
						<option value="small">Small world</option>
						<option value="medium">Medium world</option>
						<option value="large">Large world</option>
						<option value="extreme">Extreme world</option>
					</select>
				</div>
				<div className={style.select}>
					<select
						onChange={inputChange}
						value={inputs.aiDifficulty}
						name="aiDifficulty"
					>
						<option value="easy">Easy</option>
						<option value="hard">Hard</option>
					</select>
				</div>
				<div className={style.players}>
					{players.map((player) => (
						<div
							tabIndex={0}
							role="button"
							onClick={() => changePlayer(player.id)}
							key={player.id}
							index={player.id}
							className={style.player}
						>
							{player.type === 'human' ? 'H' : 'C'}
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									deletePlayer(player.id)
								}}
							>
								X
							</button>
						</div>
					))}
					{players.length < 6 ? (
						<button
							className={style.addPlayerButton}
							type="button"
							onClick={addPlayer}
						>
							+
						</button>
					) : (
						''
					)}
				</div>
				<button
					disabled={players.length < 2}
					className={style.playButton}
					type="button"
					onClick={handlePlayButtonClick}
				>
					Play
				</button>
				<Link className="backButton" to="/" />
				<Link className="backButtonStatic" to="/" />
			</div>
		</div>
	)
}

Custom.propTypes = {
	routerProps: PropTypes.object.isRequired,
}

export default Custom
