const express = require("express");
const { 
    getBooks, 
    getBook, 
    createBook, 
    deleteBook, 
    updateBook,
} = require("../db");

const { createReservation } = require("../db/reservations");
const {requireUser} = require("./utils");

const bookRouter = express.Router();

bookRouter.get("/", async (req, res, next) => {
    try {
        const results = await getBooks();
        res.send(results);
    } catch (err) {
        next(err);
    }
});

bookRouter.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        console.log(id);
        if (isNaN(id) || req.params.id === " ") {
            next({
                name: "InvalidIDFormat",
                message: "The provided request parameter is not a valid book ID",
            });
            return;
        }
        const result = await getBook(id);
        if (!result) {
            next({
                name: "Not Found",
                message: "No matching book found",
            });
            return;
        }
        res.send(result);
    } catch (err) {
        next(err);
    }
});

bookRouter.post("/", async (req, res) => {
    try {
        const result = await createBook(req.body);
        console.log(result);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

bookRouter.delete("/:id", requireUser, async (req, res) => {
    try {
        const result = await deleteBook(req.params.id);
        console.log(result);
        res.send({ message: "book deleted successfully", id: result });
} catch (err) {
        res.send(err);
    }
});

bookRouter.patch("/:id", requireUser, async(req, res, next) => {
    console.log("USER", req.user);
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || req.params.id === " ") {
            next({
                name: "InvalidIDFormat",
                message: "The provided request parameter is not a valid book ID.",
            });
            return;
        }
        const result = await getBook(id);
        if(!result) {
            next({
                name: "Not Found",
                message: "no matching book found"
            });
            return;
        } else {
            const updated = await updateBook(req.params.id, req.body.available);
            if (updated) {
                await createReservation({ userId: req.user.id, booksId: updated.id });
                res.send({
                    message: "updated successfully",
                    updated,
                });
            } else {
                next({
                    name: "UpdateError",
                    message: "There was an error updating this book.",
                });
                return;
            }
        }
    } catch (err) {
        next(err);
    }
});

module.exports = bookRouter;