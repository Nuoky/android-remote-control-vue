const path = require("path")
const VueLoaderPlugin = require("vue-loader/lib/plugin")
const env = process.env.NODE_ENV
// 开发环境时启动页面加载组件方便开发
const entry = env === "development" ? "./dev/index.js" : "./src/index.js"

module.exports = {
  mode: env,
  entry: entry,
  output: {
    path: path.resolve(__dirname, "/dist"),
    publicPath: '/dist/',
    filename: "remote-control-vue.js",
    libraryTarget: "umd", // 用到的模块定义规范
    library: "remote-control", // 库的名字
    libraryExport: "default",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(ttf|eot|woff|svg|woff2)/,
        use: "file-loader",
      },
      {
        test: /\.vue$/,
        use: "vue-loader",
      }
    ],
  },
  externals : {
    vue: {
      root: "Vue",
      commonjs: "vue",
      commonjs2: "vue",
      amd: "vue"
    }
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, './dev'),
    compress: true,
    port: 3000
  }
};
