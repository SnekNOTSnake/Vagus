import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
	return (
		<div className="NotFound literature">
			<div className="maxWidth">
				<h2>Page not found</h2>
				<p>Possibilities:</p>
				<ul>
					<li>You entered the wrong address</li>
					<li>Page has been deleted</li>
					<li>IT&apos;S A TRAP!</li>
					<li>If you&apos;re looking for a secret route, good luck!</li>
					<li>You purposely entered here.</li>
				</ul>

				<Link className="backButton" to="/" />
				<Link className="backButtonStatic" to="/" />
			</div>
		</div>
	)
}

export default NotFound
