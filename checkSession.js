function checkSession(req, res, next) {
  if (req.session && req.session.userId) {
    next(); // Session is valid
  } else {
    res.redirect('/login'); // Not logged in
  }
}

module.exports = checkSession;