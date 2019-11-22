const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const model = require('./model/model');
const auth = require('./midll/auth');
// const bycrypt = require('bcrypt');


// const cors = require('cors');
// const errorHandler = require('./_helpers/error-handler');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors());


// const model = require('./model/model');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-Width, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST ,PUT ,DELETE, PATCH, OPTIONS');
  next();
});
// const express = require('express');


const connectionString = 'postgres://postgres:fay&zay27@localhost:5432/timwerk';
const client = new Client({
  connectionString,
});
client.connect();

app.get('/', (req, res, next) => {
  console.log('Welcome to Teamwork');
});

app.post('/api/v1/auth/create-user', auth, model.createUser);


module.exports = app;
