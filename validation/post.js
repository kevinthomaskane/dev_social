const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  let errors = {};

  // data has to be a string for it to work in the validator function
  data.text = !isEmpty(data.text) ? data.text : "";

  if (!validator.isLength(data.text, {min: 1, max: 300})) {
    errors.text = "Post must be between 1 and 300 characters";
  }

  if (validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  }

  return {
    errors, //same as saying errors: errors
    isValid: isEmpty(errors)
  };
};