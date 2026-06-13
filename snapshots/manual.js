import express from "express"

const app = express()
app.use(express.static("."))
app.listen(8002)
console.log("Listening on port 8002")
