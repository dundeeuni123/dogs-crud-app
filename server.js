const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const adapter = new JSONFile('db.json');
const defaultData = { dogs: [] };
const db = new Low(adapter, defaultData);


async function startServer() {
  await db.read();

  // If db is empty or dogs list is missing, seed from dogs.json
  if (!db.data || !Array.isArray(db.data.dogs) || db.data.dogs.length === 0) {
    // Read dogs.json and convert it into an array of dogs with id, breed, and sub_breed
    const rawData = fs.readFileSync(path.join(__dirname, 'dogs.json'), 'utf-8');
    const dogsObject = JSON.parse(rawData);

    // Convert dogsObject (which has breeds as keys and sub-breeds as arrays) into array form
    const dogsArray = [];

    Object.entries(dogsObject).forEach(([breed, subBreeds]) => {
      if (subBreeds.length === 0) {
        dogsArray.push({ id: Date.now().toString() + Math.random(), breed, sub_breed: null });
      } else {
        subBreeds.forEach(sub => {
          dogsArray.push({ id: Date.now().toString() + Math.random(), breed, sub_breed: sub });
        });
      }
    });

    db.data = { dogs: dogsArray };
    await db.write();
    console.log('Database seeded from dogs.json');
  }

  // GET /api/dogs
  app.get('/api/dogs', async (req, res) => {
    await db.read();
    res.json(db.data.dogs);
  });

  // POST /api/dogs
  app.post('/api/dogs', async (req, res) => {
    const { breed, sub_breed } = req.body;
    if (!breed) return res.status(400).json({ error: 'Breed is required' });

    const newDog = {
      id: Date.now().toString(),
      breed,
      sub_breed: sub_breed || null
    };

    db.data.dogs.push(newDog);
    await db.write();
    res.status(201).json(newDog);
  });

  // PUT /api/dogs/:id
  app.put('/api/dogs/:id', async (req, res) => {
  const { id } = req.params;
  const { breed, sub_breed } = req.body;

  const dog = db.data.dogs.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: 'Dog not found' });

  if (breed !== undefined) dog.breed = breed;
  if (sub_breed !== undefined) dog.sub_breed = sub_breed;

  await db.write();
  res.json(dog);
});

  // DELETE /api/dogs/:id
  app.delete('/api/dogs/:id', async (req, res) => {
    const { id } = req.params;
    db.data.dogs = db.data.dogs.filter(d => d.id !== id);
    await db.write();
    res.status(204).end();
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
