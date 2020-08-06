import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { Field } from 'react-final-form';

import {
  Checkbox,
  Layout
} from '@folio/stripes/components';

export default function SuppressFromDiscoveryFieldArray({ name }) {
  return (
    <>
      <Layout className="padding-bottom-gutter padding-top-gutter" data-test-sfdfa-description>
        <strong>
          <FormattedMessage id="ui-agreements.settings.general.displaySuppressFromDiscovery.description" />
        </strong>
      </Layout>
      <Field
        component={Checkbox}
        data-test-sfdfa-agreement-line
        id="displaySuppressFromDiscoveryAgreementLine"
        label={<FormattedMessage id="ui-agreements.settings.general.displaySuppressFromDiscoveryAgreementLine.title" />}
        name={`${name}.agreementLine`}
        normalize={v => !!v}
        type="checkbox"
      />
      <Field
        component={Checkbox}
        data-test-sfdfa-pci
        id="displaySuppressFromDiscoveryPCI"
        label={<FormattedMessage id="ui-agreements.settings.general.displaySuppressFromDiscoveryPCI.title" />}
        name={`${name}.pci`}
        normalize={v => !!v}
        type="checkbox"
      />
    </>
  );
}

SuppressFromDiscoveryFieldArray.propTypes = {
  name: PropTypes.string
};
