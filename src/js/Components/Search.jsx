import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
//import swal from 'sweetalert2'
import kambi from '../Services/kambi'
import _ from 'lodash';
import styles from './Search.scss'
import {getCIDOrDefault} from '../Services/helper';
// import toastr from 'reactjs-toastr';
// import 'reactjs-toastr/lib/toast.css';
import {saveUserToLocalStorage} from '../Services/helper';

import toastr from 'toastr';

const theme = {
    container: {
        display: 'flex'
    },
    input: {
        // width: {value: '100%', important: true},
        flex: 1,
        height: {value: 30, important: true},
        padding: '10px 20px',
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 300,
        fontSize: 16,
        border: '1px solid #aaa',
        // borderTopLeftRadius: 4,
        // borderTopRightRadius: 4,
        // borderBottomLeftRadius: 4,
        // borderBottomRightRadius: 4,

        margin: '0 16px',
        //width: '316px',
        borderRadius: '1px'
    },
    inputFocused: {
        outline: 'none'
    },
    inputOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },
    suggestionsContainer: {
        display: 'none'
    },
    suggestionsContainerOpen: {
        display: 'block',
        position: 'absolute',
        marginTop: '39px',
        // width: 280,
        border: '1px solid #aaa',
        backgroundColor: '#fff',
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 300,
        fontSize: 16,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        zIndex: 2
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
        color: 'black'
    },
    suggestion: {
        cursor: 'pointer',
        padding: '10px 20px'
    },
    suggestionHighlighted: {
        backgroundColor: '#ddd'
    }
};


const url = 'https://cts-api.kambi.com/offering/api/v3/888/term/search.json?lang=en_GB&market=ZZ&client_id=2&channel_id=1&ncid=1528987662096&term=li\\n';//https://api.aws.kambicdn.com/offering/api/v3/888/term/search.json?lang=en_GB&market=ZZ&client_id=2&channel_id=1&ncid=1528987662096&term=li\n';
// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    if (inputLength < 2) return [];
    getTeamsByNameTerm(inputValue).then((res) => {
        return res;
    });

    // return inputLength === 0 ? [] : leagues.filter(lang =>
    //     lang.name.toLowerCase().slice(0, inputLength) === inputValue
    // );
};


const getTeamsByNameTerm = (teamName) => {
    return kambi.getTeamsByName(teamName).then((response) => {
        var res = response.data.resultTerms;
        res.forEach((r) => {
            if (r.type == 'PARTICIPANT') {//r.id.indexOf('football') > -1 &&
                r.name = r.englishName;
                r.fav_id = r.id + '_' + r.englishName;
                leagues.push(r);
            }
        });

        // this.setState({suggestion: leagues});
        return res.length === 0 ? [] : leagues;

    })
};
// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
//const getSuggestionValue = suggestion => suggestion.englishName;
const getSuggestionValue = suggestion => suggestion.fav_id;
var imageStyle = {
    float: 'right',
    height: 'auto',
    width: '100%'
}


class Search extends Component {

    /**
     * Constructs.
     * @param {object} props Component properties
     */
    constructor(props) {
        super(props);

        this.state = {
            value: '',
            suggestions: [],
            // user: {favorites: []},
            cid: ''
        };
        this.init();
    }

    componentWillReceiveProps(nextProps) {
        this.state.cid = getCIDOrDefault();
        kambi.getUserTeams(this.state.cid).then((res) => {
            if (!res) res = {favorites: []};
            this.state.user = res;
        })
    }

    init = () => {
        this.state.cid = getCIDOrDefault();
        kambi.getUserTeams(this.state.cid).then((res) => {
            if (!res) res = {favorites: []};
            this.setState({user: res});
        })
    };

    renderSuggestion = suggestion => (
        <div>
            <div title={suggestion.englishName} className={styles.filter_name}>{suggestion.englishName}</div>
            <div className={styles.category}>{this.getCategoryName(suggestion)}</div>
            {!this.isUserTeam(suggestion.englishName) ?
                <a className="btn btn-success btn-xs f-u-btn" onClick={() => this.followClicked(suggestion)}>Follow</a>
                : null}
            {this.isUserTeam(suggestion.englishName) ?
                <a className="btn btn-danger btn-xs f-u-btn"
                   onClick={() => this.unFollowClicked(suggestion)}>Unfollow</a>
                : null}
            <div className="clear-both"></div>
        </div>
    );

