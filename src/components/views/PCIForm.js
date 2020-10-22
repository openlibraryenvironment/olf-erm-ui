import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  AccordionSet,
  AccordionStatus,
  Button,
  Col,
  ExpandAllButton,
  HasCommand,
  IconButton,
  Pane,
  PaneFooter,
  PaneMenu,
  Paneset,
  Row,
} from '@folio/stripes/components';
import { TitleManager } from '@folio/stripes/core';
import stripesFinalForm from '@folio/stripes/final-form';
import css from './PCIForm.css';

import { PCIFormCoverage, PCIFormInfo } from '../EResourceSections';

class PCIForm extends React.Component {
  static propTypes = {
    form: PropTypes.shape({
      getRegisteredFields: PropTypes.func.isRequired,
    }).isRequired,
    handlers: PropTypes.PropTypes.shape({
      collapseAllSections: PropTypes.func.isRequired,
      expandAllSections: PropTypes.func.isRequired,
      isSuppressFromDiscoveryEnabled: PropTypes.func.isRequired,
      onClose: PropTypes.func.isRequired,
    }),
    initialValues: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    values: PropTypes.object,
  }

  static defaultProps = {
    initialValues: {},
  }

  constructor(props) {
    super(props);
    this.accordionStatusRef = React.createRef();
  }

  getInitialAccordionsState = () => {
    return {
      pciFormCoverage: true,
    };
  }

  getSectionProps(id) {
    const { form, values = {} } = this.props;

    return {
      form,
      id,
      values,
    };
  }

  handleSaveKeyCommand = (e) => {
    const {
      handleSubmit,
      pristine,
      submitting,
    } = this.props;

    e.preventDefault();

    if (!pristine && !submitting) {
      handleSubmit();
    }
  }

  renderPaneFooter() {
    const {
      handlers,
      handleSubmit,
      pristine,
      submitting,
    } = this.props;

    return (
      <PaneFooter
        renderEnd={(
          <Button
            buttonStyle="primary mega"
            disabled={pristine || submitting}
            id="clickable-update-pci"
            marginBottom0
            onClick={handleSubmit}
            type="submit"
          >
            <FormattedMessage id="stripes-components.saveAndClose" />
          </Button>
        )}
        renderStart={(
          <Button
            buttonStyle="default mega"
            id="clickable-cancel"
            marginBottom0
            onClick={handlers.onClose}
          >
            <FormattedMessage id="stripes-components.cancel" />
          </Button>
        )}
      />
    );
  }

  renderFirstMenu() {
    return (
      <PaneMenu>
        <FormattedMessage id="ui-agreements.pci.closeEdit">
          {ariaLabel => (
            <IconButton
              aria-label={ariaLabel}
              icon="times"
              id="close-pci-form-button"
              onClick={this.props.handlers.onClose}
            />
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  }

  shortcuts = [
    {
      name: 'save',
      handler: this.handleSaveKeyCommand,
    },
    {
      name: 'expandAllSections',
      handler: (e) => this.props.handlers.expandAllSections(e, this.accordionStatusRef),
    },
    {
      name: 'collapseAllSections',
      handler: (e) => this.props.handlers.collapseAllSections(e, this.accordionStatusRef),
    }
  ];

  render() {
    const { form, handlers: { isSuppressFromDiscoveryEnabled }, values: { name } } = this.props;

    const hasLoaded = form.getRegisteredFields().length > 0;

    return (
      <HasCommand
        commands={this.shortcuts}
        isWithinScope
        scope={document.body}
      >
        <Paneset>
          <Pane
            centerContent
            defaultWidth="100%"
            firstMenu={this.renderFirstMenu()}
            footer={this.renderPaneFooter()}
            id="pane-pci-form"
            paneTitle={<FormattedMessage id="ui-agreements.pci.editPci" values={{ name }} />}
          >
            <TitleManager record={name}>
              <form id="form-pci">
                <PCIFormInfo isSuppressFromDiscoveryEnabled={isSuppressFromDiscoveryEnabled} />
                <AccordionStatus ref={this.accordionStatusRef}>
                  {hasLoaded ? <div id="form-loaded" /> : null}
                  <Row end="xs">
                    <Col xs>
                      <ExpandAllButton />
                    </Col>
                  </Row>
                  <AccordionSet initialStatus={this.getInitialAccordionsState()}>
                    <div className={css.separator} />
                    <PCIFormCoverage {...this.getSectionProps('pciFormCoverage')} />
                  </AccordionSet>
                </AccordionStatus>
              </form>
            </TitleManager>
          </Pane>
        </Paneset>
      </HasCommand>
    );
  }
}

export default stripesFinalForm({
  initialValuesEqual: (a, b) => isEqual(a, b),
  keepDirtyOnReinitialize: true,
  subscription: {
    values: true,
  },
  navigationCheck: true,
})(PCIForm);
