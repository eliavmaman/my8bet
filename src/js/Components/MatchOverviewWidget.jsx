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
            this.state.isPulse=false;
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
            "marginTop": "100px"
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
        return (
            <div className={styles.widget+' gps_ring' + ( this.state.isPulse ? ' in' : '')}>

                {/*<header className={styles.header + ' animated bounceInUp '}>*/}
                {/*<span>My Favorite</span>*/}
                {/*</header>*/}
                <div className={styles.header}>My Favorites</div>

                {/*<BlendedBackground/>*/}
                <Search onFollowHandler={this.props.onFollowHandler}/>
                {/*<TournamentLogo logoName={this.props.tournamentLogo}/>*/}

                {this.state.userEvents
                    .filter(event => (event.betOffers && event.betOffers.length > 0))
                    .map(event => {
                        // return <div className="flex-container">
                        //     <div className="row">
                        //         <div className="flex-item">1</div>
                        //
                        //     </div>
                        // </div>
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
                                className="app-icon" fillRule="evenodd"></path>
                        </svg>
                        <div style={notFoundTitle}>Favorite events not found</div>
                    </div>)

                }
                {(this.state.isUserTeamsArrived && this.state.userTeams.length == 0) &&
                (
                    <div style={notFoundStyle}>
                        <svg width="49" height="51" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3.9468 10.0288L20.5548.995c2.4433-1.3267 5.45-1.3267 7.8936 0l16.6078 9.0338C47.4966 11.3585 49 13.8102 49 16.4666V34.534c0 2.6537-1.5034 5.1082-3.9438 6.438l-16.6078 9.0307c-2.4435 1.3297-5.4503 1.3297-7.8937 0L3.9467 40.972C1.5035 39.642 0 37.1876 0 34.534V16.4667c0-2.6564 1.5034-5.108 3.9468-6.4378z"
                                className="app-icon" fillRule="evenodd"></path>
                        </svg>
                        <div style={notFoundTitle}>Please select favorite teams first</div>
                        <p style={smallText}>

                            1.Search for favorite team or player
                            <i className="fas fa-arrow-alt-circle-right" style={smallTextarrow}></i>
                            2.Click on the follow icon
                            <i className="fas fa-arrow-alt-circle-right" style={smallTextarrow}></i>
                            3.Your favorite games will start shown
                        </p>
                    </div>)
                }
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
