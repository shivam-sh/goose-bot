// Load .env variables
require('dotenv').config()

export const botConfig = {
    prefix: "-",
    discordToken: process.env.DISCORD_TOKEN
}

export const emailConfig = {
    address: process.env.EMAIL,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT
}

export const mongoConfig = {
    USERNAME: process.env.MONGO_USER,
    PASSWORD: process.env.MONGO_PASS,
    CLUSTER_URI: process.env.MONGO_CLUSTER_URI
}