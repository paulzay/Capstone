const express = require('express');

const app = express();

app.use((req, res) =>{
  res.json({message: "test succeeded"})
})

module.exports = app