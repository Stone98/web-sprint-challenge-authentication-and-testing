const User = require("../users/users-model");

module.exports = async (req, res, next) => {
  try {
    const rows = await User.findBy({ username: req.body.username });
    if (!rows.length) {
      next();
    } else {
      res.status(422).json({ message: "username taken" });
    }
  } catch (e) {
    next(e);
  }
};