    getCategoryName(suggestion) {
        var arr = suggestion.id.split('/');
        if (arr[1] && arr[1].indexOf('___') > -1) {
            arr[1] = arr[1].replace('___', ' & ');
        } else if (arr[1] && arr[1].indexOf('_') > -1) {
            arr[1] = arr[1].replace('_', ' ');
        }
        return '(' + arr[1] + ')';

    }

    isUserTeam(team) {

        var exist = _.find(this.state.user.favorites, (ut) => {
            return ut.englishName == team;
        });
        return exist;
        //return this.state.userTeams.indexOf(team) > -1;
    }

    unFollowClicked = (suggestion) => {
        var team = _.find(this.state.user.favorites, (ut) => {
            return ut.team == suggestion.id;
        });
        if (team) {
            kambi.unFollowTeam(team._id, getCIDOrDefault()).then(() => {
                toastr.success('Unfollowed ' + team.englishName + ' successfully.', 'UnFollow');
                kambi.getUserTeams(getCIDOrDefault(), true).then((res) => {
                    this.setState({user:res.data});
                    saveUserToLocalStorage(res.data);
                    if (typeof this.props.onFollowUnfollowFromSearchHandler === 'function') {
                        this.props.onFollowUnfollowFromSearchHandler(suggestion);
                    }

                });
            })
        }
    };

    followClicked = (suggestion) => {
// alert('from search '+this.state.cid)
        let cid = getCIDOrDefault();
        kambi.followTeam(suggestion.id, cid, suggestion.englishName).then(() => {


            toastr.success('Followed ' + suggestion.englishName + ' successfully.', 'Follow');

            kambi.getUserTeams(cid, true).then((res) => {
                this.setState({user:res.data});
                saveUserToLocalStorage(res.data);
                if (typeof this.props.onFollowUnfollowFromSearchHandler === 'function') {
                    this.props.onFollowUnfollowFromSearchHandler(suggestion);
                }
            });


            // this.init();
        })
        console.log('follow ' + suggestion);
    };

    onChange = (event, {newValue}) => {
        if (newValue.indexOf('_') > -1) {
            newValue = newValue.split('_')[1];
        }
        this.setState({
            value: newValue
        });
    };

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    onSuggestionsFetchRequested = ({value}) => {
        if (value.length >= 2)
            this.loadTeams(value);
        // this.setState({
        //     suggestions: getSuggestions(value)
        // });
    };

    loadTeams = (teamName) => {
        let tempLeagues = [];
        return kambi.getTeamsByName(teamName).then((response) => {
            var res = response.data.resultTerms;
            res.forEach((r) => {
                if (r.type == 'PARTICIPANT') {//r.id.indexOf('football') > -1 &&
                    r.name = r.englishName;
                    r.fav_id = r.id + '_' + r.englishName;
                    tempLeagues.push(r);
                }
            });
            let suggestions = tempLeagues;
            this.setState({suggestions});
            // return res.length === 0 ? [] : leagues;

        })
    }

    // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };
    onSuggestionSelected = (event, {suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => {
        //Here you do whatever you want with the values
        console.log(suggestionValue)
        //alert(suggestionValue); //For example alert the selected value
        this.setState({
            value: ''
        });
    };

    render() {
        const {value, suggestions} = this.state;

        // Autosuggest will pass through all these props to the input.
        const inputProps = {
            placeholder: 'Type a team or player name',
            value,
            onChange: this.onChange,
            className: 'form-control',
        };

        return (
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSuggestionSelected}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={inputProps}
                theme={theme}
            />
        );
    }
}


Search.propTypes = {
    /**
     * Logo CSS class name.
     * These classes are defined in operator-specific CSS file.
     */
    // logoName: PropTypes.string,
    onFollowUnfollowFromSearchHandler: PropTypes.func,
    onUnfollow: PropTypes.func
};

Search.defaultProps = {
    // logoName: 'football',
};

export default Search
