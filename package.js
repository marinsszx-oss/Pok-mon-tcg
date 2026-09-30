{
  "name": "pokemon-tcg-server",
  "version": "23.0.0",
  "description": "Servidor multiplayer do Pokémon TCG v23.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "socket.io": "^4.7.5",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "license": "MIT",
  "author": "Enzo Souza de Marins"
}