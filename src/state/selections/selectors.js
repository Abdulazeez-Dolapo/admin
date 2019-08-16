import { createSelector } from 'reselect';
import {
  includes,
  filter,
  map, 
  orderBy,
  reduce,
  uniq,
} from 'lodash';
import moment from 'moment';
import { 
  LIVE_EVENTS_TAB, 
  PENDING_EVENTS_TAB, 
  STATES_LEGS 
} from '../../constants';
import {
  getAllEventsAsList,
  getAllOldEventsWithUserEmails,
} from '../events/selectors';
import { get116thCongress } from '../mocs/selectors';

export const getPendingOrLiveTab = state => state.selections.selectedEventTab;
export const getActiveFederalOrState = state => state.selections.federalOrState;
export const getMode = state => state.selections.mode;
export const getCurrentHashLocation = state => state.selections.currentHashLocation;
export const getOldEventsActiveFederalOrState = state => state.selections.federalOrStateOldEvents;
export const getDateRange = state => state.selections.dateLookupRange;
export const getStatesToFilterArchiveBy = state => state.selections.filterByState;
export const includeLiveEventsInLookup = state => state.selections.includeLiveEvents;
export const getTempAddress = state => state.selections.tempAddress;
export const getChamber = state => state.selections.chamber === null ? 'all' : state.selections.chamber;
export const getEventTypes = state => state.selections.events;
export const getLegislativeBody = state => state.selections.legislativeBody;

export const getLiveEventUrl = createSelector([getActiveFederalOrState], (federalOrState) => {
  if (includes(STATES_LEGS, federalOrState)) {
    return `state_townhalls/${federalOrState}`;
  }
  return 'townHalls';
});

export const getSubmissionUrl = createSelector([getActiveFederalOrState], (federalOrState) => {
  if (includes(STATES_LEGS, federalOrState)) {
    return `state_legislators_user_submission/${federalOrState}`;
  }
  return 'UserSubmission';
});

export const getArchiveUrl = createSelector([getActiveFederalOrState], (federalOrState) => {
  if (includes(STATES_LEGS, federalOrState)) {
    return `archived_state_town_halls/${federalOrState}`;
  }
  return 'archived_town_halls';
});

export const getEventsToShowUrl = createSelector([getPendingOrLiveTab, getSubmissionUrl, getLiveEventUrl], 
    (liveOrPending, submissionUrl, liveEventUrl) => {
    if (liveOrPending === LIVE_EVENTS_TAB) {
        return liveEventUrl
    } else if (liveOrPending === PENDING_EVENTS_TAB) {
        return submissionUrl
    }
    return null;
});

export const getPeopleNameUrl = createSelector([getActiveFederalOrState, getMode], (federalOrState, mode) => {
  if (mode === 'candidate') {
    if (includes(STATES_LEGS, federalOrState)) {
      return `state_candidate_keys/${federalOrState}`;
    }
    return 'candidate_keys';
  }
  if (includes(STATES_LEGS, federalOrState)) {
    return `state_legislators_id/${federalOrState}`;
  }
  return 'mocID';
});

export const getPeopleDataUrl = createSelector([getActiveFederalOrState, getMode], (federalOrState, mode) => {
  if (mode === 'candidate') {
    return 'candidate_data';
  }
  if (includes(STATES_LEGS, federalOrState)) {
    return `state_legislators_data/${federalOrState}`;
  }
  return 'mocData';
});

