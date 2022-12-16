const express = require("express");
const router = express.Router();
const fs = require("fs");
const _ = require("lodash");

function checkNumbers(str) {
  return /^\d+$/.test(str);
}

// Get all pokemon (allowed name)
router.get("/", (req, res, next) => {
  const allowedFilter = ["type", "search", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    console.log(page, limit);
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    //     //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from db.json then parse to JSobject
    let pokemonsDB = JSON.parse(fs.readFileSync("pokemon.json", "utf-8"));
    const { pokemons } = pokemonsDB;

    //Filter data by name, type, id
    let result = [];

    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        let filterValue = _.toLower(filterQuery[condition].trim());

        if (condition === "search") {
          if (checkNumbers(filterValue)) {
            result = result.length
              ? result.filter(
                  (pokemon) => pokemon["id"] === parseInt(filterValue)
                )
              : pokemons.filter(
                  (pokemon) => pokemon["id"] === parseInt(filterValue)
                );
          } else {
            result = result.length
              ? result.filter((pokemon) =>
                  pokemon["name"].includes(filterValue)
                )
              : pokemons.filter((pokemon) =>
                  pokemon["name"].includes(filterValue)
                );
          }
        } else if (condition === "type") {
          result = result.length
            ? result.filter((pokemon) => pokemon["types"].includes(filterValue))
            : pokemons.filter((pokemon) =>
                pokemon["types"].includes(filterValue)
              );
        } else {
          result = result.length
            ? result.filter((pokemon) => pokemon[condition] === filterValue)
            : pokemons.filter((pokemon) => pokemon[condition] === filterValue);
        }
      });
    } else {
      result = pokemons;
    }

    // select number of result by offset
    result = result.slice(offset, offset + limit);

    //send response
    const responseData = {
      data: result,
      totalPokemons: result.length,
    };
    res.status(200).send(responseData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
