const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhzyn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db('bike-selling');
    const productsCollection = database.collection('Products');
    const ordersCollection = database.collection("orders");
    // const usersCollection = database.collection('users');
    // const reviewCollection = database.collection("review");

    //add product Collection

    app.post("/addproduct", async (req, res) => {
      console.log(req.body);
      const result = await productsCollection.insertOne(req.body);
      res.send(result);
    });

    // get all products

    app.get("/allproduct", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });


    // single product details to purchase

    app.get("/singleProduct/:id", async (req, res) => {
      //console.log(req.params.id);
      const query = { _id: ObjectId(req.params.id) }
      const result = await productsCollection.findOne(query)
      res.send(result);
      //console.log("result vaiya",result);
    });

    // add order an item

    app.post("/addOrderItem", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    });

    // get my orders list

    app.get("/myOrders/:email", async (req, res) => {
      //console.log(req.params.email);
      const result = await ordersCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    });


    //DELETE Orders

    app.post('/orders-delete/:id', async (req, res) => {
      const id = req.params.id;
      //console.log('hello', id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
      //console.log('hello');
    });

  } finally {
    // Ensures that the client will close when you finish/error
    ///await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Welcome to BuyBike site')
})

app.listen(port, () => {
  console.log(`Hello World! Do You Need Server: ${port}`)
})