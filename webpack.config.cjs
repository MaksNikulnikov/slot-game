const path = require("node:path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const projectRoot = __dirname;

module.exports = {
  entry: path.resolve(projectRoot, "src/main.ts"),
  output: {
    clean: true,
    filename: "assets/[name].[contenthash].js",
    path: path.resolve(projectRoot, "dist"),
    publicPath: "auto"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader"
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|webp|mp3|ogg|wav|json|atlas|skel)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name].[contenthash][ext]"
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(projectRoot, "index.html")
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(projectRoot, "public"),
          to: path.resolve(projectRoot, "dist"),
          noErrorOnMissing: true
        }
      ]
    })
  ],
  devServer: {
    client: {
      overlay: true
    },
    hot: true,
    port: 5173,
    static: {
      directory: path.resolve(projectRoot, "public")
    }
  }
};
