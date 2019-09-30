import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { Accordion, Badge, Button, ButtonGroup, Layout, MultiColumnList } from '@folio/stripes/components';
import { Spinner } from '@folio/stripes-erm-components';

import CoverageStatements from '../CoverageStatements';
import EResourceLink from '../EResourceLink';
import FormattedUTCDate from '../FormattedUTCDate';

export default class PackageContents extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      packageContents: PropTypes.array,
    }),
    onClickFilterButton: PropTypes.func.isRequired,
  };

  columnMapping = {
    name: <FormattedMessage id="ui-agreements.eresources.name" />,
    platform: <FormattedMessage id="ui-agreements.eresources.platform" />,
    coverage: <FormattedMessage id="ui-agreements.eresources.coverage" />,
    accessStart: <FormattedMessage id="ui-agreements.eresources.accessStart" />,
    accessEnd: <FormattedMessage id="ui-agreements.eresources.accessEnd" />,
  }

  columnWidths = {
    name: 250,
    platform: 150,
  }

  formatter = {
    name: pci => <EResourceLink eresource={pci.pti.titleInstance} />,
    platform: pci => get(pci, 'pti.platform.name', ''),
    coverage: pci => <CoverageStatements statements={pci.pti.coverage} />,
    accessStart: pci => this.renderDate(pci.accessStart),
    accessEnd: pci => this.renderDate(pci.accessEnd),
  }

  visibleColumns = [
    'name',
    'platform',
    'coverage',
    'accessStart',
    'accessEnd',
  ]

  renderList = (packageContents) => {
    return (
      <MultiColumnList
        columnMapping={this.columnMapping}
        columnWidths={this.columnWidths}
        contentData={packageContents}
        formatter={this.formatter}
        id="packageContents-list"
        visibleColumns={this.visibleColumns}
      />
    );
  }

  renderDate = date => (
    date ? <FormattedUTCDate value={date} /> : '-'
  )

  renderLoading = () => (
    <Spinner />
  )

  renderBadge = () => {
    const count = get(this.props.data, 'packageContents.length');
    return count !== undefined ? <Badge>{count}</Badge> : <Spinner />;
  }

  renderFilterButtons = () => (
    <Layout className="textCentered">
      <ButtonGroup>
        <Button
          autoFocus
          id="clickable-pci-current"
          onClick={() => this.props.onClickFilterButton('current')}
        >
          <FormattedMessage id="ui-agreements.content.current" />
        </Button>
        <Button
          id="clickable-pci-future"
          onClick={() => this.props.onClickFilterButton('future')}
        >
          <FormattedMessage id="ui-agreements.content.future" />
        </Button>
        <Button
          buttonStyle="default"
          id="clickable-pci-dropped"
          onClick={() => this.props.onClickFilterButton('dropped')}
        >
          <FormattedMessage id="ui-agreements.content.dropped" />
        </Button>
        <Button
          buttonStyle="default"
          id="clickable-pci-all"
          onClick={() => this.props.onClickFilterButton('')}
        >
          <FormattedMessage id="ui-agreements.content.all" />
        </Button>
      </ButtonGroup>
    </Layout>
  )

  render() {
    const { data: { packageContents } } = this.props;

    return (
      <Accordion
        id="eresource-acquisition-options"
        displayWhenClosed={this.renderBadge()}
        displayWhenOpen={this.renderBadge()}
        label={<FormattedMessage id="ui-agreements.eresources.packageResources" />}
      >
        { this.renderFilterButtons() }

        { packageContents ? this.renderList(packageContents) : this.renderLoading() }
      </Accordion>
    );
  }
}
