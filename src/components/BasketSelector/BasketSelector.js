import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Col,
  Layout,
  Row,
  Selection,
} from '@folio/stripes/components';

export default class BasketSelectorDisplay extends React.Component {
  static propTypes = {
    addButtonLabel: PropTypes.node,
    basket: PropTypes.arrayOf(PropTypes.object),
    error: PropTypes.node,
    onAdd: PropTypes.func,
  }

  state = {
    item: { id: '' },
  }

  handleChange = id => {
    const item = this.props.basket.find(i => i.id === id);
    if (!item) return;

    this.setState({ item });
  }

  render() {
    const { addButtonLabel, basket, error, onAdd } = this.props;
    const { item } = this.state;

    const dataOptions = [
      ...basket.map(resource => ({
        value: resource.id,
        label: resource.name,
        disabled: false,
      }))
    ];

    return (
      <Row>
        <Col xs={12} md={8}>
          <FormattedMessage id="ui-agreements.basketSelector.selectPlaceholder">
            {placeholder => (
              <Selection
                dataOptions={dataOptions}
                error={error}
                id="basket-selector"
                label={<FormattedMessage id="ui-agreements.basketSelector.selectLabel" />}
                onChange={this.handleChange}
                placeholder={placeholder}
                value={item.id}
              />
            )}
          </FormattedMessage>
        </Col>
        <Col xs={12} md={4}>
          <Layout style={{ height: '100%' }} className="flex flex-align-items-center">
            <Button
              buttonStyle="primary"
              disabled={!item.id}
              fullWidth
              id="basket-selector-add-button"
              onClick={() => { onAdd(item); }}
            >
              {addButtonLabel}
            </Button>
          </Layout>
        </Col>
      </Row>
    );
  }
}
