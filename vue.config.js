const { defineConfig } = require("@vue/cli-service")

module.exports = defineConfig({
  devServer: {
    client: {
      overlay: false
    },
    port:80,
    open:true // auto open brower
  }
}
)
