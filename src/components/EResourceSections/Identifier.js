import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Col,
  KeyValue,
} from '@folio/stripes/components';

import { getResourceIdentifier } from '../utilities';

const Identifier = (
  { type, titleInstance, width = 3 }
) => {
  const identifier = getResourceIdentifier(titleInstance, type);

  if (!identifier) return null;

  return (
    <Col xs={width}>
      <KeyValue
        label={<FormattedMessage id={`ui-agreements.identifier.${type}`} />}
      >
        <div {...{ [`data-test-${type}`]: true }}>{identifier}</div>
      </KeyValue>
    </Col>
  );
};

Identifier.propTypes = {
  titleInstance: PropTypes.string,
  type: PropTypes.string,
  width: PropTypes.number
};

export default Identifier;
