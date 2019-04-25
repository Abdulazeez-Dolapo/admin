import {
  DELETE_EVENT_SUCCESS,
  DELETE_EVENT_FAIL,
  REQUEST_EVENTS_SUCCESS,
  REQUEST_EVENTS_FAILED,
  ARCHIVE_EVENT_SUCCESS,
  APPROVE_EVENT_SUCCESS,
  REQUEST_OLD_EVENTS_SUCCESS,
  SET_LOADING,
  UPDATE_EVENT_SUCCESS,
  GET_USER_EMAIL_FOR_EVENT_SUCCESS,
  GET_USER_EMAIL_FOR_OLD_EVENT_SUCCESS,
} from "./constants";
import { filter, map } from "lodash";

const initialState = {
  allEvents: {},
  allOldEvents: {},
  error: null,
  loading: false,
};

const eventReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_EVENTS_SUCCESS:
      return {
        ...state,
        allEvents: action.payload,
        error: null
      };
    case REQUEST_OLD_EVENTS_SUCCESS:
      return {
        ...state,
        allOldEvents: [...state.allOldEvents, ...action.payload],
        error: null
      };
    case GET_USER_EMAIL_FOR_EVENT_SUCCESS:
      return {
        ...state,
        allEvents: state.allEvents.map((event) => event.eventId === action.payload.eventId ? {
          ...event,
          enteredBy: action.payload.email
        } : event)
    };
    case GET_USER_EMAIL_FOR_OLD_EVENT_SUCCESS:
      return {
        ...state,
        allOldEvents: state.allOldEvents.map((event) => event.eventId === action.payload.eventId ? {
          ...event,
          enteredBy: action.payload.email
        } : event)
      };
    case REQUEST_EVENTS_FAILED:
      console.log(`GET_EVENTS_FAILED: ${action.payload}`);
      return {
        ...state,
        error: action.payload
      };
    case DELETE_EVENT_SUCCESS:
      return {
        ...state,
        allEvents: filter(state.allEvents, (ele) => ele.eventId !== action.payload)
      }
    case ARCHIVE_EVENT_SUCCESS:
      return {
        ...state,
        allEvents: filter(state.allEvents, (ele) => ele.eventId !== action.payload)
      }
    case APPROVE_EVENT_SUCCESS:
      return {
        ...state,
        allEvents: filter(state.allEvents, (ele) => ele.eventId !== action.payload)
      }
    case DELETE_EVENT_FAIL: 
      return {
        ...state,
      }
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
      case UPDATE_EVENT_SUCCESS:
        return {
          ...state,
          allEvents: map(state.allEvents, (ele) => {
            if(ele.eventId === action.payload.eventId) {
              return {...ele, ...action.payload}
            }
            return ele
          })
        }
    default:
      return state;
  }
};

export default eventReducer;