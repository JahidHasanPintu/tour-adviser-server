const express = require("express");
const app = express();
const cors = require('cors');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 7000;

const { MongoClient, ObjectId, ObjectID } = require('mongodb');

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hi, Welcome to tour adviser");
});

const uri = "mongodb+srv://admin:admin@atlascluster.gt814wc.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'tour-adviser-v1';

app.use(cors());
app.use(express.json());

async function connectToMongoDB() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');
    const db = client.db(dbName);
    const tourPackagesCollection = db.collection('tourPackages');
    const bookingCollection = db.collection('bookings');

    app.get('/tourpackages', async (req, res) => {
      const query = {}
      const cursor = tourPackagesCollection.find(query)
      const tourPackages = await cursor.toArray()
      res.json(tourPackages)
    })

    app.get('/tourpackages/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tourPackages = await tourPackagesCollection.findOne(query);

      if (!tourPackages) {
        res.status(404).send('tourPackages not found.');
        return;
      }

      res.send(tourPackages);
    });

    app.post('/tourpackages', async (req, res) => {
      const newTourPackage = req.body;
      console.log(newTourPackage);
      const result = await tourPackagesCollection.insertOne(newTourPackage)
      res.send(result)
    })



    //update api:
    app.put('/tourpackages/:id', async (req, res) => {
      const id = req.params.id
      const updateTourPack = req.body
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedoc = {
        $set: {
          teacherName: updateTourPack.teacherName
        }
      }
      const result = await tourPackagesCollection.updateOne(filter, updatedoc, options)
      res.send(result)
    })

    //delete product api:
    app.delete('/tourpackages/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await tourPackagesCollection.deleteOne(query)
      res.send(result)
    })


    // Booking api starts here 

    app.get('/bookings', async (req, res) => {
      const query = {}
      const cursor = bookingCollection.find(query)
      const bookings = await cursor.toArray()
      res.json(bookings);
    })

    app.post('/bookings', async (req, res) => {
      const newBookings = req.body;
      const result = await bookingCollection.insertOne(newBookings)
      res.send(result)
    })




    app.listen(PORT, () => {
      console.log(`Tour adviser server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Terminate the application if unable to connect to MongoDB
  }
}

connectToMongoDB().catch(console.error);



