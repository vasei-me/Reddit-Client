export class IValidator {
  validate(input) {
    throw new Error("Method not implemented: validate");
  }

  sanitize(input) {
    throw new Error("Method not implemented: sanitize");
  }

  getErrors() {
    throw new Error("Method not implemented: getErrors");
  }

  clearErrors() {
    throw new Error("Method not implemented: clearErrors");
  }
}
