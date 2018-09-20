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
            userEvents: []
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

    onEventsBinded = function () {


    }

    matchConainesUserTeam = function (event) {

        var isContain = false;
        // return this.props.userTeams.then((res) => {
        //     res.forEach((ut) => {
        //         if (event.homeName == ut.englishName || event.awayName == ut.englishName) {
        //             isContain = true;
        //         }
        //     });
        //
        //     return isContain;
        // });

    }


    /**
     * Renders component.
     * @returns {XML}
     */
    render() {
        return (
            <div className={styles.widget}>

                <header className={styles.header + ' animated bounceInUp '}>
                    <span>My Favorite</span>
                </header>

                {/*<BlendedBackground/>*/}
                <Search onFollowHandler={this.props.onFollowHandler}/>
                {/*<TournamentLogo logoName={this.props.tournamentLogo}/>*/}
                {this.state.userEvents
                    .filter(event => event.betOffers.length > 0)
                    .map(event => {
                        return <div className="flex-container">
                            <div className="row">
                                <div className="flex-item">1</div>

                            </div>
                        </div>
                        // if (this.state.userEvents.length > 0) {
                        //     return (  <Event
                        //             key={event.event.id}
                        //             event={event.event}
                        //             liveData={event.liveData}
                        //             outcomes={event.betOffers[0].outcomes}
                        //         />
                        //     )
                        // } else {
                        //     return
                        //     <div class="flex-container">
                        //         <div class="row">
                        //             <div class="flex-item">1</div>
                        //
                        //         </div>
                        //     </div>
                        // }


                    })}
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
