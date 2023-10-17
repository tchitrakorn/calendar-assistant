const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const itemController = require('./controllers/itemControllers');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Answers questions related to the user's current calendar
app.get('/track', (req, res) => {
  const prompt = req.body.prompt;
  const response = itemController.track(prompt);
  res.send(response);
});

// Creates, modifies, or deletes an event based on user requirements
app.post('/manage', (req, res) => {
  const prompt = req.body.prompt;
  const response = itemController.manage(prompt);
  res.send(response);
});

// Retrieves online information and personalized recommendations
app.get('/explore', (req, res) => {
  const prompt = req.body.prompt;
  const response = itemController.explore(prompt);
  res.send(response);
});

// Retrieves non-sensitive information from users’ conversation log for Google Analytics
app.get('/analytics', (req, res) => {
  const prompt = req.body.prompt;
  const response = itemController.getAnalytics(prompt);
  res.send(response);
});

// Retrieves user information 
app.get('/data', (req, res) => {
  const prompt = req.body.prompt;
  const response = itemController.getUserData(prompt);
  res.send(response);
});

// Stores/manages user information 
app.post('/data', (req, res) => {
  const prompt = req.body.prompt;
  const response = itemController.manageUserData(prompt);
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});