const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Answers questions related to the user's current calendar
app.get('/track', (req, res) => {
  res.send("track response");
});

// Creates, modifies, or deletes an event based on user requirements
app.post('/manage', (req, res) => {
  res.send("manage response");
});

// Retrieves online information and personalized recommendations
app.get('/explore', (req, res) => {
  res.send("explore response");
});

// Retrieves non-sensitive information from users’ conversation log for Google Analytics
app.get('/analytics', (req, res) => {
  res.send("analytics response");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});