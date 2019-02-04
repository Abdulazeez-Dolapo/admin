import { applyMiddleware, createStore, combineReducers } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import axios from "axios";

import events from './events';
import mocs from './mocs';
import users from './users';
import selections from './selections';

import { firebaseUrl } from '../state/constants';
import {
  firebasedb,
} from '../utils/firebaseinit';

const reducers = {
  events: events.reducers,
  mocs: mocs.reducers,
  users: users.reducers,
  selections: selections.reducers,
};

const logics = [
  ...events.logics,
  ...users.logics,
  ...mocs.logics,
];

const reduxLogicDependencies = {
  firebaseUrl: firebaseUrl,
  firebasedb,
  httpClient: axios,
};

const logicMiddleware = createLogicMiddleware(logics, reduxLogicDependencies);

const middleware = applyMiddleware(
  logicMiddleware
);

export default () => {
  const store = createStore(
    combineReducers(reducers),
    middleware
  );

  return store;
};