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
import kambi from '../Services/kambi';
import Switch from 'react-bootstrap-switch';


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
        this.state = {
            selected: 0,
            userEvents: [],
            userTeams: [],
            isUserTeamsArrived: false,
            isPulse: true

        };

        setTimeout(() => {
            this.state.isPulse = false;
        }, 5000);


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


        // this.props.events.forEach((e) => {
        //     this.items.push(e.event.englishName);
        // })
        // return this.props.userTeams.then((res) => {
        //
        //     let userEvents = [];
        //     var userTeams = res;
        //
        //
        //     this.props.events.forEach((e) => {
        //         let foundedUt = _.find(userTeams, (ut) => {
        //             return e.event.homeName == ut.englishName || e.event.awayName == ut.englishName
        //         });
        //         if (foundedUt) {
        //             userEvents.push(e)
        //         }
        //     });
        //
        //     this.setState({userEvents: userEvents});// .state.userEvents = userEvents;
        //     this.state.userEvents.forEach((e) => {
        //         this.items.push(e.event.englishName);
        //     })
        //
        // });


    }

    componentWillReceiveProps(nextProps) {
        //if(nextProps.events!==this.props.events){
        this.props.userTeams.then((res) => {

            let userEvents = [];

            this.state.userTeams = res;
            this.state.isUserTeamsArrived = true;
            var userTeams = res;


            this.props.events.forEach((e) => {
                let foundedUt = _.find(userTeams, (ut) => {
                    return e.event.homeName == ut.englishName || e.event.awayName == ut.englishName
                });
                if (foundedUt) {
                    userEvents.push(e)
                }
            });

            this.setState({userEvents: userEvents});// .state.userEvents = userEvents;
            this.state.userEvents.forEach((e) => {
                this.items.push(e.event.englishName);
            })

        });

        //}
    }

    openNav() {
        document.getElementById("mySidenav").style.width = "100%";
    }

    /* Set the width of the side navigation to 0 */
    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    getUserTeams() {
        var listItems = this.state.userTeams.map(function (ut) {
            return (
                <li>
                    <span>{ut.englishName}</span>
                    <i className="fas fa-thumbs-down" title="Unfollow"
                       onClick={() => this.unFollowClicked(ut)}/>
                </li>
            );
        });

        return (<ul className="settings-myfav-container">{listItems}</ul>);
    }

    unFollowClicked = (suggestion) => {
        var team = _.find(this.state.userTeams, (ut) => {
            return ut.team == suggestion.fav_id;
        });
        if (team) {
            kambi.unFollowTeam(team._id).then(() => {
                // swal(suggestion.englishName + ' Was removed from your favorite list.');
                // if (typeof this.props.onFollowHandler === 'function') {
                //     this.props.onFollowHandler(suggestion);
                // }
                this.init();
            })
        }
    };
    handleSwitch(elem, state) {
        console.log('handleSwitch. elem:', elem);
        console.log('name:', elem.props.name);
        console.log('new state:', state);
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
        return (

            <div>
                <div id="mySidenav" className="sidenav">
                    <div className="padder">
                        <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav}>&times;</a>
                        <div className="row">

                            <div className="col-xs-6">
                                <div className="title">My Favorites</div>

                            </div>
                            <div className="col-xs-6">
                                <div className="title">General Settings</div>

                            </div>

                            <div className="col-xs-6">

                                {this.getUserTeams()}
                            </div>
                            <div className="col-xs-6 p-t">

                                <section className="settings">
                                    <strong className="m-r">Push Notifications</strong><small className="recommended">RECOMMENDED</small>
                                    <div className="v-padder info">
                                        you will receive push notification for your favorites coming events
                                    </div>
                                    <Switch onChange={(el, state) => this.handleSwitch(el, state)} name='test' />
                                </section>
                                <section className="settings disabled">
                                    <strong className="m-r">Auto Games Suggestion </strong><small className="recommended">RECOMMENDED</small>
                                    <div className="v-padder info">
                                        you will get recommend games
                                    </div>
                                    <Switch onChange={(el, state) => this.handleSwitch(el, state)} name='test' />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
                <span className="settings-btn fas fa-cog" onClick={this.openNav}></span>
                {/*<header className={styles.header + ' animated bounceInUp '}>*/}
                {/*<span>My Favorite</span>*/}
                {/*</header>*/}
                <div id="main">
                    <div className={styles.header}>
                        <i className={'fas fa-star ' + [styles.spin, styles.animated].join(' ')} style={star}></i>
                        My Favorites
                    </div>

                    {/*<BlendedBackground/>*/}
                    <Search onFollowHandler={this.props.onFollowHandler}/>
                    {/*<TournamentLogo logoName={this.props.tournamentLogo}/>*/}

                    {this.state.userEvents
                        .filter(event => (event.betOffers && event.betOffers.length > 0))
                        .map(event => {

                            if (this.state.userEvents.length > 0) {
                                return (  <Event
                                        key={event.event.id}
                                        event={event.event}
                                        liveData={event.liveData}
                                        outcomes={event.betOffers[0].outcomes}
                                    />
                                )
                            }
                        })}
                    {(this.state.userEvents.length == 0 && this.state.userTeams.length > 0) &&
                    (
                        <div style={notFoundStyle}>
                            <svg width="49" height="51" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M3.9468 10.0288L20.5548.995c2.4433-1.3267 5.45-1.3267 7.8936 0l16.6078 9.0338C47.4966 11.3585 49 13.8102 49 16.4666V34.534c0 2.6537-1.5034 5.1082-3.9438 6.438l-16.6078 9.0307c-2.4435 1.3297-5.4503 1.3297-7.8937 0L3.9467 40.972C1.5035 39.642 0 37.1876 0 34.534V16.4667c0-2.6564 1.5034-5.108 3.9468-6.4378z"
                                    className="app-icon" fillRule="evenodd"/>
                            </svg>
                            <div style={notFoundTitle}>Favorites events not found</div>
                        </div>
                    )

                    }
                    {(this.state.isUserTeamsArrived && this.state.userTeams.length == 0) &&
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


                    )



                    }
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
}

MatchOverviewWidget.defaultProps = {
    tournamentLogo: null,
}

export default MatchOverviewWidget
