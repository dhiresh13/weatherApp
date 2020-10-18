const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "main.js",
		publicPath: "/",
	},
	devServer: {
		contentBase: "./bundle",
		stats: {
			children: false,
			maxModules: 0,
		},
		historyApiFallback: true,
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.css$/,
				loader: "style-loader!css-loader",
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: "svg-url-loader",
						options: {
							limit: 10000,
						},
					},
				],
			},
			{
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "fonts/",
						},
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: "file-loader",
					},
				],
			},
			{
				test: /\.ttf$/,
				use: [
					{
						loader: "ttf-loader",
						options: {
							name: "./font/[hash].[ext]",
						},
					},
				],
			},
		],
	},

	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
			Popper: ["popper.js", "default"],
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "public/index.html"),
			filename: "index.html",
			favicon: path.resolve(__dirname, "public/favicon.ico"),
		}),
	],
};
