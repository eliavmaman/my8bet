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
import {widgetModule} from 'kambi-widget-core-library';
import toastr from 'reactjs-toastr';
import {getCIDOrDefault} from "../Services/helper";


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
            user: {favorites: []},
            isUserTeamsArrived: false,
            isPulse: true

        };

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
        this.props.user.then((res) => {
            if (!res) return;
            let userEvents = [];
            let count = 0;
            this.state.user = res;
            this.state.isUserTeamsArrived = true;

            var user = res;


            this.props.events.forEach((e) => {
                let foundedUt = _.find(user.favorites, (ut) => {
                    return e.event.homeName == ut.englishName || e.event.awayName == ut.englishName
                });
                if (foundedUt) {
                    userEvents.push(e);
                    count++;

                }
            });
            if(count > 2){
                widgetModule.setWidgetHeight(100 + (count * 110));
            }else
            {
                widgetModule.setWidgetHeight(450);
            }


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
        var listItems = this.state.user.favorites.map((ut) => {
            return (
                <li>
                    <span className="team-name">{ut.englishName}</span>
                    <a onClick={() => this.unFollowClicked(ut)} className="unfollow-link">Remove</a>

                </li>
            );
        });

        return (<ul className="settings-myfav-container">{listItems}</ul>);
    }

    unFollowClicked = (suggestion) => {
        kambi.unFollowTeam(suggestion._id, this.state.user.cid).then(() => {
            this.refs.search.init();
            toastr.success('Unollowed successfully ', 'UnFollow team', {displayDuration:3000,positionClass: 'toast-top'});
        });
    };

    handleSwitch(elem, state) {
        console.log('handleSwitch. elem:', elem);
        console.log('name:', elem.props.name);
        console.log('new state:', state);
        let cid=getCIDOrDefault();
        kambi.setNotification(cid,state);
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
                                    <strong className="m-r">Push Notifications</strong>
                                    <small className="recommended">RECOMMENDED</small>
                                    <div className="v-padder info">
                                        you will receive push notification for your favorites coming events
                                    </div>
                                    <Switch onChange={(el, state) => this.handleSwitch(el, state)} name='test'/>
                                </section>
                                <section className="settings disabled">
                                    <strong className="m-r">Auto Games Suggestion </strong>
                                    <small className="recommended">RECOMMENDED</small>
                                    <div className="v-padder info">
                                        you will get recommend games
                                    </div>
                                    <Switch onChange={(el, state) => this.handleSwitch(el, state)} name='test'/>
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
                    <Search ref="search" onFollowHandler={this.props.onFollowHandler}/>
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
                    {(this.state.userEvents.length == 0 && this.state.user.favorites.length > 0) &&
                    (
                        <div style={notFoundStyle}>
                            <i className="fas fa-star" style={starBigOrange}></i>
                            <div style={notFoundTitle}>Favorites events not found</div>
                        </div>
                    )

                    }
                    {(this.state.isUserTeamsArrived && this.state.user.favorites.length == 0) &&
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
}

MatchOverviewWidget.defaultProps = {
    tournamentLogo: null,
}

export default MatchOverviewWidget
