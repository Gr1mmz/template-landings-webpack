const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {defaultMinimizerOptions} = require('html-loader');
const TerserPlugin = require('terser-webpack-plugin');

const srcFolder = 'src';
const buildFolder = 'dist';

const paths = {
  src: path.resolve(srcFolder),
  build: path.resolve(buildFolder)
}

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const mode = isDev ? 'development' : 'production';
console.log(mode + ' mode');

module.exports = {
  context: path.resolve(__dirname, paths.src),
  mode: mode,
  entry: './js/main.js',
  output: {
    path: path.resolve(__dirname, paths.build),
    filename: `./js/${filename('js')}`,
    publicPath: '',
    assetModuleFilename: 'assets/[hash][ext][query]',
    clean: true,
  },
  devServer: {
    historyApiFallback: true,
    static: buildFolder,
    open: true,
    compress: true,
    hot: true,
    port: 3000,
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {chunks: 'all'},
    minimize: isProd,
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `${srcFolder}/index.html`),
      filename: 'index.html',
      minify: isProd
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `./assets`, to: `./`,
          noErrorOnMissing: true,
          force: true
        },
        {
          from: `./favicon.ico`, to: `./`,
          noErrorOnMissing: true
        }
      ],
    }),
    new MiniCssExtractPlugin({filename: `./css/[name].[contenthash].css`})
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          minimize: {
            ...defaultMinimizerOptions,
            removeComments: true,
            collapseWhitespace: true,
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: (mode === 'development') ? "style-loader" : MiniCssExtractPlugin.loader,
            options: (mode === 'development') ? {} : {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            }
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    {
                      // Options
                    },
                  ],
                ],
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
}