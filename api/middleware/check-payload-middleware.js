module.exports = (req, res, next) => {
  const { username, password } = req.body;
  const valid = Boolean(username && password && typeof password === "string");

  if (valid) {
    next();
  } else {
    res.status(422).json({
      message: "username and password required",
    });
  }
};
