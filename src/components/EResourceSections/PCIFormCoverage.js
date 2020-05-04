import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  KeyValue
} from '@folio/stripes/components';
import { FieldArray } from 'react-final-form-arrays';
import Embargo from '../Embargo';

import CoverageFieldArray from '../CoverageFieldArray';

export default class PCIFormCoverage extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    values: PropTypes.object,
  };

  render() {
    const { id, values } = this.props;

    return (
      <Accordion
        id={id}
        label={<FormattedMessage id="ui-agreements.eresources.coverage" />}
      >
        {values?.embargo ?
          (
            <KeyValue label={<FormattedMessage id="ui-agreements.embargo" />}>
              <Embargo embargo={values?.embargo} />
            </KeyValue>
          ) : null
        }
        <FieldArray
          addButtonId="edit-pci-add-coverage-button"
          addLabelId="ui-agreements.pci.addCoverage"
          component={CoverageFieldArray}
          deleteButtonTooltipId="ui-agreements.pci.removeCoverage"
          headerId="ui-agreements.pci.coverageTitle"
          id="pci-form-coverages"
          name="coverage"
        />
      </Accordion>
    );
  }
}
