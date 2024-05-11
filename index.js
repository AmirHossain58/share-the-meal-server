const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())









const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4j3msur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
 
async function run() {
  try {
    const foodCollection=client.db('shareTheMeal').collection('foodCollection')
    // const countriesData=client.db('shareTheMeal').collection('countriesData')
    app.get('/food',async(req,res)=>{ 
      const cursor=foodCollection.find()
      const result =await cursor.toArray()
      res.send(result)  
    })
    app.get('/details/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result =await foodCollection.findOne(query)
      res.send(result) 
    })
    // api post   
    app.post('/addFood', async(req,res)=>{
      const addFood=req.body
      const result = await foodCollection.insertOne(addFood)
      res.send(result)
    })







    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get ('/',(req,res)=>{
  res.send("share-the-meal-server is running")
})
app.listen(port,()=>{
  console.log(`share-the-meal-server is running on port ${port}`);
})