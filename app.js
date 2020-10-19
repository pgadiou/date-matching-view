const express = require('express');
const requireAll = require('require-all');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('express-jwt');
const morgan = require('morgan');
const { errorHandler, logger } = require('forest-express');
const {
  ensureAuthenticated,
  PUBLIC_ROUTES,
} = require('forest-express-sequelize');

const app = express();

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let allowedOrigins = [/\.forestadmin\.com$/];

if (process.env.CORS_ORIGINS) {
  allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(','));
}

app.use(cors({
  origin: allowedOrigins,
  allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
  maxAge: 86400, // NOTICE: 1 day
  credentials: true,
}));

app.use(jwt({
  secret: process.env.FOREST_AUTH_SECRET,
  credentialsRequired: false,
}));

function scopeMiddleware(request, response, next) {
  ensureAuthenticated(request, response, (error) => {
    if (error || !request.user) {
      return next();
    }

    const notAllowedTeams = ['Devs'];
    const restrictedEnvironments = ['production'];

    if (restrictedEnvironments.includes(process.env.NODE_ENV) && notAllowedTeams.includes(request.user.team)) {
      return response.status(403).send({ error: 'access to this environment data is forbidden for the user' });
    }
    next();
  });
}

app.use('/forest', (request, response, next) => {
  if (PUBLIC_ROUTES.includes(request.url)) {
    return next();
  }
  return scopeMiddleware(request, response, next);
});

requireAll({
  dirname: path.join(__dirname, 'routes'),
  recursive: true,
  resolve: (Module) => app.use('/forest', Module),
});

requireAll({
  dirname: path.join(__dirname, 'middlewares'),
  recursive: true,
  resolve: (Module) => Module(app),
});

app.use(errorHandler({ logger }));

module.exports = app;
