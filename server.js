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

  if (!db.data || !Array.isArray(db.data.dogs)) {
    db.data = { dogs: [] };
    await db.write();
  }

  // GET all dogs
  app.get('/api/dogs', async (req, res) => {
    await db.read();
    res.json(db.data.dogs);
  });

  // POST new dog
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

  // PUT update dog
  app.put('/api/dogs/:id', async (req, res) => {
    const { id } = req.params;
    const { breed, sub_breed } = req.body;

    const dog = db.data.dogs.find(d => d.id === id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });

    dog.breed = breed || dog.breed;
    dog.sub_breed = sub_breed || dog.sub_breed;

    await db.write();
    res.json(dog);
  });

  // DELETE dog
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
