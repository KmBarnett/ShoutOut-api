const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.locals.title = 'IdeaBox API';
app.locals.ideas = [
  {id: 1, title: 'We Are All In This Together', description: '"Quote: from Highschool musical." Please use this to Shout out fellow students', password:'1911-Shout-Out'},
  { title: "Name", description: "Why you are shouting them out!", id: 1585755192067, password:'1911-Shout-Out'}
];

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

app.get('/api/v1/ideas', (request, response) => {
  let formatedIdeas = app.locals.ideas.map(idea => {
    return {
        id: idea.id,
        title: idea.title,
        description: idea.description
      }
  })
  response.status(200).json(app.locals.ideas);
});

app.get('/api/v1/ideas/:id', (request, response) => {
  const { id } = request.params;
  const match = app.locals.ideas.find(idea => idea.id == id);
  const formatedIdea = {
    id: match.id,
    title: match.title,
    description: match.description
  }

  if (!match) return response.status(404).json({message: `No idea found with an id of ${id}`});

  return response.status(200).json(formatedIdea);
});

app.post('/api/v1/ideas', (request, response) => {
  const newIdea = request.body;

  for (let requiredParameter of ['id', 'title', 'description', 'password']) {
    if (!newIdea['password'] !== '1911-Shout-Out') return response.status(422).json({message: `Your password is incorrect you cannot post`});
    if (!newIdea[requiredParameter]) return response.status(422).json({message: `You are missing a required parameter of ${requiredParameter}`});
  }

  app.locals.ideas = [...app.locals.ideas, newIdea];

  return response.status(201).json(newIdea);
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
