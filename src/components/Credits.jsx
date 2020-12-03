import React from 'react'
import { Link } from 'react-router-dom'

const Credits = () => {
	return (
		<div className="Credits literature">
			<div className="maxWidth">
				<Link className="backButton" to="/" />

				<section>
					<h1>The Guy Behind The Keyboard</h1>
					<p>
						<a href="https://github.com/SnekNOTSnake">SnekNOTSnake</a> - Akhmad
						Najmuddin
					</p>
				</section>

				<section>
					<h2>Original Work</h2>
					<p>
						This project is basically a combination of two works:{' '}
						<a href="https://antiyoy.fandom.com/">Antiyoy</a> created by yiotro,
						and <a href="https://github.com/alcalyn/openhex">Openhex</a> created
						by alcalyn.
					</p>
				</section>

				<section>
					<h2>Images Sources</h2>
					<p>
						All of the images are gathered from{' '}
						<a href="https://flaticon.com">Flaticon</a>. Almost all of them,
						except the tower and grave are made by{' '}
						<a href="https://www.freepik.com/">Freepik</a>.
					</p>
					<p>
						The tower is created by{' '}
						<a href="https://www.flaticon.com/authors/nhor-phai">Nhor Phai</a>,
						and the grave is created by{' '}
						<a href="https://smashicons.com/">Smashicons</a>.
					</p>
					<p>Some of the images are modified to make them fit the needs.</p>
				</section>

				<section>
					<h2>Tools and Services Used</h2>
					<ul>
						<li>
							<a href="https://vecta.io/nano">Nano</a> - Online SVG Compressor
						</li>
						<li>
							<a href="https://transfonter.org/">Transfonter</a> - Online CSS
							@font-face generator
						</li>
						<li>
							<a href="https://realfavicongenerator.net/">
								Real Favicon Generator
							</a>{' '}
							- Online Favicon Generator
						</li>
						<li>
							<a href="https://maskable.app/editor">Maskable.app</a> - Online
							Maskable icon editor
						</li>
					</ul>
				</section>
				<Link className="backButtonStatic" to="/" />
			</div>
		</div>
	)
}

export default Credits
