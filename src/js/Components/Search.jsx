import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
//import swal from 'sweetalert2'
import kambi from '../Services/kambi'
import _ from 'lodash';
import styles from './Search.scss'

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
const leagues = [
    // {
    //     name: 'Liverpool',
    //     image: 'http://www.tibetanreview.net/wp-content/uploads/2017/10/Liverpool-FC.jpg'
    // },
    // {
    //     name: 'West ham',
    //     image: 'https://pbs.twimg.com/profile_images/750995345237237762/l2ccfRBd.jpg'
    // }
];

const url = 'https://api.aws.kambicdn.com/offering/api/v3/888/term/search.json?lang=en_GB&market=ZZ&client_id=2&channel_id=1&ncid=1528987662096&term=li\n';
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
}
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
// Use your imagination to render suggestions.
// const renderSuggestion = suggestion => (
//     <div>
//         <span>{suggestion.englishName}</span>
//         <a className="btn btn-primary btn-xs pull-right" style={{background: '#dd5516'}}
//            onclick={this.followClicked(event,suggestion)}>Follow </a>
//     </div>
// );

class Search extends Component {

    /**
     * Constructs.
     * @param {object} props Component properties
     */
    constructor() {
        super();

        // Autosuggest is a controlled component.
        // This means that you need to provide an input value
        // and an onChange handler that updates this value (see below).
        // Suggestions also need to be provided to the Autosuggest,
        // and they are initially empty because the Autosuggest is closed.
        this.state = {
            value: '',
            suggestions: [],
            userTeams: []
        };
        this.init();
    }

    init = () => {
        kambi.getUserTeams(123).then((res) => {

            this.state.userTeams = res.data;
        })
    };

    renderSuggestion = suggestion => (
        <div>
            <span className={styles.filter_name}>{suggestion.englishName}</span><span
            className={styles.category}>{this.getCategoryName(suggestion)}</span>
            {!this.isUserTeam(suggestion.englishName) ?
                <i className="fas fa-thumbs-up" title="Follow"
                   onClick={() => this.followClicked(suggestion)}></i> : null}


            {this.isUserTeam(suggestion.englishName) ?
                <i className="fas fa-thumbs-down" title="Unfollow"
                   onClick={() => this.unFollowClicked(suggestion)}></i> : null}
        </div>
    );

    getCategoryName(suggestion) {
        var arr = suggestion.id.split('/');
        if (arr[1] && arr[1].indexOf('___') > -1) {
            arr[1] = arr[1].replace('___', ' & ');
        } else if (arr[1] && arr[1].indexOf('_') > -1) {
            arr[1] = arr[1].replace('_', ' ');
        }
        return arr[1];

    }

    isUserTeam(team) {
        var exist = _.find(this.state.userTeams, (ut) => {
            return ut.englishName == team;
        });
        return exist;
        //return this.state.userTeams.indexOf(team) > -1;
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

    followClicked = (suggestion) => {

        kambi.followTeam(suggestion.fav_id, 123, suggestion.englishName).then(() => {
            // swal(suggestion.englishName + ' Was added to your favorite list.');
            // if (typeof this.props.onFollowHandler === 'function') {
            //     this.props.onFollowHandler(suggestion);
            // }
            this.init();
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
    };

    render() {
        const {value, suggestions} = this.state;

        // Autosuggest will pass through all these props to the input.
        const inputProps = {
            placeholder: 'Type a team or league name',
            value,
            onChange: this.onChange,
            className: 'form-control',
        };

        // Finally, render it!
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
    onFollowHandler: PropTypes.func
};

Search.defaultProps = {
    // logoName: 'football',
};

export default Search
