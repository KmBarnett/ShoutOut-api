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
const ShoutOut = mongoose.model('1911ShoutOut', shoutOutSchema);

app.use(express.json());
app.use(cors());

app.locals.title = 'ShoutOut API';
app.locals.ideas = [];

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
          response.status(422);
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
          return Promise.reject(err);
        } else {
          return response.status(201).json(newIdea);
        }
      })
    })
    .catch(next);


});

app.delete('/api/v1/ideas/:id', async(request, response, next) => {
  const { id } = request.params;
  let match = new Promise((resolve, reject) => {
    ShoutOut
      .findOneAndDelete({"id": id})
      .exec((err, result) => {
        if (err) {
          reject(response.status(400))
        }
        resolve(result)
      });
  });

  match
    .then(result => {
      if (result) {
        return response.sendStatus(204);
      } else {
        return Promise.reject(`No shout out found with an id of ${id}`)
      }
    })
    .catch(next);

});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is now running on port ${app.get('port')}!`);
});
