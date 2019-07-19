import { 
  REQUEST_TOTAL_USERS, REQUEST_CACHE, SEND_SMS_MESSAGE, RECEIVE_MESSAGE
} from "./constants";

export const requestTotalCount = () => ({
  type: REQUEST_TOTAL_USERS,
});

export const requestCache = () => ({
  type: REQUEST_CACHE,
})

export const sendMessage = (payload) => ({
  payload,
  type: SEND_SMS_MESSAGE,
})

export const receiveMessage = payload => ({
  payload,
  type: RECEIVE_MESSAGE,
})