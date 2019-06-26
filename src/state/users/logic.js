import { createLogic } from "redux-logic"
import {
  map,
} from "lodash";

import { 
  REQUEST_CURRENT_USER_BY_ID,
  RECEIVE_USER,
  REQUEST_FAILED,
  SUBMIT_REQUEST_ACCESS,
  SUBMIT_REQUEST_ACCESS_SUCCESS,
  REQUEST_PENDING_USERS,
  RECEIVE_PENDING_USERS,
  APPROVE_USER_REQUEST,
  REJECT_USER_REQUEST,
  HANDLE_APPROVE_REJECT,
  SUBMIT_SUBSCRIBER_SUCCESS,
  SUBMIT_SUBSCRIBER,
} from "./constants";

const requestPendingUsersLogic = createLogic({
    process({firebasedb}) {
      return firebasedb.ref('pending_access_request').once('value')
        .then(snapshot => map(snapshot.val(), (user, key) => {
          return {
            ...user, 
            uid: key
          }
        })
        )
    },
    processOptions: {
      failType: REQUEST_FAILED,
      successType: RECEIVE_PENDING_USERS,
    },
  type: REQUEST_PENDING_USERS,
});

const approveUserRequestLogic = createLogic({
  process({
    action,
    firebasedb
  }) {
      const { payload } = action;
      const ref = firebasedb.ref(`users/${payload.uid}`);
      return ref.update({
        [payload.accessLevel]: true,
        [payload.moderator]: payload.moderator || null,
    }).then(() => {
        const ref = firebasedb.ref(`pending_access_request/${payload.uid}`);
        return ref.remove();
    })
    .then(() => payload)
  },
  processOptions: {
    failType: REQUEST_FAILED,
    successType: HANDLE_APPROVE_REJECT,
  },
  type: APPROVE_USER_REQUEST,
});

const rejectUserRequestLogic = createLogic({
  process({
    action,
    firebasedb
  }) {
    const {
      payload
    } = action;
      const ref = firebasedb.ref(`pending_access_request/${payload.uid}`);
        ref.remove().then(() => payload)
  },
  processOptions: {
    failType: REQUEST_FAILED,
    successType: HANDLE_APPROVE_REJECT,
  },
  type: REJECT_USER_REQUEST,
});

const fetchCurrentUser = createLogic({
  process({
    action,
    firebasedb,
    }) {
    const { payload } = action;
    return firebasedb.ref(`users/${payload.uid}`)
    .once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        return {
          ...snapshot.val(),
          uid: snapshot.key,
        }
      }
      return firebasedb.ref(`users/${payload.uid}`).update({
        email: payload.email,
        username: payload.username,
        uid: payload.uid,
      }).then(() => {
        return {
          email: payload.email,
          username: payload.username,
          uid: payload.uid,
          mocs: {},     
        }
      })
    })
  },
  processOptions: {
    failType: REQUEST_FAILED,
    successType: RECEIVE_USER,
  },
  type: REQUEST_CURRENT_USER_BY_ID,
});

const requestAccessLogic = createLogic({
  process({
      firebasedb, 
      action,
    }) {
    const {
      payload,
    } = action;
    return firebasedb.ref(`pending_access_request/${payload.user.uid}`).update({
          email: payload.user.email,
          username: payload.user.username,
          ...payload.accessForm,
        })
  },
  processOptions: {
    failType: REQUEST_FAILED,
    successType: SUBMIT_REQUEST_ACCESS_SUCCESS,
  },
  type: SUBMIT_REQUEST_ACCESS,
});

const submitSubscriberLogic = createLogic({
  process({
      firebasedb, 
      action,
    }) {
    const {
      payload,
    } = action;
    return firebasedb.ref(`subscribers/`).push(payload)
  },
  processOptions: {
    failType: REQUEST_FAILED,
    successType: SUBMIT_SUBSCRIBER_SUCCESS,
  },
  type: SUBMIT_SUBSCRIBER,
});

export default [
  fetchCurrentUser,
  approveUserRequestLogic,
  rejectUserRequestLogic,
  requestPendingUsersLogic,
  requestAccessLogic,
  submitSubscriberLogic,
];