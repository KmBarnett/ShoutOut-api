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

app.post('/api/v1/ideas', async (request, response, next) => {
  const {id, title, description, password} = request.body;
  const newIdea = {id, title, description};
  const newIdeaDocument = new ShoutOut(request.body);

  if (password !== "1911-Shout-Out") {
    return response.status(422).json({"message": "Incorrect password -- post not permitted"});
  }

  for (let requiredParameter of ['id', 'title', 'description']) {
    if (!newIdea[requiredParameter]) return response.status(422).json({message: `You are missing a required parameter of ${requiredParameter}`});
  }

  let query = new Promise( (resolve, reject) => {
    ShoutOut.findOne({"id": id})
      .exec((err, result) => {
        if (result) {
          console.log('IN EXEC');
          reject(`Shout out with id ${id} already exists.`)
        } else {
          resolve() 
        }
      })
  });

  query
    .then(() => {
      newIdeaDocument.save(err => {
        if (err) {
          console.log('89')
          return Promise.reject(err);
        } else {
          console.log('93');
          return response.status(201).json(newIdea);
        }
      })
    })
    .catch(next);


});

app.delete('/api/v1/ideas/:id', async(request, response) => {
  const { id } = request.params;
  let match;
  
  try {
      match = await ShoutOut
      .findOneAndDelete({"id": id})
      .exec((err, result) => {
        if (err) {
          return response.status(400).json(err);
        } 
        console.log('In exec');
        return match = result;
      });
  } catch (err) {
    next(err);
  }

  if (!match) {
    console.log('in false match');
    return response.status(404).json({message: `No shout out found with an id of ${id}`});
  }

  return response.sendStatus(204);
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is now running on port ${app.get('port')}!`);
});
