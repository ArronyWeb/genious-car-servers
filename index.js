const express = require("express")
const cors = require("cors")
require('dotenv').config()
const jwt = require('jsonwebtoken')
const ObjectId = require('mongodb').ObjectId
const { MongoClient, ServerApiVersion } = require('mongodb');
const res = require("express/lib/response")
const app = express()
const port = process.env.PORT || 5000;


// middlewareWrapper
app.use(cors())
app.use(express.json())


function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({ message: "unauthorized access" })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
        if (err) {
            res.status(403).send({ message: "forbidden" })
        } else {
            req.decoded = decode;
            next()
        }

    })
}
// geniousUser
// rHDFsxmqGsbEttkJ

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.dqtpc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {

    console.log("DB connected")
    // perform actions on the collection object
    // client.close();
});

async function run() {

    try {
        await client.connect()
        const serviceCollection = client.db("Genius-Car").collection("service");
        const orderCollection = client.db("Genious-Car").collection("order")

        //auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            console.log(user)
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "1d"
            })
            res.send(accessToken)
        })
        // get all services 
        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        // get a single sevices
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })

        // send data to the srver 
        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        // delete the service 
        app.delete("/service/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query)
            res.send(result)

        })



        // get the order from orderCollection api 
        app.get('/order', verifyJwt, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email: email }
                const cursor = orderCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            } else {
                res.status(403).send({ message: " forbidden access" })
            }

        })
        // send the order to orderCollection api
        app.post('/order', async (req, res) => {
            const order = req.body;
            console.log(order)
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("Genius server is running")
})

app.listen(port, () => {
    console.log("Listening to port", port)
})