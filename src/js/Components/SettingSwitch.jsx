import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Toggle from "react-toggle-component";

class SettingSwitch extends Component {

    /**
     * Constructs.
     * @param {object} props Component properties
     */
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        let a = nextProps;
    }

    render() {
        return (

            <section className="settings">
                <strong className="m-r">{this.props.title} </strong>
                {this.props.isRecommanded ? <small className="recommended">RECOMMENDED</small> : null}
                <div className="info">
                    {this.props.info}
                </div>
                <div>
                    <Toggle id={this.props.id}
                            checked={this.props.isChecked()}
                            onToggle={(value, el) => this.props.onSwitchChanged(value, el)}
                            disabled={this.props.disabled}
                    />
                </div>
                <div className="clear-both"></div>
            </section>
        );
    }
}

SettingSwitch.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    info: PropTypes.string,
    onSwitchChanged: PropTypes.func,
    isChecked: PropTypes.boolean,
    isRecommanded: PropTypes.boolean,
    disabled: PropTypes.boolean,
};

SettingSwitch.defaultProps = {
    // logoName: 'football',
};

export default SettingSwitch
