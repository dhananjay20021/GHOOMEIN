function isEmpty(value) {
  return !value || value.trim() === "";
}

function userCredentialAreValid(email, mobilenumber, password) {
  return (
    email &&
    email.includes("@") &&
    password &&
    password.trim().length >= 6 &&
    mobilenumber &&
    mobilenumber.trim().length >= 10
  );
}

function userDetailsAreValid(
  firstname,
  surname,
  email,
  mobilenumber,
  password,
  dateofbirth,
  monthofbirth,
  yearofbirth,
  gender
) {
  return (
    userCredentialAreValid(email, mobilenumber, password) &&
    !isEmpty(firstname) &&
    !isEmpty(surname) &&
    !isEmpty(dateofbirth) &&
    !isEmpty(monthofbirth) &&
    !isEmpty(yearofbirth) &&
    !isEmpty(gender)
  );
}

module.exports = {
    userDetailsAreValid: userDetailsAreValid
  };