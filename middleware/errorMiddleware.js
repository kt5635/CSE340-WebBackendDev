function errorMiddleware(err, req, res, next) {
  console.error("Error caught by middleware:", err.message);

  res.status(err.status || 500);
  res.render("error", { 
    title: "Server Error",
    message: "Oops! Something went wrong on our end.",
    error: err 
  });
}

module.exports = errorMiddleware;