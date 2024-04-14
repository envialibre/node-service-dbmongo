const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(bodyParser.json());

const uri = "mongodb+srv://envialibre:8kEza19QqfpwSlqi@cluster0.lgltjls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const dbName = "actividad4";
    const collectionName = "users";
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    app.post('/users', async (req, res) => {
      try {
        const newUser = req.body;
        await collection.insertOne(newUser);
        res.status(201).json(newUser);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    app.put('/users/:id', async (req, res) => {
      try {
        const updatedUser = req.body;
        const result = await collection.replaceOne({ _id: req.params.id }, updatedUser);
        res.json(updatedUser);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    app.get('/users', async (req, res) => {
      try {
        const users = await collection.find().toArray();
        res.json(users);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.get('/users/:id', async (req, res) => {
      try {
        const user = await collection.findOne({ _id: req.params.id });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.delete('/users/:id', async (req, res) => {
        const userId = req.params.id;
      
        try {
          const deleteResult = await collection.deleteOne({ _id: new ObjectId(userId) });
          if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.json({ message: 'User deleted' });
        } catch (err) {
          res.status(500).json({ message: `Something went wrong trying to delete user: ${err}` });
        }
      });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

run().catch(console.dir);
