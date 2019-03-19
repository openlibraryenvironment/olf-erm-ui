import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { Icon, Layout } from '@folio/stripes/components';

export default class CoverageStatements extends React.Component {
  static propTypes = {
    statements: PropTypes.arrayOf(
      PropTypes.shape({
        endDate: PropTypes.string,
        endIssue: PropTypes.string,
        endVolume: PropTypes.string,
        startDate: PropTypes.string,
        startIssue: PropTypes.string,
        startVolume: PropTypes.string,
      })
    ),
  }

  renderVolume = (volume) => {
    if (!volume) return null;

    return (
      <React.Fragment>
        <FormattedMessage id="ui-agreements.coverage.volumeShort" />
        {volume}
      </React.Fragment>
    );
  }

  renderIssue = (issue) => {
    if (!issue) return null;

    return (
      <React.Fragment>
        <FormattedMessage id="ui-agreements.coverage.issueShort" />
        {issue}
      </React.Fragment>
    );
  }

  renderDate = (date, volume, issue) => {
    if (!date && !volume && !issue) return '*';

    return (
      <React.Fragment>
        { date ? <Layout className="textRight"><FormattedDate value={date} /></Layout> : null }
        <Layout className="textRight">
          {this.renderVolume(volume)}
          {volume && issue ? <React.Fragment>&nbsp;</React.Fragment> : null}
          {this.renderIssue(issue)}
        </Layout>
      </React.Fragment>
    );
  }

  renderStatement = (statement, i) => {
    return (
      <Layout key={i} className="flex justified">
        <Layout className="margin-end-gutter" style={{ width: '40%' }}>
          {this.renderDate(statement.startDate, statement.startVolume, statement.startIssue)}
        </Layout>
        <Icon icon="arrow-right" />
        <Layout className="margin-start-gutter" style={{ width: '40%' }}>
          {this.renderDate(statement.endDate, statement.endVolume, statement.endIssue)}
        </Layout>
      </Layout>
    );
  }

  render() {
    const { statements } = this.props;
    if (!statements || !statements.length) return '-';

    return <Layout className="full">{statements.map(this.renderStatement)}</Layout>;
  }
}
