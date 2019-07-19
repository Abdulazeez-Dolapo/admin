import { makeConstant } from "../../utils";

const STATE_BRANCH = "SMSUSERS";

export const REQUEST_FAILED = makeConstant(STATE_BRANCH, 'REQUEST_FAILED');

export const REQUEST_TOTAL_USERS = makeConstant(STATE_BRANCH, 'REQUEST_TOTAL_USERS');
// TODO: export const REQUEST_USERS_BY_STATE = makeConstant(STATE_BRANCH, 'REQUEST_USERS_BY_STATE');

export const RECEIVE_TOTAL_USERS = makeConstant(STATE_BRANCH, 'RECEIVE_TOTAL_USERS');
// TODO: export const RECEIVE_USERS_BY_STATE = makeConstant(STATE_BRANCH, 'RECEIVE_USERS_BY_STATE');

export const REQUEST_CACHE = makeConstant(STATE_BRANCH, 'REQUEST_CACHE');
export const RECEIVE_SMS_CACHE = makeConstant(STATE_BRANCH, 'RECEIVE_SMS_CACHE');
export const SEND_SMS_MESSAGE = makeConstant(STATE_BRANCH, 'SEND_SMS_MESSAGE');
export const SENT_MESSAGE = makeConstant(STATE_BRANCH, 'SENT_MESSAGE');
export const RECEIVE_MESSAGE = makeConstant(STATE_BRANCH, "RECEIVE_MESSAGE");