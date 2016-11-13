// Packages & Dependencies
// ====================================================
import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import express from 'express';
import expressWinston from 'express-winston';
import helmet from 'helmet';
import hpp from 'hpp';
import httpStatus from 'http-status';
import morgan from 'morgan';
import redis from 'redis';
import winston from 'winston';
import APIError from './helpers/api.error';
import routes from './routes/index.route';

Promise = require('bluebird'); // eslint-disable-line no-global-assign

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const app = express();

// Logger Configurations
// ====================================================
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true,
    }),
  ],
});

if (process.env.NODE_ENV === 'dev') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true,
  }));
}

app.use(expressWinston.errorLogger({
  winstonInstance: logger,
}));

// App & Middleware Configurations
// ====================================================
app.use(morgan('dev'));
app.use(compression());
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use('/api', routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

// catching 404 errors and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('Invalid Resource', httpStatus.NOT_FOUND);
  return next(err);
});

// error handler that sends stack trace only during developmenet
app.use((err, req, res, next) => // eslint-disable-line no-unused-vars
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: process.env.NODE_ENV === 'dev' ? err.stack : {},
  })
);

if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    winston.info(`server started on port ${config.port} (${process.env.NODE_ENV})`);
  });
}
