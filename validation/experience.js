const Validator = require('validator');
const { isEmpty } = require('./is-empty');

const validateExperienceInput = (data) => {
  let errors = {};
  data.title = !isEmpty(data.title) ? data.title : '';
  data.company = !isEmpty(data.company) ? data.company : '';
  data.from = !isEmpty(data.from) ? data.from : '';
  data.location = !isEmpty(data.location) ? data.location : '';

  if (Validator.isEmpty(data.title)) {
    errors.title = 'title is not valid';
  }
  if (Validator.isEmpty(data.company)) {
    errors.company = 'company is required';
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = 'from date field is required';
  }
  if (Validator.isEmpty(data.location)) {
    errors.location = 'location field is required';
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
};

module.exports = { validateExperienceInput };