/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const Book = require("../models/book");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const data = await Book.find({}).select("-__v").lean();
        const response = data
          ? data.map((book) => {
              book.commentcount = book.comments.length;
              return book;
            })
          : [];
        // console.log(response);
        res.json(response);
      } catch (err) {
        console.error(err);
      }
    })

    .post(async (req, res) => {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title || title == undefined || title === "")
        return res.json("missing required field title");

      try {
        const data = await Book.create({ title });
        const response = {
          _id: data._id,
          title: data.title,
        };
        // console.log(response);
        res.json(response);
      } catch (err) {
        console.log(err);
      }
    })

    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'
      try {
        const data = await Book.deleteMany({}).exec();
        return res.json("complete delete successful");
        // console.error("complete delete failed");
      } catch (err) {
        console.error(err);
      }
    });

  app
    .route("/api/books/:id")
    .get(async (req, res) => {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const data = await Book.findById(bookid).select("-__v").lean().exec();
        // console.log(data);
        const response = data
          ? {
              _id: data._id,
              title: data.title,
              comments: data.comments,
              commentcount: data.comments ? data.comments.length : 0,
            }
          : "no book exists";
        // console.log(response);
        res.json(response);
      } catch (err) {
        console.error(err);
        res.json("no book exists");
      }
    })
    // TODO
    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment || comment == undefined || comment === "")
        return res.json("missing required field comment");

      try {
        let book = await Book.findById(bookid).exec();
        book.comments.push(comment);
        book = await book.save();
        console.log(book);
        const response = book
          ? {
              _id: book._id,
              title: book.title,
              comments: book.comments,
              commentcount: book.comments ? book.comments.length : 0,
            }
          : "no book exists";
        // console.log(response);
        res.json(response);
      } catch (err) {
        console.error(err);
        res.json("no book exists");
      }
    })

    .delete(async (req, res) => {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const data = await Book.findByIdAndDelete(bookid).exec();
        if (!data || data == undefined) return res.json("no book exists");

        res.json("delete successful");
      } catch (err) {
        console.error(err);
        res.json("no book exists");
      }
    });
};
