const { defineConfig } = require("@vue/cli-service")

module.exports = defineConfig({
  publicPath:'./',
  outputDir: 'ude-pim',
  devServer: {
    client: {
      overlay: false,
    },
    host:'0.0.0.0',
    port:80,
    open:true,  // auto open brower
    
  }
}
)
