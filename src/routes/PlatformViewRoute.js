import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import compose from 'compose-function';

import { stripesConnect } from '@folio/stripes/core';

import View from '../components/views/Platform';
import { urls } from '../components/utilities';

class PlatformViewRoute extends React.Component {
  static manifest = Object.freeze({
    platform: {
      type: 'okapi',
      path: 'erm/platforms/:{id}',
    },
    stringTemplates: {
      type: 'okapi',
      path: 'erm/sts/template/:{id}',
      clientGeneratePk: false,
      throwErrors: false
    },
    proxyServers: {
      type: 'okapi',
      path: 'erm/sts',
      params: {
        filters: 'context.value=urlproxier',
      },
      throwErrors: false
    },
  });

  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired
    }).isRequired,
    resources: PropTypes.shape({
      platform: PropTypes.object,
      stringTemplates: PropTypes.arrayOf(PropTypes.object)
    }).isRequired,
  };

  handleClose = () => {
    this.props.history.push(`${urls.platforms()}${this.props.location.search}`);
  }

  handleEdit = () => {
    const { history, location, match } = this.props;
    history.push(`${urls.platformEdit(match.params.id)}${location.search}`);
  }

  handleEResourceClick = (id) => {
    this.props.history.push(`${urls.eresourceView(id)}${this.props.location.search}`);
  }

  handleViewUrlCustomizer = (templateId) => {
    const { history, location, match } = this.props;
    history.push(`${urls.urlCustomizerView(match.params.id, templateId)}${location.search}`);
  }

  handleClickProxyServerAction = (proxyServer, platformId, hasPlatformId) => {
    const mutator = this.props.mutator.proxyServers;
    const { idScopes = [] } = proxyServer;

    const idScopeValues = hasPlatformId ?
      idScopes.filter(id => id !== platformId)
      :
      [...idScopes, platformId];

    const proxyServerPayload = {
      ...proxyServer,
      ...{ idScopes: idScopeValues },
      'context': 'urlProxier'
    };

    return mutator.PUT(proxyServerPayload);
  }

  isLoading = () => {
    const { match, resources } = this.props;
    return (
      match.params.id !== resources?.platform?.records?.[0]?.id &&
      (resources?.platform?.isPending ?? true)
    );
  }

  getRecords = (resource) => {
    return get(this.props.resources, `${resource}.isPending`, true)
      ?
      undefined
      :
      get(this.props.resources, `${resource}.records`);
  }

  render() {
    const {
      resources,
    } = this.props;

    return (
      <View
        key={get(resources, 'eresource.loadedAt', 'loading')}
        data={{
          platform: resources?.platform?.records?.[0] ?? {},
          stringTemplates: resources?.stringTemplates?.records[0] ?? [],
          proxyServers: resources?.proxyServers?.records ?? [],
        }}
        handlers={{
          onClose: this.handleClose,
          onEdit: this.handleEdit,
          onViewUrlCustomiser: this.handleViewUrlCustomizer,
          onClickProxyServerAction: this.handleClickProxyServerAction
        }}
        isLoading={this.isLoading()}
      />
    );
  }
}

export default compose(
  stripesConnect,
)(PlatformViewRoute);
