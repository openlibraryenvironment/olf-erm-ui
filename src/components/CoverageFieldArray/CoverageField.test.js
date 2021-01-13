import React from 'react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@folio/stripes-erm-components/test/jest/__mock__';
import { renderWithIntl, TestForm } from '@folio/stripes-erm-components/test/jest/helpers';
import CoverageField from './CoverageField';


const onSubmit = jest.fn();

describe('CoverageField', () => {
  test('renders correct fields', () => {
    const { getByTestId, getByRole } = renderWithIntl(
      <TestForm onSubmit={onSubmit}>
        <CoverageField
          index={0}
          input={{
            name: "coverageTest"
          }}
        />
      </TestForm>
    );

    expect(getByTestId('coverageField')).toBeInTheDocument();
    expect(getByRole('textbox', {name: "ui-agreements.agreements.startDate"})).toBeInTheDocument();
    expect(getByRole('textbox', {name: "ui-agreements.agreementLines.customCoverage.startVolume"})).toBeInTheDocument();
    expect(getByRole('textbox', {name: "ui-agreements.agreementLines.customCoverage.startIssue"})).toBeInTheDocument();
    expect(getByRole('textbox', {name: "ui-agreements.agreements.endDate"})).toBeInTheDocument();
    expect(getByRole('textbox', {name: "ui-agreements.agreementLines.customCoverage.endVolume"})).toBeInTheDocument();
    expect(getByRole('textbox', {name: "ui-agreements.agreementLines.customCoverage.endIssue"})).toBeInTheDocument();
  });

  // Test start date/end date validation.
  // Overlapping and multiple open ended coverage validation to be covered in CoverageFieldArrayTest
  test('date validation fires for invalid end date', async () => {
    const { getAllByText, getByRole } = renderWithIntl(
      <TestForm onSubmit={onSubmit}>
        <CoverageField
          index={0}
          input={{
            name: "coverageTest"
          }}
        />
      </TestForm>
    );
    userEvent.type(getByRole('textbox', {name: "ui-agreements.agreements.startDate"}), '01/01/2021')
    userEvent.type(getByRole('textbox', {name: "ui-agreements.agreements.endDate"}), '01/01/2002')
    
    /* 
     * This actually works with getByText, because currently the validation only
     * appears on the startDate field until you click away from the endDate field.
     * This behaviour should not be relied upon though, since the validation is set up on two fields.
     * getAllByText returns an array, so just check it has any values in it.
     */
    await waitFor(() => expect(getAllByText('ui-agreements.errors.endDateGreaterThanStartDate')?.[0]).toBeInTheDocument());
  })
});