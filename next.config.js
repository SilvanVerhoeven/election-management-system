// @ts-check
const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  log: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
  },
}

module.exports = withBlitz(config)
