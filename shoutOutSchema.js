const mongoose = require('mongoose');

const shoutOutSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, 'Id is required']
  }, 
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type:String,
    required: [true, 'Description is required']
  }
});

module.exports = shoutOutSchema;
