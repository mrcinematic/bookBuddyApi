const express = require("express");
const apiRouter = express.Router();
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db/users");

apiRouter.use(async (req, res, next) => {
    const auth = req.header("Authorization");
    const prefix = "Bearer ";
    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        console.log(auth);
        const token = auth.slice(prefix.length);
    
        try {
            console.log("checking");
            const parsedToken = jwt.verify(token, process.env.JWT_SECRET);
            console.log(parsedToken);
            const id = parsedToken && parsedToken.id;

            if(id) {
                console.log(id);
                req.user = await getUserById(id);
                console.log(req.user);
                console.log("the request user", req.user);
                next();
            } else {throw new Error({name: "NoIdError", message: "no user found"})}
            
        } catch (err) {
            next(err);
        }
    } else {
        next({
            name: "AuthorizationHeaderErrr",
            message: "Authorization token must start with 'Bearer'",
        });
    }
});

apiRouter.use("/books", require("./books"));

apiRouter.use("/users", require("./users"));

apiRouter.use("/reservations", require("./reservations"));

apiRouter.get("/", (req, res) => {
    res.send("Hello from /api");
});

module.exports = apiRouter;