const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/secrets");

const User = require("../users/users-model");
const checkCredentials = require("../middleware/check-payload-middleware");
const checkUsernameFree = require("../middleware/check-username-free-middleware");

const makeToken = (user) => {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, jwtSecret, options);
};

router.post(
  "/register",
  checkCredentials,
  checkUsernameFree,
  (req, res, next) => {
    let user = req.body;
    const rounds = 8;
    const hash = bcrypt.hashSync(user.password, rounds);
    user.password = hash;
    User.add(user)
      .then((saved) => {
        res.status(201).json(saved);
      })
      .catch(next);
  }
);

router.post("/login", checkCredentials, (req, res, next) => {
  let { username, password } = req.body;

  User.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = makeToken(user);
        res.status(200).json({
          message: `welcome, ${user.username}`,
          token,
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(next);
});

module.exports = router;
