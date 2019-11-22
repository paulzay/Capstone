const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const model = require('./model/model');
const auth = require('./midll/auth');
const multer = require('./midll/multer');
const config = require('./configs/cloudinaryConfig');

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { uploader } = config;
const { cloudinaryConfig } = config;
const { multerUploads } = multer;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-Width, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST ,PUT ,DELETE, PATCH, OPTIONS');
  next();
});
app.use('*', cloudinaryConfig);


const connectionString = 'postgres://postgres:fay&zay27@localhost:5432/timwerk';
const client = new Client({
  connectionString,
});
client.connect();

app.get('/', (req, res, next) => {
  console.log('Welcome to Teamwork');
});

app.post('/api/v1/auth/create-user', auth, model.createUser);
app.post('/api/v1/signin', model.signIn);
app.post('/api/v1/gifs', auth, multerUploads, model.postGif);
app.post('/api/v1/articles', auth, model.createArticle);
app.patch('/api/v1/articles/:id', auth, model.editArticle);
app.delete('/api/v1/articles/:id', auth, model.deleteArticle);
app.delete('/api/v1/gifs/:id', auth, model.deleteGif);

module.exports = app;
