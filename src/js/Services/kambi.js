import {
    coreLibrary,
    offeringModule,
    widgetModule,
} from 'kambi-widget-core-library';
import {getCID} from './helper';
import {getUserFromLocalStorage} from './helper';

import axios from 'axios'

/**
 * Checks the highlight resource against the supported filters and decides whether the widget is online or not
 * @param {string[]} supportedFilters Supported filters
 * @returns Promise.<string[]>
 */
const getHighlightedFilters = function (supportedFilters) {
    return offeringModule.getHighlight().then(response => {
        if (!Array.isArray(response.groups)) {
            throw new Error('Highlight response empty, hiding widget')
        }
        // response.groups[0].pathTermId = "/football/england/efl_cup"
        // response.groups = response.groups.slice(0, 1);
        return response.groups
            .map(group => group.pathTermId)
            .filter(filter => supportedFilters.indexOf(filter) !== -1)
    })
}
const getLiveEvents = function (filter) {
    return offeringModule.getLiveEventsByFilter(filter).then(res => {
        return res;
    });
}
const config = coreLibrary.config;
/**
 * Filters events that are matches from getEventsByFilter response. Also filters out events whose englishName are "Home Teams - Away Teams"
 * @param {object} response getEventsByFilter response
 * @returns {object[]}
 */
const filterEvents = function (response) {
    if (!response || !Array.isArray(response.events)) {
        return []
    }

    return response.events.filter(event => {
        return (
            event.event.englishName !== 'Home Teams - Away Teams' &&
            event.event.type === 'ET_MATCH'
        )
    })
}

/**
 * Fetches events by combining given filters together.
 * @param {String[]} filters
 * @returns {Promise.<object[]>}
 */
const getEventsCombined = function (filters) {
    const filter = widgetModule.createFilterUrl(filters)
    let replaceString = '#filter/'

    if (coreLibrary.config.routeRoot !== '') {
        replaceString = '#' + coreLibrary.config.routeRoot + '/filter/'
    }

    const url = filter ? filter.replace(replaceString, '') : 'football'

    return offeringModule
        .getEventsByFilter(url)
        .then(filterEvents)
        .then(events => {
            return {events, filter}
        })
}

/**
 * Fetches events by checking filters one after another until finding matching events.
 * @param {String[]} filters Filters to check
 * @returns {Promise.<{filter: string, events: object[]}>}
 */
const getEventsProgressively = function (filters) {
    // start searching for events
    const loop = i => {
        if (i >= filters.length) {
            // no more filters to check
            return null
        }
        // checking ith filter
        return (
            offeringModule
                .getEventsByFilter(filters[i].replace(/^\//, ''))
                // uncomment this to test falling back to the second filter
                // .then((res) => {
                //    if (i < 1) {
                //       res.events = [];
                //    }
                //    return res;
                // })
                .then(filterEvents)
                .then(events => {
                    if (events.length > 0) {
                        // found matching events
                        return {filter: filters[i], events}
                    }

                    // matching events not found, proceed to next filter
                    return Promise.resolve(i + 1).then(loop)
                })
        )
    }

    return Promise.resolve(0)
        .then(loop)
        .then(ev => {
            if (ev == null) {
                throw new Error('No matches available in any of the supported filters')
            } else {
                return ev
            }
        })
}

/**
 * Fetches events for given filter list.
 * Returns object having events array and applied filter field.
 * @param {string[]} filters Filters
 * @param {boolean} combined Whether events should be fetched using single combined query or one filter at the time
 * @returns {Promise.<{events: object[], filter: string}>}
 */

const localUrl = 'http://localhost:3000';
let herokuUrl = 'https://my8bet-server.herokuapp.com';
//herokuUrl = localUrl;

const getEvents = function (filters, combined = true) {
    const getEventsFunc = combined ? getEventsCombined : getEventsProgressively
//const getLiveEvents
    return getEventsFunc(filters)
}

const getTeamsByName = function (name) {

    let cid = getCID();

    if (cid !== null) {
        return axios.get(`https://eu-offering.kambicdn.org/offering/api/v3/888/term/search.json?lang=en_GB&market=${config.market}&client_id=${config.client_id}&chnnael_id=${config.channelId}&ncid=1545580760169&term=${name}`);

        //return axios.get(`https://cts-api.kambi.com/offering/api/v3/888/term/search.json?lang=en_GB&market=zz&client_id=${config.client_id}&chnnael_id=${config.channelId}&ncid=1545580760169&term=${name}`);
    } else {
        // return axios.get(`https://cts-api.kambi.com/offering/api/v3/888/term/search.json?lang=en_GB&market=${config.market}&client_id=${config.client_id}&chnnael_id=${config.channelId}&ncid=1545580760169&term=${name}`);
        return axios.get('https://eu-offering.kambicdn.org/offering/api/v3/888/term/search.json?lang=en_GB&market=GB&client_id=2&chnnael_id=1&ncid=1545580760169&term=' + name);
    }
};

const getUserTeams = function (cid, fromServer) {
    if (!fromServer) {
        return Promise.resolve(getUserFromLocalStorage());
    }
    return axios.get(herokuUrl + '/api/favorites/' + cid);
}

const followTeam = function (teamId, cid, englishName) {

    return axios.post(herokuUrl + '/api/favorites', {
        cid: cid,
        team: teamId,
        englishName: englishName,
        market: config.market,
        channelId: config.channelId,
        clientId: config.client_id
    })
}
const unFollowTeam = function (teamId, cid) {
    return axios.delete(herokuUrl + '/api/favorites/' + teamId + '/user/' + cid);
}
const setComingSoon = (cid, state) => {
    return axios.post(herokuUrl + '/api/user/' + cid + '/comingsoon', {notified: state});
}
const setEndGame = (cid, state) => {
    return axios.post(herokuUrl + '/api/user/' + cid + '/endgame', {notified: state});
}
const setLiveEvents = (cid, state) => {
    return axios.post(herokuUrl + '/api/user/' + cid + '/liveevents', {notified: state});
}
const setSmartSuggestion = (cid, state) => {
    return axios.post(herokuUrl + '/api/user/' + cid + '/smartSuggestion', {notified: state});
}
const getRecommendationsEvents = (cid) => {
    return axios.get(herokuUrl + '/api/favorites/getaievents/' + cid);
}


export default {
    getHighlightedFilters,
    getEvents,
    getTeamsByName,
    followTeam,
    getUserTeams,
    unFollowTeam,
    setComingSoon,
    setEndGame,
    setLiveEvents,
    setSmartSuggestion,
    getRecommendationsEvents
}
