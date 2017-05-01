import { join } from 'path';
import express from 'express';
import jwt from 'express-jwt';
import graphql from 'express-graphql';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import { routes, listRoutes } from './routes';
import schema from './graphql';

const app = express();

app.set('port', (process.env.PORT || 8000));
app.set('mongodb-uri', (process.env.MONGODB_URI || 'mongodb://backend-go:backend-go@ds113871.mlab.com:13871/backend-go-demo'));
app.set('secret', process.env.SECRET || 'backendgo');

mongoose.connect(app.get('mongodb-uri'));
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => console.log('Connection Succeeded.'));

app.use(express.static(join(__dirname, '..', 'public')));
app.use(compression());
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', jwt({
  secret: app.get('secret'),
  credentialsRequired: false
}));

app.use('/graphql', graphql(req => ({
  schema,
  graphiql: true,
  rootValue: {
    db: req.app.locals.db
  }
})));

app.use('/', routes);
app.use('/list', listRoutes);

app.listen(app.get('port'), () => {
  console.log('Bootstrap Succeeded.');
  console.log(`Port: ${app.get('port')}.`);
});

export default app;