
import express from 'express';
import { createRequire } from 'module';
import LoginController from './Controllers/LoginController.js';
import WishlistController from './Controllers/WishlistController.js';

const require = createRequire(import.meta.url);
const app = require("https-localhost")();


app.use(express.static("public"));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/login', async (req, res) => {
  const Login = new LoginController();
  const result = await Login.login(req.body);
  res.send(result);
})

app.post('/wishlist', async (req, res) => {
  const Wishlist = new WishlistController();
  const result = await Wishlist.add(req.body);
  res.send(result);
})

app.get('/get-adv', async (req, res) => {
  const Wishlist = new WishlistController();
  const result = await Wishlist.get(req.query);
  res.send(result);
})

app.delete('/remove-car', async (req, res) => {
  const Wishlist = new WishlistController();
  const result = await Wishlist.remove(req.body);
  res.send(result);
})

app.patch('/edit-car', async (req, res) => {
  const Wishlist = new WishlistController();
  const result = await Wishlist.patch(req.body);
  res.send(result);
})

app.post('/search-car', async (req, res) => {
  const Wishlist = new WishlistController();
  const result = await Wishlist.search(req.body);
  res.send(result);
})

const http = require('http');
const httpServer = http.createServer(app);

httpServer.listen(8080);