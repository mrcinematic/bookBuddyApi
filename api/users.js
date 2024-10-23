const express = require("express");
const userRouter = express.Router();
const { 
    getUserById, 
    getUser,
    getUsers, 
    getUserByEmail, 
    getUsersReservations,
    createUser,
 } = require("../db");

const jwt = require("jsonwebtoken");

const { requireUser } = require("./utils");

// userRouter.get("/:id", async(req, res) => {
//     try {
//         const { id } = req.params;
//         const result = await getUserById(id);
//         res.send(result);
//     } catch (err) {
//         res.send({ err, message: "something went wrong"});
//     }
// });

userRouter.get("/me", requireUser, async (req, res, next) => {
    try {
        if (req.user) {
            const userReservations = await getUsersReservations(req.user.id);
            console.log(userReservations);
            res.user.books = userReservations;
            res.send(req.user);
        } else {
            res.send("Error, make sure you're loggin in correctly.");
        }
    } catch (err) {}
});

userRouter.post("/register", async (req, res, next) => {
    const { firstname, lastname, email, password } = req.body;
    if (!email) {
        next({ name: "EmailRequiredError", message: "Email not provided!" });
        return;
    }
    if (!password) {
        next({ name: "PasswordRequiredError", message: "Password not provided!" });
        return;
    }
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            next({
                name: "ExistingUserError",
                message: "user already registered with that email",
            });
            return;
        }
        const result = await createUser(req.body);
        if (result) {
            const token = jwt.sign({ id: result.id, email}, process.env.JWT_SECRET, {
                expiresIn: "1w",
            });
            console.log(token);
            res.send({ 
                message: "Registration Successful!", 
                token, 
                user: {
                    id: result.id, 
                    firstname: result.firstname, 
                    lastname: result.lastname, 
                    email: result.email, 
                },
            });
            return;
        } else {
            next({
                name: "RegistrationError",
                message: "error registering, try later",
            });
            return;
        }
    } catch (err) {
        next(err);
    }
});

userRouter.post("/login", async (req, res, next) => {
    const { email, password} = req.body;
    if(!email || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both an email and password!",
        });
    }
    try {
        const result = await getUser(req.body);
        if (result) {
            const token = jwt.sign({ id: result.id, email }, process.env.JWT_SECRET, {
                expiresIn: "1w",
            });
            res.send({ message: "Login successful", token });
        } else {
            next({
                name: "IncorrectCredentialsError",
                message: "Username or password is incorrect",
            });
        }
    } catch (err) {
        next(err);
    }
});

module.exports = userRouter;