const express = require('express')
const morgan = require('morgan')
const {connectMongoDb} = require('./connectionDb')
const {logReqRes} = require('./middleware/user')
const userRouter = require('./Route/user')
const schoolRouter = require('./Route/school')
// const userRouterOtp = require('./Route/otp')
require('dotenv').config()//env file---
const app = express()
const port = process.env.PORT
app.use(morgan('tiny'))

app.use(express.json())
//middleware
app.use(express.raw({extended:false}))
app.use(logReqRes('log.txt'))
//CONNECT DATA BASE
connectMongoDb("mongodb://localhost:27017/Onbording").then(()=>console.log('Mongodb connected')).catch((error)=>console.log('Eroor',error))


app.use('/api',userRouter);
app.use('/school',schoolRouter);

app.use((req,res,next)=>{
    res.status(404).json({status:"bad resquest"});
})
app.listen(port,(req,res)=>{
    console.log("Server is running on ",port)
})



