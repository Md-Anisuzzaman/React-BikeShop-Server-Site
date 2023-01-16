const express = require('express')
const app = express()
const cors = require('cors');
const bcrypt = require("bcrypt")
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require('body-parser')
const formData = require('express-form-data');
const port = process.env.PORT || 8000;


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(formData.parse());


const uri = `mongodb+srv://BuyBikeDB:yIAFNfuLDUHST2wn@cluster0.yhzyn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db('bike-selling');
    const productsCollection = database.collection('Products');
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection('users');
    const reviewsCollection = database.collection("reviews");

    //add product Collection

    app.post("/addproduct", async (req, res) => {
      const result = await productsCollection.insertOne(req.body);
      // res.send(result);
      res.json(result);
    });

    app.post("/editProduct", async (req, res) => {
      let id = req.body.id;
      delete req.body.id
      const result = await productsCollection.updateOne(
        { "_id": ObjectId(id) },
        { $set: req.body }
      );
      // res.send(result);
      res.json(result);
    });

    // get all products

    app.get("/allproduct", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });

    //Delete Product 

    app.delete('/product-delete/:id', async (req, res) => {
      const id = req.params.id;
      console.log('hello', id);
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });


    // single product details to purchase

    app.get("/singleProduct/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) }
      const result = await productsCollection.findOne(query)
      res.json(result);
    });

    // add order an item

    app.post("/addOrderItem", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      console.log(result);
      res.send(result);
    });


    // get all orders

    app.get("/allorders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });


    // get my orders list

    app.get("/myOrders/:email", async (req, res) => {
      //console.log(req.params.email);
      const result = await ordersCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    });


    //DELETE Orders

    app.delete('/orders-delete/:id', async (req, res) => {
      const id = req.params.id;
      //console.log('hello', id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
      //console.log('hello');
    });

    //add review

    app.post("/addreview", async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
      console.log(result);
      res.send(result);
    });

    //get reviews

    app.get("/allreview", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });



    // app.post("/register", async (req, res) => {
    //   // const result = await ordersCollection.insertOne(req.body);
    //   // console.log(result);
    //   // res.send(result);
    //   const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //   res.json(req.body);
    // });

    //Register rtk 
    app.post("/register", async (req, res) => {

      const name = req.body.name;
      const email = req.body.email;
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const result = await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
      });
      res.json(result);
    });


    //Login rtk
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      // const userPassword = await usersCollection.findOne({ password:password});

      if (!email && !password) {

        return res.status(400).json({ error: "filled all cdata" });
      }

      const userEmail = await usersCollection.findOne({ email: email });
      const userPassword = await usersCollection.findOne({ password:password});


      const isMatch = await bcrypt.compare(password, userPassword.password);


      if (!userEmail && !isMatch ) {
        res.status(400).json({ error: "authentication failed" });
      }
      else {
        res.json({ messsage: "Successfully authenticated" })
      }

      // if ((usereEmail.length && userPassword.length) > 0) {
      //   const compareEmail = await bcrypt.compare(req.body.email, usereEmail[0].email);
      //   const comparePassword = await bcrypt.compare(req.body.password, userPassword[0].password);
      //   if (compareEmail && comparePassword) {
      //     res.status(200).json("Authentication Successful");
      //   }
      // }
      // else
      //   res.status(401).json("Authentication faild");

    });

    // //Login react bike shop
    // app.post("/login", async (req, res) => {
    //   const result = await ordersCollection.insertOne(req.body);
    //   console.log(result);
    //   res.send(result);
    //   res.json(req.body);
    // });


    // Add user

    // app.post("/addusers", async (req, res) => {
    //   const result = await usersCollection.insertOne(req.body);
    //   res.send(result);
    // });

    //  user list

    app.get("/allusers", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });


    // app.post("/makeAdmin", async (req, res) => {
    //   const filter = { email: req.body.email };
    //   const result = await usersCollection.find(filter).toArray();
    //   if (result) {
    //     const updateDoc = await usersCollection.updateOne(filter, { $set: { role: "admin" } });
    //     console.log(updateDoc, "doc");
    //   }
    //   console.log(result, req.body, "koi");
    // });


    //Make Admin

    app.post("/makeAdmin", async (req, res) => {
      const filter = { _id: new ObjectId(req.body.id) };
      const updateDoc = await usersCollection.updateOne(filter, { $set: { role: "admin" } });
    });

    // Check Admin
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await usersCollection.find({ email: req.params.email }).toArray();
      console.log(result);
      res.send(result);
    });


  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Welcome to BuyBike site')
})

app.listen(port, () => {
  console.log(`Hello World! Do You Need Server: ${port}`)
})