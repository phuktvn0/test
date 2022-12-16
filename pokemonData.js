const fs = require("fs");
const csv = require("csvtojson");

const pokemonData = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  //   console.log(newData[1].Type1);
  newData = newData.slice(0, 721);
  newData = newData.map((e, i) => {
    i += 1;
    const types = [];
    if (e.Type2) {
      types.push(e.Type1, e.Type2);
    } else {
      types.push(e.Type1);
    }
    return {
      id: i,
      name: e.Name,
      types: types,
      url: `http://localhost:5000/images/${i}.png`,
    };
  });
  //   console.log(newData);
  let data = JSON.parse(fs.readFileSync("pokemon.json"));
  data.pokemon = [];
  data.pokemon = newData;
  data.totalPokemons = newData.length;
  fs.writeFileSync("pokemon.json", JSON.stringify(data));
};

pokemonData();
