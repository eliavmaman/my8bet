import React, {Component} from 'react'
import PropTypes from 'prop-types'
import kambi from '../Services/kambi'
import {getCIDOrDefault} from '../Services/helper';
import {saveUserToLocalStorage} from '../Services/helper';
import toastr from "toastr";

class FavoriteTeams extends Component {

    /**
     * Constructs.
     * @param {object} props Component properties
     */
    constructor(props) {
        super(props);

        this.state = {
            user: {favorites: []},
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user)
            this.setState({user: nextProps.user});

    }

    componentDidMount() {
        this.setState({user: this.props.user});
    }

    getUserTeams() {
        var listItems = this.state.user.favorites.map((ut,i) => {
            return (
                <li key={i}>
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

    render() {
        return (

            <div>
                {this.getUserTeams()}
            </div>

        );
    }
}


FavoriteTeams.propTypes = {
    /**
     * Logo CSS class name.
     * These classes are defined in operator-specific CSS file.
     */

    user: PropTypes.object,
    onFollowHandler: PropTypes.func,
    onUnFollow: PropTypes.func
};

FavoriteTeams.defaultProps = {
    // logoName: 'football',
};

export default FavoriteTeams
