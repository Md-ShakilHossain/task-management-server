const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yyjzvb3.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("taskManagementDB").collection('users');
    const taskCollection = client.db("taskManagementDB").collection('tasks');

    // user related api
    app.get('/users', async (req, res) => {

        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email };
        }
        if (req.query?.name) {
            query = { name: new RegExp(req.query.name, 'i') };
        }

        const result = await userCollection.find(query).toArray();
        res.send(result);
    });

    app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.findOne(query);
        res.send(result);
    });

    app.post('/users', async (req, res) => {
        const user = req.body;
        // checking user exist or not
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
            return res.send({ message: 'user already exist', insertedId: null });
        }

        const result = await userCollection.insertOne(user);
        res.send(result);
    });

    // Task Related Api

    app.get('/tasks', async (req, res) => {

      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
  });

  app.get('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await taskCollection.findOne(query);
    res.send(result);
});


    app.post('/tasks', async (req, res) => {
      const taskInfo = req.body;
      console.log(taskInfo);
      const result = await taskCollection.insertOne(taskInfo);
      res.send(result);
  });

  app.patch('/tasks/:id', async (req, res) => {
    const updatedTask = req.body;
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
        $set: {
            title: updatedTask.title,
            description: updatedTask.description,
            deadline: updatedTask.deadline,
            priority: updatedTask.priority
        }
    }
    const result = await taskCollection.updateOne(filter, updatedDoc);
    res.send(result);
});


app.delete('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await taskCollection.deleteOne(query);
  res.send(result);
});

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
    res.send('Task-management is running');
});

app.listen(port, () => {
    console.log(`Task-management is running ${port}`);
})