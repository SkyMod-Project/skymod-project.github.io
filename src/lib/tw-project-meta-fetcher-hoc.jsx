import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import log from './log';

import {setProjectTitle} from '../reducers/project-title';
import {setAuthor, setDescription} from '../reducers/tw';

export const fetchProjectMeta = async projectId => {
    const urls = [
        `https://trampoline.turbowarp.org/api/projects/${projectId}`,
        `https://trampoline.turbowarp.xyz/api/projects/${projectId}`
    ];
    let firstError;
    for (const url of urls) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                return data;
            }
            if (res.status === 404) {
                throw new Error('Project is probably unshared');
            }
            throw new Error(`Unexpected status code: ${res.status}`);
        } catch (err) {
            if (!firstError) {
                firstError = err;
            }
        }
    }
    throw firstError;
};

const getNoIndexTag = () => document.querySelector('meta[name="robots"][content="noindex"]');
const setIndexable = indexable => {
    if (indexable) {
        const tag = getNoIndexTag();
        if (tag) {
            tag.remove();
        }
    } else if (!getNoIndexTag()) {
        const tag = document.createElement('meta');
        tag.name = 'robots';
        tag.content = 'noindex';
        document.head.appendChild(tag);
    }
};

const TWProjectMetaFetcherHOC = function (WrappedComponent) {
    class ProjectMetaFetcherComponent extends React.Component {
        shouldComponentUpdate (nextProps) {
            return this.props.projectId !== nextProps.projectId;
        }
        componentDidUpdate () {
            // project title resetting is handled in titled-hoc.jsx
            this.props.onSetAuthor('', '');
            this.props.onSetDescription('', '');
            const projectId = this.props.projectId;
            // Don't try to load metadata for empty projects.
            if (projectId === '0') {
                return;
            }
            fetchProjectMeta(projectId)
                .then(data => {
                    // If project ID changed, ignore the results.
                    if (this.props.projectId !== projectId) {
                        return;
                    }
                    const title = data.title;
                    if (title) {
                        this.props.onSetProjectTitle(title);
                    }
                    const authorName = data.author.username;
                    const authorThumbnail = `https://trampoline.turbowarp.org/avatars/${data.author.id}`;
                    this.props.onSetAuthor(authorName, authorThumbnail);
                    const instructions = data.instructions || '';
                    const credits = data.description || '';
                    if (instructions || credits) {
                        this.props.onSetDescription(instructions, credits);
                    }
                    setIndexable(true);
                })
                .catch(err => {
                    setIndexable(false);
                    if (`${err}`.includes('unshared')) {
                        this.props.onSetDescription('unshared', 'unshared');
                    }
                    log.warn('cannot fetch project meta', err);
                });
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                projectId,
                onSetAuthor,
                onSetDescription,
                onSetProjectTitle,
                /* eslint-enable no-unused-vars */
                ...props
            } = this.props;
            return (
                <WrappedComponent
                    {...props}
                />
            );
        }
    }
    ProjectMetaFetcherComponent.propTypes = {
        projectId: PropTypes.string,
        onSetAuthor: PropTypes.func,
        onSetDescription: PropTypes.func,
        onSetProjectTitle: PropTypes.func
    };
    const mapStateToProps = state => ({
        projectId: state.scratchGui.projectState.projectId
    });
    const mapDispatchToProps = dispatch => ({
        onSetAuthor: (username, thumbnail) => dispatch(setAuthor({
            username,
            thumbnail
        })),
        onSetDescription: (instructions, credits) => dispatch(setDescription({
            instructions,
            credits
        })),
        onSetProjectTitle: title => dispatch(setProjectTitle(title))
    });
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(ProjectMetaFetcherComponent);
};

export {
    TWProjectMetaFetcherHOC as default
};
