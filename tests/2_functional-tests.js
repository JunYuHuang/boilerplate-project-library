/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const API_ROOT = "/api/books";

function postBook(bookObj) {
  return new Promise((resolve, reject) => {
    chai
      .request(server)
      .post(API_ROOT)
      .send(bookObj)
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        if (res.body.length > 0) {
          assert.property(
            res.body[0],
            "commentcount",
            "Books in array should contain commentcount"
          );
          assert.property(
            res.body[0],
            "title",
            "Books in array should contain title"
          );
          assert.property(
            res.body[0],
            "_id",
            "Books in array should contain _id"
          );
        }
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        // test 1
        test("Test POST /api/books with title", async () => {
          const formData = { title: "Test Book Title" };
          const res = await chai.request(server).post(API_ROOT).send(formData);
          // assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.equal(res.body.title, formData.title);
        });
        // test 2
        test("Test POST /api/books with no title given", async () => {
          const formData = {};
          const res = await chai.request(server).post(API_ROOT).send(formData);
          // assert.equal(res.status, 200);
          assert.equal(res.body, "missing required field title");
        });
      }
    );
    suite("GET /api/books => array of books", function () {
      // test 3
      test("Test GET /api/books", async () => {
        const booksData = [
          { title: "Test Book 1" },
          { title: "Test Book 2" },
          { title: "Test Book 3" },
        ];
        await Promise.all(booksData.map((data) => postBook(data)));
        const getRes = await chai.request(server).get(API_ROOT);
        assert.equal(getRes.status, 200);
        assert.isArray(getRes.body);
        assert.isAtLeast(getRes.body.length, 3);
        getRes.body.forEach((book) => {
          assert.isObject(book);
          assert.property(book, "title");
          assert.isString(book.title);
          assert.property(book, "_id");
          assert.property(book, "commentcount");
          assert.isNumber(book.commentcount);
        });
      });
    });
    suite("GET /api/books/[id] => book object with [id]", function () {
      // test 4
      test("Test GET /api/books/[id] with id not in db", async () => {
        const getRes = await chai
          .request(server)
          .get(`${API_ROOT}/invalidBookId`);
        // assert.equal(res.status, 200);
        assert.equal(getRes.body, "no book exists");
      });
      // test 5
      test("Test GET /api/books/[id] with valid id in db", async () => {
        const formData = { title: "GET Single Book Test" };
        const book = await chai.request(server).post(API_ROOT).send(formData);
        const getRes = await chai
          .request(server)
          .get(`${API_ROOT}/${book.body._id}`);
        assert.equal(getRes.status, 200);
        const { title, _id, comments } = getRes.body;
        assert.isObject(getRes.body);
        assert.isString(title);
        assert.equal(title, formData.title);
        assert.isDefined(_id);
        assert.isArray(comments);
      });
    });
    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        // test 6
        test("Test POST /api/books/[id] with comment", async () => {
          const bookFormData = { title: "POST Book Title with comment" };
          const book = await postBook(bookFormData);
          const commentFormData = { comment: "comment on book" };
          const postRes = await chai
            .request(server)
            .post(`${API_ROOT}/${book.body._id}`)
            .send(commentFormData);
          // assert.equal(res.status, 200);
          const { _id, title, comments, commentcount } = postRes.body;
          assert.isObject(postRes.body);
          assert.isDefined(_id);
          assert.isString(title);
          assert.isNumber(commentcount);
          assert.lengthOf(comments, 1);
          assert.isString(comments[0]);
          assert.equal(comments[0], commentFormData.comment);
        });
        // test 7
        test("Test POST /api/books/[id] without comment field", async () => {
          try {
            const bookFormData = { title: "POST Book Title without comment" };
            const bookId = await postBook(bookFormData).body._id;
            const postRes = await chai
              .request(server)
              .post(`${API_ROOT}/${bookId}`)
              .send({});
            // assert.equal(res.status, 200);
            assert.equal(postRes.body, "missing required field comment");
            assert.isString(postRes.body);
          } catch (err) {
            console.log(err);
          }
        });
        // test 8
        test("Test POST /api/books/[id] with comment, id not in db", async () => {
          try {
            const postRes = await chai
              .request(server)
              .post(`${API_ROOT}/`)
              .send({ comment: "comment for nonexistent book in database" });
            // assert.equal(res.status, 200);
            assert.equal(postRes.body, "no book exists");
            assert.isString(postRes.body);
          } catch (err) {
            console.log(err);
          }
        });
      }
    );
    suite("DELETE /api/books/[id] => delete book object id", function () {
      // test 9
      test("Test DELETE /api/books/[id] with valid id in db", async () => {
        const bookFormData = { title: "Book to be DELETED" };
        const book = await postBook(bookFormData);
        const deleteRes = await chai
          .request(server)
          .delete(`${API_ROOT}/${book.body._id}`);
        // assert.equal(res.status, 200);
        assert.isString(deleteRes.body);
        assert.equal(deleteRes.body, "delete successful");
      });
      // test 10
      test("Test DELETE /api/books/[id] with id not in db", async () => {
        const deleteRes = await chai
          .request(server)
          .delete(`${API_ROOT}/nonexistentBookId`);
        // assert.equal(res.status, 200);
        assert.isString(deleteRes.body);
        assert.equal(deleteRes.body, "no book exists");
      });
    });
    suite("DELETE /api/books => delete all books", function () {
      // test 11
      test("Test DELETE /api/books", async () => {
        const deleteRes = await chai.request(server).delete(API_ROOT);
        // assert.equal(res.status, 200);
        assert.isString(deleteRes.body);
        assert.equal(deleteRes.body, "complete delete successful");
      });
    });
  });
});
