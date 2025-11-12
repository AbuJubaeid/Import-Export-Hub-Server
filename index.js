const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json());




const uri = "mongodb+srv://IEHub-db:EQfkn0ZTumtJOyFp@cluster0.ke2w89y.mongodb.net/?appName=Cluster0";

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
    await client.connect();

    const db = client.db('IEHub-db')
    const productsCollection = db.collection('products')
    const importsCollection = db.collection('imports')

    // get all product
    app.get('/products', async (req, res)=>{
        const cursor = productsCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // get a single product
    app.get("/products/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await productsCollection.findOne(query);
          res.send(result);
        });

    // get most recent products
    app.get('/recent-products', async(req, res)=>{
        const cursor = productsCollection.find().sort({ _id: -1}).limit(6)
        const result = await cursor.toArray()
        res.send(result)
    })

    // get my exports
     app.get("/myExports", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.created_by = email;
      }
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get my imports
     app.get("/my-imports", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.imported_by = email;
      }
      const cursor = importsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

     // delete a product
    app.delete("/myExports/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

     // update a product
    app.put("/myExports/:id", async (req, res) => {
      const updateProduct = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          // name: updateProduct.name,
          // price: updateProduct.price,
          product_image: updateProduct.product_image,
          product_name: updateProduct.product_name,
          price: updateProduct.price,
          origin_country: updateProduct.origin_country,
          rating: updateProduct.rating,
          available_quantity: updateProduct.available_quantity,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    // add a product
    app.post('/products', async (req, res)=>{
        const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    })

    // add a product to myImports
    app.post('/my-imports', async (req, res)=>{
        const newProduct = req.body;
      const result = await importsCollection.insertOne(newProduct);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})