import React, { Component } from 'react';
import { bool, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import classNames from 'classnames';
import { calculateQuantityFromHours, timestampToDate } from '../../util/dates';
import { required, composeValidators } from '../../util/validators';
import { propTypes } from '../../util/types';
import config from '../../config';
import { Form, PrimaryButton } from '../../components';
import EstimatedBreakdownMaybe from './EstimatedBreakdownMaybe';
import FieldDateAndTimeInput from './FieldDateAndTimeInput';

import css from './BookingTimeForm.css';

const identity = v => v;

export class BookingTimeFormComponent extends Component {
  constructor(props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleFormSubmit(e) {
    this.props.onSubmit(e);
  }

  render() {
    const { rootClassName, className, price: unitPrice, ...rest } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    if (!unitPrice) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingPriceMissing" />
          </p>
        </div>
      );
    }
    if (unitPrice.currency !== config.currency) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingCurrencyInvalid" />
          </p>
        </div>
      );
    }

    return (
      <FinalForm
        {...rest}
        unitPrice={unitPrice}
        onSubmit={this.handleFormSubmit}
        render={fieldRenderProps => {
          const {
            endDatePlaceholder,
            startDatePlaceholder,
            form,
            pristine,
            handleSubmit,
            intl,
            isOwnListing,
            submitButtonWrapperClassName,
            unitPrice,
            unitType,
            values,
            monthlyTimeSlots,
            timeZone,
          } = fieldRenderProps;

          const startTime = values && values.bookingStartTime ? values.bookingStartTime : null;
          const endTime = values && values.bookingEndTime ? values.bookingEndTime : null;

          const bookingStartLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingStartTitle',
          });
          const bookingEndLabel = intl.formatMessage({ id: 'BookingTimeForm.bookingEndTitle' });

          const startDate = startTime ? timestampToDate(startTime) : null;
          const endDate = endTime ? timestampToDate(endTime) : null;

          // This is the place to collect breakdown estimation data. See the
          // EstimatedBreakdownMaybe component to change the calculations
          // for customized payment processes.
          const bookingData =
            startDate && endDate
              ? {
                  unitType,
                  unitPrice,
                  startDate,
                  endDate,

                  // Calculate the quantity as hours between the booking start and booking end
                  quantity: calculateQuantityFromHours(startDate, endDate),
                  timeZone,
                }
              : null;
          const bookingInfo = bookingData ? (
            <div className={css.priceBreakdownContainer}>
              <h3 className={css.priceBreakdownTitle}>
                <FormattedMessage id="BookingTimeForm.priceBreakdownTitle" />
              </h3>
              <EstimatedBreakdownMaybe bookingData={bookingData} />
            </div>
          ) : null;

          const submitButtonClasses = classNames(
            submitButtonWrapperClassName || css.submitButtonWrapper
          );

          const startDateInputProps = {
            name: 'bookingStartDate',
            useMobileMargins: false,
            id: `BookingTimeForm.bookingStartDate`,
            label: bookingStartLabel,
            placeholderText: startDatePlaceholder,
            format: identity,
            validate: composeValidators(required('Required')),
          };

          const endDateInputProps = {
            name: 'bookingEndDate',
            useMobileMargins: false,
            id: `BookingTimeForm.bookingEndDate`,
            label: bookingEndLabel,
            placeholderText: endDatePlaceholder,
            format: identity,
            validate: composeValidators(required('Required')),
          };

          const startTimeInputProps = {
            id: `BookingTimeForm.bookingStartDate`,
            name: 'bookingStartTime',
            label: 'Start Time',
          };
          const endTimeInputProps = {
            id: `BookingTimeForm.bookingEndDate`,
            name: 'bookingEndTime',
            label: 'End Time',
          };

          const dateInputProps = {
            startDateInputProps,
            endDateInputProps,
            startTimeInputProps,
            endTimeInputProps,
          };

          return (
            <Form onSubmit={handleSubmit} className={classes}>
              {monthlyTimeSlots && timeZone ? (
                <FieldDateAndTimeInput
                  {...dateInputProps}
                  className={css.bookingDates}
                  monthlyTimeSlots={monthlyTimeSlots}
                  values={values}
                  intl={intl}
                  form={form}
                  pristine={pristine}
                  timeZone={timeZone}
                />
              ) : null}
              {bookingInfo}
              <p className={css.smallPrint}>
                <FormattedMessage
                  id={
                    isOwnListing
                      ? 'BookingTimeForm.ownListing'
                      : 'BookingTimeForm.youWontBeChargedInfo'
                  }
                />
              </p>
              <div className={submitButtonClasses}>
                <PrimaryButton type="submit">
                  <FormattedMessage id="BookingTimeForm.requestToBook" />
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

BookingTimeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  price: null,
  isOwnListing: false,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  monthlyTimeSlots: null,
};

BookingTimeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  unitType: propTypes.bookingUnitType.isRequired,
  price: propTypes.money,
  isOwnListing: bool,
  monthlyTimeSlots: object,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,
};

const BookingTimeForm = compose(injectIntl)(BookingTimeFormComponent);
BookingTimeForm.displayName = 'BookingTimeForm';

export default BookingTimeForm;