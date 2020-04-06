require('dotenv').config(); // Allows us to get and use environmental variables
const express = require('express');
const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTION_STRING, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  dbName: "ShoutOuts"
})
  .catch(error => console.error(error));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected!');
});

const shoutOutSchema = require('./shoutOutSchema.js');
const ShoutOut = mongoose.model('sample-shouts-out', shoutOutSchema);

app.use(express.json());
app.use(cors());

app.locals.title = 'IdeaBox API';
app.locals.ideas = [
  {id: 1, title: 'Sweaters for pugs', description: 'To keep them warm'},
  {id: 2, title: 'A romcom', description: 'But make it ghosts'},
  {id: 3, title: 'A game show called Ether/Or', description: 'When you lose you get chloroformed'},
];

app.set('port', 3001);

app.get('/api/v1/ideas', (request, response) => {
  ShoutOut
    .find()
    .select('id title description')
    .exec((err, results) => {
      if (err) {
        return response.status(422).json(err)
      } else {
        response.status(200).json(results);
      }
    })
  //response.status(200).json(app.locals.ideas);
});

app.get('/api/v1/ideas/:id', (request, response) => {
  const { id } = request.params;

  ShoutOut.findOne({"id": id})
    .select("id title description")
    .exec((err, result) => {
      if (err) {
        return response.status(404).json(err)
      } else if (!result) {
        return response.status(404).json({'message': `No entry with id ${id} found`})
      } else {
        return response.status(200).json(result);
      }
    });

});

app.post('/api/v1/ideas', (request, response) => {
  const newIdea = request.body;
  console.log(newIdea);
  const newIdeaDoc = new ShoutOut(request.body);
  for (let requiredParameter of ['id', 'title', 'description']) {
    if (!newIdea[requiredParameter]) return response.status(422).json({message: `You are missing a required parameter of ${requiredParameter}`});
  }

  app.locals.ideas = [...app.locals.ideas, newIdea];

  newIdeaDoc.save(err => {
    if (err) {
      return response.status(422).json({'message': 'You messed up'})
    } else {
      return response.status(201).json({message: 'Shout out created'});
    }
  });

  //return response.status(201).json(newIdea);
});

app.delete('/api/v1/ideas/:id', (request, response) => {
  const { id } = request.params;
  const match = app.locals.ideas.find(idea => idea.id == id);

  if (!match) return response.status(404).json({message: `No idea found with an id of ${id}`});

  const filteredIdeas = app.locals.ideas.filter(idea => idea.id != id);

  app.locals.ideas = filteredIdeas;

  return response.sendStatus(204);
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is now running on port ${app.get('port')}!`);
});
