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
    'https://share-the-meal-e8eba.web.app',
    'https://share-the-meal-e8eba.firebaseapp.com'
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())


// verify jwt middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).send({ message: 'unauthorized access' })
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log(err)
        return res.status(401).send({ message: 'unauthorized access' })
      }
      console.log(decoded) 

      req.user = decoded
      next()
    })
  }
}







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
    const reqFoodCollection=client.db('shareTheMeal').collection('reqFoodCollection')

     // jwt generate
     app.post('/jwt', async (req, res) => {
      const email = req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

    // Clear token on logout
    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logging out', user);
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', maxAge: 0 }).send({ success: true })
  })







  // 
   
    app.get('/food',async(req,res)=>{
      const email11 = req.query.email
      const status=req.query.status
      const search=req.query.search
      const sort=req.query.sort
      let query={
      } 
      if(email11)query['donator.email']=email11
      if(status)query.foodStatus=status
      let options = {}
      if (sort) options = { sort: { expiredTime: sort === 'asc' ? 1 : -1 } }
      if(search)query.foodName={ $regex: search, $options: 'i' }
      const cursor=foodCollection.find(query,options)
      const result =await cursor.toArray()
      res.send(result)   
    })
    app.put('/food/:id',verifyToken,async(req,res)=>{
      const id=req.params.id
      const filter={_id:new ObjectId(id)}
      const options={upsert :true} 
    const updateData=req.body
    const food={
      $set:{
       ...updateData 
      }
    }
    const result=await foodCollection.updateOne(filter,food,options)
    res.send(result)
    })
    app.delete('/food/:id',verifyToken,async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result =foodCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/details/:id',verifyToken,async(req,res)=>{
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
    app.get('/reqFood',verifyToken,async(req,res)=>{
      const email = req.query.email
      let query={
      }
      if(email)query.requesterEmail=email
      const cursor=reqFoodCollection.find(query)
      const result =await cursor.toArray()
      res.send(result)    
    })
    app.post('/reqFood',verifyToken, async(req,res)=>{
      const addFood=req.body
      const result = await reqFoodCollection.insertOne(addFood)
      res.send(result)
    }) 




    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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