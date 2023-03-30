const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  comments: {
    type: [String],
    required: false,
    default: [],
  },
});

const Book = model("Book", bookSchema);
module.exports = Book;
