import express from "express"

const app = express()
app.use(express.static("."))
const server = app.listen(8002)
console.log("Listening on port 8002")
