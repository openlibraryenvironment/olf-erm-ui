import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button, Pane, PaneMenu } from '@folio/stripes/components';
import { IfPermission, TitleManager } from '@folio/stripes/core';
import { LoadingPane } from '@folio/stripes-erm-components';


import Package from './Package';
import Title from './Title';
import PackageContentItem from './PackageContentItem';

export default class EResource extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      eresource: PropTypes.shape({
        class: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.object,
      }),
    }),
    handlers: PropTypes.shape({
      onClose: PropTypes.func.isRequired,
      onEdit: PropTypes.func.isRequired,
      onNeedMorePackageContents: PropTypes.func.isRequired,
      onToggleTags: PropTypes.func.isRequired
    }).isRequired,
    helperApp: PropTypes.node,
    isLoading: PropTypes.bool,
  }

  renderEditPCIPaneMenu = () => {
    const {
      data: { eresource },
      handlers,
    } = this.props;

    return (eresource?.class === 'org.olf.kb.PackageContentItem') ? (
      <IfPermission perm="ui-agreements.resources.edit">
        <PaneMenu>
          <FormattedMessage id="ui-agreements.eresources.edit">
            {ariaLabel => (
              <Button
                aria-label={ariaLabel}
                buttonStyle="primary"
                id="clickable-edit-eresource"
                marginBottom0
                onClick={handlers.onEdit}
              >
                <FormattedMessage id="stripes-components.button.edit" />
              </Button>
            )}
          </FormattedMessage>
        </PaneMenu>
      </IfPermission>
    ) : null;
  }

  render() {
    const {
      data = {},
      handlers,
      helperApp,
      isLoading,
    } = this.props;

    if (isLoading) return <LoadingPane onClose={handlers.onClose} />;

    let EResourceViewComponent = Package;

    if (data.eresource?.class === 'org.olf.kb.TitleInstance') {
      EResourceViewComponent = Title;
    } else if (data.eresource?.class === 'org.olf.kb.PackageContentItem') {
      EResourceViewComponent = PackageContentItem;
    }

    return (
      <>
        <Pane
          defaultWidth="55%"
          dismissible
          id="pane-view-eresource"
          lastMenu={this.renderEditPCIPaneMenu()}
          onClose={handlers.onClose}
          paneTitle={data.eresource.name}
        >
          <TitleManager record={data.eresource.name}>
            <EResourceViewComponent data={data} handlers={handlers} />
          </TitleManager>
        </Pane>
        {helperApp}
      </>
    );
  }
}
