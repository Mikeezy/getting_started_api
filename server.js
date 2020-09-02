const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const config = require('./config');
const runDB = require('./config/database');
const errorHandlerMiddleware = require('./src/middlewares/errorHandlerMiddleware');
const notFindMiddleware = require('./src/middlewares/notFindMiddleware');
const v1Router = require('./src/routers/v1/api_router');
const authRouter = require('./src/routers/v1/auth_router');
const { handleError } = require('./src/utils/customError');

const createServer = () => {
  // Launch the connection with the database.
  runDB();

  // Express
  const app = express();

  // Morgan configuration
  morgan.token('body', (req) => {
    return req.body;
  });

  morgan.token('params', (req) => {
    return req.params;
  });

  morgan.token('query', (req) => {
    return req.query;
  });

  function morganFormatter(tokens, req, res) {
    const format = {
      date: tokens.date(req, res, 'clf'),
      httpVersion: tokens['http-version'](req, res),
      method: tokens.method(req, res),
      referrer: tokens.referrer(req, res),
      remoteAddr: tokens['remote-addr'](req, res),
      requestHeader: tokens.req(req, res, 'header'),
      responseHeader: tokens.res(req, res, 'header'),
      statusCode: tokens.status(req, res),
      url: tokens.url(req, res),
      userAgent: tokens['user-agent'](req, res),
      body: tokens.body(req, res),
      params: tokens.params(req, res),
      query: tokens.query(req, res),
    };

    return JSON.stringify(format);
  }

  // Middleware configuration
  app.use(cors());

  if (config.get('nodeEnv') === 'production') {
    app.use(helmet());
    app.set('trust proxy', true);
  }

  app.use(morgan(morganFormatter));

  app.use(
    bodyParser.json({
      limit: '50mb',
    })
  );

  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
      parameterLimit: 500000,
    })
  );

  // Static files configuration
  app.use(express.static(path.join(__dirname, 'src', 'uploads')));

  // Application Path configuration
  app.use('/v1', authRouter, v1Router);
  app.use(notFindMiddleware);
  app.use(errorHandlerMiddleware);

  // Process Handler configuration
  process.on('unhandledRejection', (reason, p) => {
    throw reason;
  });

  process.on('uncaughtException', async (error) => {
    try {
      const isOperationalError = await handleError(error);
      if (!isOperationalError) process.exit(1);
    } catch (e) {
      process.exit(1);
    }
  });

  return app;
};

module.exports = {
  createServer,
};
