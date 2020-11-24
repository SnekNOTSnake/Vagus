const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { GenerateSW } = require('workbox-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const path = require('path')

// Use `mini-css-extract-plugin` for Prod and `style-loader` for Dev.
// Cannot use both.
const devMode = process.env.NODE_ENV !== 'production'
const plugins = []
if (!devMode)
	plugins.push(
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
		}),
		new CssMinimizerPlugin(),
		new GenerateSW({
			// these options encourage the ServiceWorkers to get in there fast
			// and not allow any straggling "old" SWs to hang around
			clientsClaim: true,
			skipWaiting: true,
		}),
	)

const fileExtensions = [
	'jpg',
	'png',
	'gif',
	'svg',
	'woff',
	'woff2',
	'eot',
	'ttf',
	'otf',
]

module.exports = {
	entry: path.resolve(__dirname, 'src', 'index.jsx'),
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/', // find the output files from `/` instead of relative
	},
	resolve: {
		extensions: ['.js', '.json', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
					'css-loader',
				],
				include: path.resolve(__dirname, 'src'),
				exclude: /\.module\.css$/,
			},
			{
				test: /\.module\.css$/,
				use: [
					devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							// Also apply CSS Modules on `@import`-ed resources
							importLoaders: 1,
							// Enable CSS Modules
							modules: true,
						},
					},
				],
				include: path.resolve(__dirname, 'src'),
			},
			{
				test: /\.(ts|js)x?$/,
				use: ['babel-loader'],
				include: path.resolve(__dirname, 'src'),
			},
			{
				test: new RegExp(`.(${fileExtensions.join('|')})$`),
				use: ['file-loader'],
				include: path.resolve(__dirname, 'src'),
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({ template: 'public/index.html', minify: true }),
		new CleanWebpackPlugin(),
		new ProgressBarWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'static'),
					to: path.resolve(__dirname, 'dist'),
				},
			],
		}),
		...plugins,
	],
}
