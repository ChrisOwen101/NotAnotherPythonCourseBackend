const dotenv = require("dotenv");

dotenv.config();

const url = require("url");
const patreonLib = require("patreon");
const patreon = patreonLib.patreon;
const oauth = patreonLib.oauth;
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

const clientId = process.env.PATREON_CLIENT_ID;
const clientSecret = process.env.PATREON_CLIENT_SECRET;
// redirect_uri should be the full redirect url
const redirect = "http://localhost:5001/oauth/redirect";

const oauthClient = oauth(clientId, clientSecret);

const database = {};

app.get("/oauth/redirect", (req, res) => {
  const { code } = req.query;
  let token;

  return oauthClient
    .getTokens(code, redirect)
    .then(({ access_token }) => {
      return res.redirect(`http://localhost:3000/?token=${access_token}`);
    })
    .catch((err) => {
      console.log(err);
      console.log("Redirecting to login");
      res.redirect("/");
    });
});

app.get("/user/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const apiClient = patreon(token);
    const { rawJson } = await apiClient("/current_user");
    const user = rawJson.data;
    res.send(JSON.stringify(user));
  } catch (err) {
    console.log(err);
  }
});

app.get("/", (req, res) => {
  res.send(JSON.stringify({ running: true }));
});

const server = app.listen(5001, () => {
  const { port } = server.address();
  console.log(`Listening on http:/localhost:${port}`);
});
