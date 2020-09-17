require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const movies = require("../data/data.json");

console.log(process.env.API_TOKEN);

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  next();
});

function handleGetMovies(req, res) {
  let response = movies;
  if (req.query.genre) {
    console.log(req.query.genre.toLowerCase());
    response = response.filter((movie) =>
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    );
  }
  if (req.query.country) {
    response = response.filter((movie) =>
      movie.country.toLowerCase().includes(req.query.country.toLowerCase())
    );
  }
  if (req.query.avg_vote) {
    console.log(req.query.avg_vote);
    response = response.filter((movie) => movie.avg_vote >= req.query.avg_vote);
  }
  res.json(response);
}

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/movies", handleGetMovies);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
