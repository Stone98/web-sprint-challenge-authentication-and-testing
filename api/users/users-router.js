const router = require("express").Router();

const User = require("./users-model");
const restricted = require("../middleware/restricted");

router.get("/", restricted, (req, res, next) => {
  User.find()
    .then((users) => {
      res.json(users);
    })
    .catch(next);
});

module.export = router;
