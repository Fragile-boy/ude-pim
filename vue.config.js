const {defineConfig} = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    proxy: {
      '/api':{
        target:'http://localhost',
        changeOrigin:true,
        ws:false,
        pathRewrite:{
          '^/api':''
        }
      }
    }
  }
})
