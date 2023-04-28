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
const production = process.env.PRODUCTION;

let REDIRECT_URL;

if (production) {
  REDIRECT_URL =
    "https://not-another-python-course-back.herokuapp.com/oauth/redirect";
} else {
  REDIRECT_URL = "http://localhost:5555/oauth/redirect";
}

console.log(REDIRECT_URL);

let FRONTEND_URL;
if (production) {
  //TODO
  FRONTEND_URL = "https://not-another-python-course.vercel.app/";
} else {
  FRONTEND_URL = "http://localhost:3000";
}

console.log(FRONTEND_URL);

const oauthClient = oauth(clientId, clientSecret);

app.get("/oauth/redirect", (req, res) => {
  const { code } = req.query;
  let token;

  return oauthClient
    .getTokens(code, REDIRECT_URL)
    .then(({ access_token }) => {
      return res.redirect(`${FRONTEND_URL}/?token=${access_token}`);
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

const server = app.listen(process.env.PORT || 5555, () => {
  const { port } = server.address();
  console.log(`Listening on http:/localhost:${port}`);
});
