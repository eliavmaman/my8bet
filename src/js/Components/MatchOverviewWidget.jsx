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
        this.aiRecommendation = [] ;

        this.state = {
            selected: 0,
            userEvents: [],
            user: {favorites: []},
            isUserTeamsArrived: false,
            isPulse: true,
            recommendationsLast: moment(),
            isRecomendationsUpdateOnStart: false,
            isLoading:true

        };

        this.handleSwitch = this.handleSwitch.bind(this);

        // setTimeout(() => {
        //     this.state.isPulse = false;
        // }, 5000);


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


        //if(nextProps.events!==this.props.events){
        let isSubscribeLiveEvent = isUserSubscribeToLiveEvents();
        kambi.getUserTeams().then((res) => {

            this.state.isUserTeamsArrived = true;
            if (!res) return;


            this.state.user = res;
            //&& this.shouldRecomdationUpdate()
            if (this.state.user.settings.aiEvents ) {
                if(this.aiRecommendation.length > 0)
                    return  this.aiRecommendation;

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

    shouldRecomdationUpdate() {
        if (!this.state.isRecomendationsUpdateOnStart) {
            this.state.isRecomendationsUpdateOnStart = true;
            return true;
        } // load recommendation one widget loaded
        const startTime = this.state.recommendationsLast;
        const endTime = moment();
        const duration = moment.duration(endTime.diff(startTime));
        const minutes = parseInt(duration.asMinutes()) % 60;

        return minutes >= 10;
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

    openNav() {
        document.getElementById("mySidenav").style.width = "100%";
    }

    /* Set the width of the side navigation to 0 */
    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    getUserTeams() {
        var listItems = this.state.user.favorites.map((ut) => {
            return (
                <li>
                    <span title={ut.englishName}  className="team-name">{ut.englishName}</span>
                    <i onClick={() => this.unFollowClicked(ut)} className="far fa-times-circle unfollow-link"></i>
                    {/*<a  className=" unfollow-link">Remove</a>*/}

                </li>
            );
        });

        return (<ul className="settings-myfav-container">{listItems}</ul>);
    }

    unFollowClicked = (suggestion) => {
        kambi.unFollowTeam(suggestion._id, this.state.user.cid).then(() => {
            kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                this.setState({user: res.data})
                saveUserToLocalStorage(res.data);
            });
            this.refs.search.init();
            toastr.success('Unfollowed ' + suggestion.englishName + ' successfully.', 'UnFollow');
        });
    };

    handleSwitch(state, el) {
        console.log('handleSwitch. elem:', el.target.id);
        let id = el.target.id;
        console.log('new state:', state);
        let cid = getCIDOrDefault();
        switch (id) {
            case 'comingSoon':
                kambi.setComingSoon(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.forceUpdate();
                    });
                });
                break;
            case 'endGame':
                kambi.setEndGame(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.forceUpdate();
                    });
                });
                break;
            case 'liveEvents':
                kambi.setLiveEvents(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.forceUpdate();
                    });
                });
                break;

            case 'smart-suggestions':
                kambi.setSmartSuggestion(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.forceUpdate();
                    });
                });
                break;


        }

    }

    getComingsoon() {
        if (this.state.user && this.state.user.settings) {
            return this.state.user.settings.comingSoon;
        }
        return false;
    }

    getEndGame() {
        if (this.state.user && this.state.user.settings) {
            return this.state.user.settings.endGame;
        }
        return false;
    }

    getLiveEvents() {
        if (this.state.user && this.state.user.settings) {
            return this.state.user.settings.liveEvents;
        }
        return false;
    }

    getAiEvents() {
        if (this.state.user && this.state.user.settings) {
            return this.state.user.settings.aiEvents;
        }
        return false;
    }

    /**
     * Renders component.
     * @returns {XML}
     */
    render() {

        let flex = {'display': 'flex'};
        var notFoundStyle = {
            "textAlign": "center",
            "alignSelf": "center",
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "center",
            "marginTop": "60px",

        };
        let notFoundTitle = {
            "fontSize": "22px",
            "fontWeight": "100",
            "marginTop": "15px",
            "color": "#47494E",
            "marginBottom": "8px"
        };

        let smallTextarrow =
            {"margin": "0px  10px", "color": "#408fec"};

        let smallText = {
            "WebkitMarginAfter": "0px",
            "WebkitMarginBefore": "0px",
            "fontSize": "15px",
            "color": "#7F828B",
            "lineHeight": "21px",
            "marginBottom": "4px"
        };
        var star = {"fontSize": "20px", "color": "orange", "marginRight": "10px"};
        var starBig = {"fontSize": "60px", "color": "gray", "marginRight": "10px"};
        var starBigOrange = {"fontSize": "60px", "color": "orange", "marginRight": "10px"};
        return (

            <div>

                <div id="mySidenav" className="sidenav">
                    <div className="padder">
                        <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav}>&times;</a>
                        <div className="row">

                            <div className="col-xs-6 bb-gray">
                                <div className="title">My Favorites</div>
                            </div>
                            <div className="col-xs-6 ">
                                <div className="title">General Settings</div>

                            </div>

                            <div className="col-xs-6 bb-gray">

                                {this.getUserTeams()}
                            </div>
                            <div className="col-xs-6 p-t ">

                                <section className="settings">
                                    <strong className="m-r">Coming Soon Alerts</strong>

                                    <small className="recommended">RECOMMENDED</small>
                                    <div className=" info">
                                         Notified me before a match begin.
                                    </div>
                                    <div className="">
                                        <Toggle id="comingSoon"
                                                checked={this.getComingsoon()}
                                                onToggle={(value, el) => this.handleSwitch(value, el)}/>
                                    </div>
                                    <div className="clear-both"></div>

                                </section>
                                <section className="settings">
                                    <strong className="m-r">End of Games Alerts </strong>
                                    <div className="info">
                                        Notified me with the final results.
                                    </div>
                                    <div className="">
                                        <Toggle id="endGame"
                                                checked={this.getEndGame()}
                                                onToggle={(value, el) => this.handleSwitch(value, el)}/>
                                    </div>
                                    <div className="clear-both"></div>
                                </section>
                                <section className="settings">
                                    <strong className="m-r">Live events </strong>
                                    <small className="recommended">RECOMMENDED</small>
                                    <div>
                                        <Toggle id="liveEvents"
                                                checked={this.getLiveEvents()}
                                                onToggle={(value, el) => this.handleSwitch(value, el)}/>
                                    </div>
                                </section>
                                <section className="settings">
                                    <strong className="m-r">Recommendations</strong>
                                    <div className="info">
                                       custom  Recommendations
                                    </div>
                                    <div>
                                        <Toggle id="smart-suggestions"
                                                checked={this.getAiEvents()}
                                                onToggle={(value, el) => this.handleSwitch(value, el)}/>
                                    </div>
                                </section>

                            </div>
                        </div>
                    </div>
                </div>
                <span className="settings-btn fas fa-cog" onClick={this.openNav}></span>

                <a className="help-btn fas fa-question-circle" target={'_blank'}
                   href={'https://moshesagee.fleeq.io/l/fvbqcsjlf4-ovb6vobnhq'}></a>
                {/*<header className={styles.header + ' animated bounceInUp '}>*/}
                {/*<span>My Favorite</span>*/}
                {/*</header>*/}
                <div id="main">
                    <div className={styles.header}>
                        <i className={'fas fa-star ' + [styles.spin, styles.animated].join(' ')} style={star}></i>

                        My Favorites
                    </div>

                    {/*<BlendedBackground/>*/}
                    <Search ref="search" onFollowHandler={this.props.onFollowHandler}/>
                    {this.state.isLoading === true &&
                        <div style={notFoundStyle}>

                        <div style={notFoundTitle}>Loading....</div>
                        </div>
                    }

                    {/*<TournamentLogo logoName={this.props.tournamentLogo}/>*/}

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
                        <div style={notFoundStyle}>
                            <i className="fas fa-star" style={starBigOrange}></i>
                            <div style={notFoundTitle}>Favorites events not found</div>
                        </div>
                    )

                    }
                    {(this.state.isUserTeamsArrived && this.state.user.favorites.length == 0 && this.state.isLoading === false) &&
                    (

                        <div style={notFoundStyle}>
                            <i className="fas fa-star" style={starBig}></i>
                            <div style={notFoundTitle}>Follow your favorite teams events</div>
                            <p style={smallText}>
                                <div>
                                    Search for favorite team or player.
                                </div>
                                <div>
                                    <i className="fas fa-arrow-alt-circle-down" style={smallTextarrow}></i>
                                </div>
                                <div>
                                    Click on the follow button.
                                </div>
                                <div>
                                    <i className="fas fa-arrow-alt-circle-down" style={smallTextarrow}></i>
                                </div>
                                <div>
                                    Your favorite games will start shown.
                                </div>

                            </p>

                        </div>


                    )}
                </div>
                {/*<ScrolledList*/}
                {/*renderPrevButton={props => <ArrowButton type="left" {...props} />}*/}
                {/*renderNextButton={props => <ArrowButton type="right" {...props} />}*/}
                {/*renderItemContainer={props => <ItemContainer {...props} />}*/}
                {/*selected={this.state.selected}*/}
                {/*scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE.TO_LEFT}*/}
                {/*showControls={!mobile()}>*/}
                {/*<TournamentLogo logoName={this.props.tournamentLogo}/>*/}
                {/*{this.props.events*/}
                {/*.filter(event => event.betOffers.length > 0)*/}
                {/*.map(event => {*/}
                {/*return (*/}
                {/*<Event*/}
                {/*key={event.event.id}*/}
                {/*event={event.event}*/}
                {/*liveData={event.liveData}*/}
                {/*outcomes={event.betOffers[0].outcomes}*/}
                {/*/>*/}
                {/*)*/}
                {/*})}*/}
                {/*</ScrolledList>*/}

            </div>
        )
    }
}

MatchOverviewWidget.propTypes = {
    /**
     * Events to display
     */
    events: PropTypes.arrayOf(PropTypes.object).isRequired,

    /**
     * Tournament logo class name.
     */
    tournamentLogo: PropTypes.string,
    onFollowHandler: PropTypes.func
}

MatchOverviewWidget.defaultProps = {
    tournamentLogo: null,
}

export default MatchOverviewWidget
