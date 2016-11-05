// Packages & Dependencies
// ====================================================
import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';


// App & Middleware Configurations
// ====================================================
const app = express();
app.use(morgan('dev'));
app.use(compression());
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.listen(config.get('port'));
console.info(`Server Port opened at ${config.port}`);
