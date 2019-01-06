import React, {Component} from 'react'
import PropTypes from 'prop-types'
import kambi from '../Services/kambi'
import {getCIDOrDefault} from '../Services/helper';
import {saveUserToLocalStorage} from '../Services/helper';
import FavoriteTeams from './FavoriteTeams';
import SettingSwitch from './SettingSwitch';

class UserSettings extends Component {

    /**
     * Constructs.
     * @param {object} props Component properties
     */
    constructor(props) {
        super(props);

        this.state = {
            user: {favorites: []},
            switchStates:{
                commingSoon:false,
                live:false,
                endGame:false,
                aiEvents:false
            },
        };
        this.handleSwitch = this.handleSwitch.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({user: this.props.user});
    }

    componentDidMount() {
        this.setState({user: this.props.user});
    }

    updateUserData(user) {
        this.setState({user: user});
    }

    openNav() {
        document.getElementById("mySidenav").style.width = "100%";
    }

    /* Set the width of the side navigation to 0 */
    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    handleSwitch(state, el) {
        console.log('handleSwitch. elem:', el.target.id);
        let id = el.target.id;
        console.log('new state:', state);
        let cid = getCIDOrDefault();

        switch (id) {
            case 'comingSoon':
                this.state.switchStates.commingSoon=true;
                kambi.setComingSoon(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.state.switchStates.commingSoon=false;
                        this.forceUpdate();
                    });
                });
                break;
            case 'endGame':
                this.state.switchStates.endGame=true;
                kambi.setEndGame(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.state.switchStates.endGame=false;
                        this.forceUpdate();
                    });
                });
                break;
            case 'liveEvents':
                this.state.switchStates.live=true;
                kambi.setLiveEvents(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.state.switchStates.live=false;
                        this.forceUpdate();
                    });
                });
                break;

            case 'smart-suggestions':
                this.state.switchStates.aiEvents=true;
                kambi.setSmartSuggestion(cid, state).then((res) => {
                    kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                        this.state.user = res.data;
                        saveUserToLocalStorage(res.data);
                        this.state.switchStates.aiEvents=false;
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
                            </div>
                            <div className="col-xs-6 p-t ">
                                <SettingSwitch
                                    id={'comingSoon'}
                                    isRecommanded={true}
                                    title={'Coming Soon Alerts'}
                                    info={'Notified me before a match begin.'}
                                    isChecked={this.getComingsoon.bind(this)}
                                    onSwitchChanged={this.handleSwitch}
                                    disabled={this.state.isSwitchesDisabled}
                                />
                                <SettingSwitch
                                    id={'endGame'}
                                    title={'End of Games Alerts'}
                                    info={'Notified me with the final results.'}
                                    isChecked={this.getEndGame.bind(this)}
                                    onSwitchChanged={this.handleSwitch}
                                    disabled={this.state.isSwitchesDisabled}
                                />
                                <SettingSwitch
                                    id={'liveEvents'}
                                    isRecommanded={true}
                                    title={'Live events'}
                                    info={''}
                                    isChecked={this.getLiveEvents.bind(this)}
                                    onSwitchChanged={this.handleSwitch}
                                    disabled={this.state.isSwitchesDisabled}
                                />
                                <SettingSwitch
                                    id={'smart-suggestions'}
                                    isRecommanded={true}
                                    title={'Recommendations'}
                                    info={'Custom Recommendations'}
                                    isChecked={this.getAiEvents.bind(this)}
                                    onSwitchChanged={this.handleSwitch}
                                    disabled={this.state.isSwitchesDisabled}
                                />

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
