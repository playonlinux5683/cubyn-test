import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as logger from 'morgan';

import ParcelApi from './routes/parcel.api';

import cors = require('cors');

export class App {

  public express: express.Application;

  constructor() {
    this.express = express();

    // Enable CORS
    this.express.use(cors());

    this.middleware();
    this.routes();
  }

  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {
    this.express.use('/parcel', ParcelApi);
  }



}

const app = new App().express;
export default app;
