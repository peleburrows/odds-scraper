const fetch = require('node-fetch');

// event and context are 2 default params
exports.handler = async function (event, context) {
    // its currently a string so parse it so we can access it
    const eventBody = JSON.parse(event.body);
    // concatenate the passed in variable to the url
    const POKE_API = 'https://pokeapi.co/api/v2/pokedex/' + eventBody.region;

    const response = await fetch(POKE_API);
    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify({
            pokemon: data.pokemon_entries
        })
    }
}