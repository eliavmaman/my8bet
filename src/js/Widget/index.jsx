import React from 'react'
import ReactDOM from 'react-dom'
import {widgetModule} from 'kambi-widget-core-library'
import MatchOverviewWidget from '../Components/MatchOverviewWidget'
import kambi from '../Services/kambi'
import live from '../Services/live'
import {getCIDOrDefault} from '../Services/helper';
import {isUserSubscribeToLiveEvents} from '../Services/helper';
import {saveUserToLocalStorage} from '../Services/helper';

import _ from "lodash";


/**
 * Rendered when combined filter is used or there is no current filter.
 * @type {string}
 */
const DEFAULT_TOURNAMENT_LOGO = 'football'

/**
 * Handles incoming event's live data update.
 * @param {object} liveEventData Event's live data
 */
const updateLiveEventData = function (liveEventData) {
    const event = this.events.find(
        event => event.event.id == liveEventData.eventId
    )

    if (!event) {
        console.warn(`Live event not found: ${liveEventData.eventId}`)
        return
    }

    event.liveData = liveEventData
}
const onFollowHandler = function (value) {


};
/**
 * Renders widget within previously defined container (rootEl).
 */
const render = function () {
    // cid={this.cid}
    // user={this.user}
    ReactDOM.render(
        <MatchOverviewWidget
            events={this.events}
            user={this.user}
            tournamentLogo={this.tournamentLogo}
            onFollowHandler={onFollowHandler}
        />,
        this.rootEl
    )

}

/**
 * Fetches events based on current filters and sets polling on the live ones.
 * @returns {Promise}
 */


const refreshEvents = function () {
    // let myTimeOut;
    // let getLiveData = isUserSubscribeToLiveEvents();
    return kambi
        .getEvents(this.filters, this.combineFilters)
        .then(({events, filter}) => {
            this.events = events;
            this.appliedFilter = filter;

            // give up when there is no events
            if (this.events.length == 0) {
                this.onFatal(new Error('No events to show'))
                return
            }

            const liveEvents = this.liveEvents
            //  widgetModule.setWidgetHeight(100 + (liveEvents.length * 30));
            // no live events, schedule refresh
            if (liveEvents.length == 0) {
                setTimeout(refreshEvents.bind(this), this.eventsRefreshInterval)
            }
            // if (getLiveData) {
            live.subscribeToEvents(
                liveEvents.map(event => event.event.id),
                liveEventData => {
                    updateLiveEventData.call(this, liveEventData);
                    render.call(this);
                    if (window.location.href.indexOf('888') > -1)
                        this.forceUpdate();

                }, // onUpdate
                refreshEvents // onDrained
            )
            //}
            // subscribe to notifications on live events

            // widgetModule.adaptWidgetHeight();
            // render fetched events
            render.call(this);


        })
}

class Widget {
    /**
     * Creates new Match Overview widget and manages its lifecycle.
     * @param {string[]} filters Event filters list
     * @param {HTMLElement} [rootEl] Widget's mount point. Defaults to #root
     * @param {boolean} [combineFilters=false] Should filters be combined or checked one after another
     * @param {number} [eventsRefreshInterval=120000] Interval in milliseconds to look for live events (if none are live currently)
     * @param {number} [pollingCount=4] Maximum number of concurrently watched live events
     * @param {function} [onFatal] Fatal error handler
     */
    constructor(filters,
                {
                    rootEl = document.getElementById('root'),
                    combineFilters = false,
                    eventsRefreshInterval = 120000,
                    pollingCount = 4,
                    onFatal = e => {
                        throw e
                    },
                }) {
        // let d = JSON.stringify({named_user_id: 3333});
        // localStorage.setItem(JSON.stringify('a', d));
        this.filters = filters
        this.rootEl = rootEl
        this.combineFilters = combineFilters
        this.eventsRefreshInterval = eventsRefreshInterval
        this.pollingCount = pollingCount
        this.onFatal = onFatal

        this.events = []
        this.appliedFilter = null
    }

    init(userData) {
        //widgetModule.setWidgetHeight(150)
        this.user = userData;
        saveUserToLocalStorage(this.user);
        return refreshEvents.call(this)
    }

    /**
     * Filters live events out of current events.
     * @returns {object[]}
     */
    get liveEvents() {
        return this.events.reduce((events, event) => {
            if (events.length >= this.pollingCount) {
                return events
            }

            if (event.event.openForLiveBetting === true) {
                let userLiveEvent = _.find(this.user.favorites, (ut) => {
                    return event.event.homeName == ut.englishName || event.event.awayName == ut.englishName
                });

                if (userLiveEvent)
                    events.push(event)
            }

            return events
        }, [])
    }

    /**
     * Returns tournament logo class name based on currently applied filter.
     * @returns {string}
     */
    get tournamentLogo() {
        if (this.combineFilters) {
            return DEFAULT_TOURNAMENT_LOGO
        }

        return this.appliedFilter
            ? this.appliedFilter.substring(1).replace(/\//g, '-')
            : DEFAULT_TOURNAMENT_LOGO
    }

    // get cid() {
    //     return getCIDOrDefault();
    // }
    //
    // get user() {
    //     let cid = '737222307';//getCIDOrDefault();
    //
    //     return kambi.getUserTeams(cid).then((res) => {
    //         if (!res) {
    //             return kambi.getUserTeams(cid, true);
    //         } else {
    //             return res;
    //         }
    //
    //     })
    // }
}

export default Widget
