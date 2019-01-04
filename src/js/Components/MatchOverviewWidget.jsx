import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ScrolledList} from 'kambi-widget-components'
import styles from './MatchOverviewWidget.scss'
import BlendedBackground from './BlendedBackground'
import Event from './Event'
import ArrowButton from './ArrowButton'
import ItemContainer from './ItemContainer'
import TournamentLogo from './TournamentLogo'
import mobile from '../Services/mobile'
import Search from './Search'
import {Typeahead} from 'react-bootstrap-typeahead'
import _ from 'lodash';
import moment from 'moment';
import kambi from '../Services/kambi';
// import Switch from 'react-bootstrap-switch';
import Toggle from "react-toggle-component"
import "react-toggle-component/styles.css"
import {widgetModule} from 'kambi-widget-core-library';
import {getCIDOrDefault} from "../Services/helper";
import {saveUserToLocalStorage} from '../Services/helper';
import {isUserSubscribeToLiveEvents} from '../Services/helper';
import live from '../Services/live'


import toastr from 'toastr';

/**
 * How long (in milliseconds) to wait before scrolling league logo out
 * @type {number}
 */
const MOBILE_INITIAL_SCROLL_DELAY = 2000

class MatchOverviewWidget extends Component {
    /**
     * Constructs.
     * @param {object} props Component properties
     */
    constructor(props) {
        super(props)
        this.items = [];
        this.aiRecommendation = [];

        this.state = {
            selected: 0,
            userEvents: [],
            user: {favorites: []},
            isUserTeamsArrived: false,
            isPulse: true,
            recommendationsLast: moment(),
            isRecomendationsUpdateOnStart: false,
            isLoading: true

        };
    }

    /**
     * Called after component rendering to DOM.
     */
    componentDidMount() {
        if (mobile()) {
            setTimeout(
                () => this.setState({selected: 1}),
                MOBILE_INITIAL_SCROLL_DELAY
            )
        }

    }

    componentWillReceiveProps(nextProps) {

        let isSubscribeLiveEvent = isUserSubscribeToLiveEvents();
        kambi.getUserTeams().then((res) => {

            this.state.isUserTeamsArrived = true;
            if (!res) return;

            this.state.user = res;
            //&& this.shouldRecomdationUpdate()
            if (this.state.user.settings.aiEvents) {
                if (this.aiRecommendation.length > 0) {
                    this.apllyUserEvents(isSubscribeLiveEvent, this.aiRecommendation);
                    return;
                }
                kambi.getRecommendationsEvents(getCIDOrDefault()).then((res) => {

                    this.aiRecommendation = res.data;
                    this.apllyUserEvents(isSubscribeLiveEvent, this.aiRecommendation);
                })
                //this.apllyUserEvents(isSubscribeLiveEvent);
            } else {
                this.apllyUserEvents(isSubscribeLiveEvent);
            }

        })

    }

    onUnfollowFromSettings() {
        this.refs.search.init();
    }

    apllyUserEvents(isSubscribeLiveEvent, recommendedEventIds) {
        let userEvents = [];
        let count = 0;
        this.state.isLoading = false;
        this.props.events.forEach((e) => {
            if (recommendedEventIds) {
                let foundedRecomandedEvent = _.find(recommendedEventIds, (rec) => {
                    return rec.toString() == e.event.id.toString();
                });
                if (foundedRecomandedEvent) {
                    e.event.isRecomanded = true;
                    userEvents.push(e);
                    count++;
                }
            }

            let foundedUt = _.find(this.state.user.favorites, (ut) => {
                return e.event.homeName == ut.englishName || e.event.awayName == ut.englishName
            });

            if (foundedUt) {
                if (!(e.liveData && !isSubscribeLiveEvent) && e.betOffers.length > 0) {

                    userEvents.push(e);
                    count++;
                }
            }
        });

        if (count > 2) {
            widgetModule.setWidgetHeight(100 + (count * 130));
        } else {
            widgetModule.setWidgetHeight(450);
        }


        this.setState({userEvents: userEvents});// .state.userEvents = userEvents;
        this.state.userEvents.forEach((e) => {
            this.items.push(e.event.englishName);
        })

    }

    /**
     * Renders component.
     * @returns {XML}
     */
    render() {

        return (

            <div>
                <div id="main">
                    <div className={styles.header}>
                        <i className={'fas fa-star ' + [styles.spin, styles.animated, styles.star].join(' ')}></i>
                        My Favorites
                    </div>

                    <Search ref="search"
                            onFollowUnfollowFromSearchHandler={this.props.onFollowUnfollowFromSearchHandler}/>
                    {this.state.isLoading === true &&
                    <div className={styles.notFoundStyle} >
                        <div className={styles.notFoundTitle} >Loading....</div>
                    </div>
                    }
                    {this.state.userEvents
                        .filter(event => (event.betOffers && event.betOffers.length > 0))
                        .map(event => {

                            if (this.state.userEvents.length > 0) {
                                return (<Event
                                        key={event.event.id}
                                        event={event.event}
                                        liveData={event.liveData}
                                        outcomes={event.betOffers[0].outcomes}
                                    />
                                )
                            }
                        })}
                    {(this.state.userEvents.length == 0 && this.state.user.favorites.length > 0 && this.state.isLoading === false) &&
                    (
                        <div className={styles.notFoundStyle}>
                            <i className={'fas fa-star ' + [styles.starBigOrange].join(' ')}/>
                            <div className={styles.notFoundTitle}>Favorites events not found</div>
                        </div>
                    )}
                    {(this.state.isUserTeamsArrived && this.state.user.favorites.length == 0 && this.state.isLoading === false) &&
                    (
                        <div className={styles.notFoundStyle}>
                            <i className={'fas fa-star ' + [styles.starBig].join(' ')}/>
                            <div className={styles.notFoundTitle}>Follow your favorite teams events</div>
                            <p className={styles.smallText}>
                                <div>
                                    Search for favorite team or player.
                                </div>
                                <div>
                                    <i className={'fas fa-arrow-alt-circle-down ' + [styles.smallTextarrow].join(' ')}/>
                                </div>
                                <div>
                                    Click on the follow button.
                                </div>
                                <div>
                                    <i className={'fas fa-arrow-alt-circle-down ' + [styles.smallTextarrow].join(' ')}></i>
                                </div>
                                <div>
                                    Your favorite games will start shown.
                                </div>

                            </p>

                        </div>
                    )}
                </div>


            </div>
        )
    }
}

MatchOverviewWidget.propTypes = {
    /**
     * Events to display
     */
    events: PropTypes.arrayOf(PropTypes.object).isRequired,
    tournamentLogo: PropTypes.string,
    onFollowHandler: PropTypes.func,
    onFollowUnfollowFromSearchHandler: PropTypes.func,
}

MatchOverviewWidget.defaultProps = {
    tournamentLogo: null,
}

export default MatchOverviewWidget