export const normalizeEventSchema = eventData => {
  const normalizedEvent = {};
  normalizedEvent.eventId = eventData.eventId;
  normalizedEvent.enteredBy = eventData.enteredBy || eventData.userEmail;  
  normalizedEvent.eventName = eventData.eventName ? eventData.eventName : ' ';
  normalizedEvent.displayName = eventData.displayName || eventData.Member;
  normalizedEvent.officePersonId = eventData.officePersonId || ' ';
  normalizedEvent.meetingType = eventData.meetingType || ' ';

  normalizedEvent.location = eventData.location ? eventData.location : eventData.Location ? eventData.Location : ' ';
  normalizedEvent.address = eventData.address || ' ';
  normalizedEvent.lat = eventData.lat || ' ';
  normalizedEvent.lng = eventData.lng || ' ';

  normalizedEvent.govtrack_id = eventData.govtrack_id || ' ';
  normalizedEvent.party = eventData.party || ' ';
  normalizedEvent.level = eventData.level || ' ';
  normalizedEvent.chamber = eventData.chamber || ' ';
  normalizedEvent.state = eventData.state || ' ';
  normalizedEvent.district = eventData.district;

  // The raw schema stores state and district as distinct fields.
  // These are concatenated here for display in results table or CSV
  
  normalizedEvent.timestamp = eventData.timestamp || eventData.dateObj;
  normalizedEvent.timeStart = eventData.timeStart || moment(eventData.dateObj).toISOString();
  // Live events in Firebase currently store timeEnd as human-readable strings, e.g. "12:00 PM", instead of ISO-8601
  normalizedEvent.timeEnd = eventData.timeEnd || ' ';  
  normalizedEvent.dateValid = eventData.dateValid || false;
  normalizedEvent.validated = eventData.validated || false;

  normalizedEvent.notes = (() => {
    if (eventData.Notes) {
      return eventData.Notes.replace(/"/g, '\'');
    }
    if (eventData.notes) {
      return eventData.notes.replace(/"/g, '\'');
    }
    return ' ';
  })();

  normalizedEvent.link = eventData.link || 'https://townhallproject.com/?eventId=' + eventData.eventId;

  normalizedEvent.iconFlag = eventData.iconFlag || ' ';
  normalizedEvent.dateCreated = eventData.dateCreated || ' ';
  // Live events in Firebase store lastUpdated as a timestampe. Archived events in Firestore use ISO-8601.
  normalizedEvent.lastUpdated = moment(eventData.lastUpdated).toISOString();
  normalizedEvent.internalNotes = eventData.internalNotes || ' ';
  return normalizedEvent;
} 

export const getFilteredEvents = createSelector(
  [
    includeLiveEventsInLookup, 
    getStatesToFilterArchiveBy,
    getAllOldEventsWithUserEmails,
    getAllEventsAsList,
    getChamber,
    getEventTypes,
    getLegislativeBody,
  ], 
  (includeLive, states, oldEvents, liveEvents, chamber, events, legislativeBody) => {
    let filteredEvents = includeLive ? [...oldEvents, ...liveEvents] : oldEvents;

    filteredEvents = map(filteredEvents, normalizeEventSchema);

    if (states.length) { 
      filteredEvents = filter(filteredEvents, (event) => {
        return includes(states, event.state);
      });
    }

    if (chamber !== "all") {
      filteredEvents = filter(filteredEvents, (event) => {
        return chamber === event.chamber;
      });
    }

    if (events.length > 0) {
      filteredEvents = filter(filteredEvents, (event) => {
        return includes(events, event.meetingType);
      });
    }

    filteredEvents = filter(filteredEvents, (event) => {
      if (legislativeBody === 'federal') {
        return event.level === 'federal';
      }
      return event.level === 'state' && event.state === legislativeBody;
    })
    
    filteredEvents = orderBy(filteredEvents, ['timestamp'], ['desc']);

    return filteredEvents;
});

export const getEventsAsDownloadObjects= createSelector([getFilteredEvents], (allEvents) => {
  return map(allEvents, (eventData) => {
    // Future: Customize normalizedEvent > CSV field mappings if desired
    return eventData;
  });
})

export const getDataForArchiveChart = createSelector(
  [getFilteredEvents],
  (allEvents) => {
    if (!allEvents) {
      return [];
    }
    return map(reduce(allEvents, (acc, cur) => {
      const party = cur.party ? cur.party.substring(0, 1) : 'None';
      if (acc[party] >= 0) {
        acc[party] = acc[party] + 1;
      }
      return acc;
    }, {
      D: 0,
      R: 0,
      I: 0,
      None: 0,
    }), (value, key) => {
      return {
        party: key,
        value
      }
    })
  }
)

export const get116MissingMemberReport = createSelector([getFilteredEvents, get116thCongress], (events, mocs) => {
    return map(mocs, (moc) => {
    
      const eventsForMoc = filter(events, { govtrack_id: moc.govtrack_id });
      const hasEvent = filter(eventsForMoc, { meetingType: 'Town Hall' });
      const eventTypes = uniq(map(eventsForMoc, 'meetingType'));

      return {
        memberId: moc.govtrack_id,
        hasEvent: hasEvent.length > 0,
        name: moc.displayName,
        party: moc.party,
        chamber: moc.chamber,
        state: moc.state,
        district: moc.district || '',
        number_of_town_halls: hasEvent.length,
        type_of_events: eventTypes,
        eventIds: eventsForMoc.map(event => event.eventId),
      }
    })
})

export const get116CongressSenateResults = createSelector([get116MissingMemberReport], (mocs) => {
    const allInChamber = filter(mocs, {chamber: 'upper'});
    return reduce(allInChamber, (acc, cur) => {
      if (cur.hasEvent) {
        if (cur.party[0].toLowerCase() === 'd') {
          acc.dEvents ++;
        } else if (cur.party[0].toLowerCase() === 'r') {
          acc.rEvents++;
        } else {
          acc.otherEvents++;
        }
      } else {
        if (cur.party[0].toLowerCase() === 'd') {
          acc.dMissing++;
        } else if (cur.party[0].toLowerCase() === 'r') {
          acc.rMissing++;
        } else {
          acc.otherMissing++;
        }
      }
      return acc;
    }, {
      dMissing: 0,
      dEvents: 0,
      rMissing: 0,
      rEvents: 0,
      otherMissing: 0,
      otherEvents: 0,
    })
})

export const get116CongressHouseResults = createSelector([get116MissingMemberReport], (mocs) => {
  const allInChamber = filter(mocs, {
    chamber: 'lower'
  });
  return reduce(allInChamber, (acc, cur) => {
    if (cur.hasEvent) {
      if (cur.party[0].toLowerCase() === 'd') {
        acc.dEvents++;
      } else if (cur.party[0].toLowerCase() === 'r') {
        acc.rEvents++;
      } else {
        acc.otherEvents++;
      }
    } else {
      if (cur.party[0].toLowerCase() === 'd') {
        acc.dMissing++;
      } else if (cur.party[0].toLowerCase() === 'r') {
        acc.rMissing++;
      } else {
        acc.otherMissing++;
      }
    }
    return acc;
  }, {
    dMissing: 0,
    dEvents: 0,
    rMissing: 0,
    rEvents: 0,
    otherMissing: 0,
    otherEvents: 0,
  })
})

export const getCongressReport = createSelector([get116CongressSenateResults, get116CongressHouseResults], 
  (senateCount, houseCount) => {
      return map(senateCount, (value, key) => {
        return [{
          x: 'senate',
          y: value,
      },
      {
        x: 'house',
        y: houseCount[key],
      },
    ]
  })
})
