import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import compose from 'compose-function';

import { stripesConnect } from '@folio/stripes/core';
import { withTags } from '@folio/stripes/smart-components';
import { Tags } from '@folio/stripes-erm-components';

import View from '../components/views/EResource';
import { urls } from '../components/utilities';
import { resultCount } from '../constants';

const RECORDS_PER_REQUEST = 100;

class EResourceViewRoute extends React.Component {
  static manifest = Object.freeze({
    eresource: {
      type: 'okapi',
      path: 'erm/resource/:{id}',
    },
    entitlementOptions: {
      type: 'okapi',
      path: 'erm/resource/:{id}/entitlementOptions',
      throwErrors: false,
    },
    entitlements: {
      type: 'okapi',
      path: 'erm/resource/:{id}/entitlements',
      records: 'results',
      perRequest: RECORDS_PER_REQUEST,
      recordsRequired: '%{entitlementsCount}',
      limitParam: 'perPage',
      params: {
        stats: 'true',
      },
    },
    packageContents: {
      type: 'okapi',
      path: 'erm/packages/:{id}/content/%{packageContentsFilter}',
      records: 'results',
      limitParam: 'perPage',
      perRequest: resultCount.RESULT_COUNT_INCREMENT,
      resultOffset: '%{resultOffset}',
      params: {
        filters: 'pkg.id==:{id}',
        sort: 'pti.titleInstance.name;asc',
        stats: 'true',
      },
    },
    query: {},
    entitlementsCount: { initialValue: resultCount.INITIAL_RESULT_COUNT },
    packageContentsFilter: { initialValue: 'current' },
    resultOffset: { initialValue: 0 },
    resultCount: { initialValue: resultCount.INITIAL_RESULT_COUNT },
  });

  static propTypes = {
    handlers: PropTypes.object,
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
    mutator: PropTypes.shape({
      entitlementsCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      packageContentsCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      entitlementsCount: PropTypes.number,
      eresource: PropTypes.object,
      packageContentsFilter: PropTypes.string,
      packageContentsCount: PropTypes.number,
      query: PropTypes.object,
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    tagsEnabled: PropTypes.bool,
  };

  static defaultProps = {
    handlers: {},
  }

  componentDidUpdate() {
    const { mutator, resources } = this.props;
    const totalEntitlements = get(resources, 'entitlements.other.totalRecords', RECORDS_PER_REQUEST);
    const { entitlementsCount } = resources;

    if (totalEntitlements > entitlementsCount) {
      mutator.entitlementsCount.replace(totalEntitlements);
    }
  }

  getHelperApp = () => {
    const { match, resources } = this.props;
    const helper = resources.query.helper;
    if (!helper) return null;

    let HelperComponent = null;

    if (helper === 'tags') HelperComponent = Tags;

    if (!HelperComponent) return null;

    return (
      <HelperComponent
        link={`erm/resource/${match.params.id}`}
        onToggle={() => this.handleToggleHelper(helper)}
      />
    );
  }

  handleClose = () => {
    this.props.history.push(`${urls.eresources()}${this.props.location.search}`);
  }

  handleFilterPackageContents = (path) => {
    const { mutator } = this.props;
    mutator.packageContentsFilter.replace(path);
    mutator.resultOffset.replace(0);
    mutator.resultCount.replace(resultCount.INITIAL_RESULT_COUNT);
  }

  handleNeedMorePackageContents = (_askAmount, index) => {
    const { mutator, resources } = this.props;
    if (index > 0) {
      mutator.resultOffset.replace(index);
    } else {
      mutator.resultCount.replace(resources.resultCount + resultCount.RESULT_COUNT_INCREMENT);
    }
  }

  handleToggleHelper = (helper) => {
    const { mutator, resources } = this.props;
    const currentHelper = resources.query.helper;
    const nextHelper = currentHelper !== helper ? helper : null;

    mutator.query.update({ helper: nextHelper });
  }

  handleToggleTags = () => {
    this.handleToggleHelper('tags');
  }

  isLoading = () => {
    const { match, resources } = this.props;

    return (
      match.params.id !== get(resources, 'eresource.records[0].id') &&
      get(resources, 'eresource.isPending', true)
    );
  }

  getRecords = (resource) => {
    const records = get(this.props.resources, `${resource}.records`, []);
    const isPending = get(this.props.resources, `${resource}.isPending`, true);

    /* We want to send any records if we've fetched them, and only send an empty array
    if the fetch is complete. */
    if (records.length) return records;
    else if (!isPending) return [];
    else return undefined;
  }

  render() {
    const {
      handlers,
      resources,
      tagsEnabled,
    } = this.props;

    return (
      <View
        data={{
          eresource: get(resources, 'eresource.records[0]', {}),
          entitlementOptions: this.getRecords('entitlementOptions'),
          entitlements: this.getRecords('entitlements'),
          packageContentsFilter: this.props.resources.packageContentsFilter,
          packageContents: this.getRecords('packageContents'),
          packageContentsCount: get(this.props.resources, 'packageContents.other.totalRecords', 0),
        }}
        handlers={{
          ...handlers,
          onFilterPackageContents: this.handleFilterPackageContents,
          onNeedMorePackageContents: this.handleNeedMorePackageContents,
          onClose: this.handleClose,
          onToggleTags: tagsEnabled ? this.handleToggleTags : undefined,
        }}
        helperApp={this.getHelperApp()}
        isLoading={this.isLoading()}
        isPending={get(resources, 'packageContents.isPending', true)}
        key={get(resources, 'eresource.loadedAt', 'loading')}
      />
    );
  }
}

export default compose(
  stripesConnect,
  withTags,
)(EResourceViewRoute);
