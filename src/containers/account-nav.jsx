/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import AccountNavComponent from '../components/menu-bar/account-nav.jsx';

// sm: auth
import {getName, isLoggedIn, icon64} from '../sm-auth.js';

const AccountNav = function (props) {
    const {
        ...componentProps
    } = props;
    return (
        <AccountNavComponent
            {...componentProps}
        />
    );
};

AccountNav.propTypes = {
    classroomId: PropTypes.string,
    isEducator: PropTypes.bool,
    isRtl: PropTypes.bool,
    isStudent: PropTypes.bool,
    profileUrl: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    username: PropTypes.string
};

const mapStateToProps = state => ({
    classroomId: state.session && state.session.session && state.session.session.user ?
        state.session.session.user.classroomId : '',
    isEducator: state.session && state.session.permissions && state.session.permissions.educator,
    isStudent: state.session && state.session.permissions && state.session.permissions.student,
    profileUrl: isLoggedIn() ? `/user/${getName()}` : '',
    thumbnailUrl: isLoggedIn() ? icon64 : null,
    username: isLoggedIn() ? getName() : null
});

const mapDispatchToProps = () => ({});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountNav));
