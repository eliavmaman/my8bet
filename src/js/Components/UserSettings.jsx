import React, {Component} from 'react'
import PropTypes from 'prop-types'
import kambi from '../Services/kambi'
import _ from 'lodash';
import styles from './UserSettings.scss'
import {getCIDOrDefault} from '../Services/helper';
import {saveUserToLocalStorage} from '../Services/helper';
import toastr from "toastr";
import Toggle from "react-toggle-component";
import FavoriteTeams from './FavoriteTeams';


class UserSettings extends Component {

    /**
     * Constructs.
     * @param {object} props Component properties
     */
    constructor(props) {
        super(props);

        this.state = {
            user: {favorites: []},
        };
        this.init();
        this.handleSwitch = this.handleSwitch.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        this.setState({user: this.props.user});

    }

    componentDidMount() {
        this.setState({user: this.props.user});


    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let user = prevProps;

    }

    updateUserData(user) {
        this.setState({user: user});
    }

    init = () => {

    };

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
                    <span title={ut.englishName} className="team-name">{ut.englishName}</span>
                    <i onClick={(e) => this.unFollowClicked(e, ut)} className="far fa-times-circle unfollow-link"></i>
                    {/*<a  className=" unfollow-link">Remove</a>*/}

                </li>
            );
        });

        return (<ul className="settings-myfav-container">{listItems}</ul>);
    }

    unFollowClicked = (e, suggestion) => {
        kambi.unFollowTeam(suggestion._id, this.state.user.cid).then(() => {
            kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                this.setState({user: res.data})
                saveUserToLocalStorage(res.data);
            });
            if (typeof this.props.onUnFollow === 'function') {
                this.props.onUnFollow(suggestion);
            }
            //this.refs.search.init();
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

    render() {

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
                                <FavoriteTeams user={this.state.user}/>
                                {/*{this.getUserTeams()}*/}
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
                                        custom Recommendations
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
            </div>

        );
    }
}


UserSettings.propTypes = {
    /**
     * Logo CSS class name.
     * These classes are defined in operator-specific CSS file.
     */

    user: PropTypes.object,
    onFollowHandler: PropTypes.func,
    onUnFollow: PropTypes.func
};

UserSettings.defaultProps = {
    // logoName: 'football',
};

export default UserSettings
