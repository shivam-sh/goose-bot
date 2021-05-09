/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 */

export default class Result<T, E> {
  public static success<T>(value: T): Result<T, null> {
    return new Result<T, null>(true, value, null);
  }

  public static failure<E>(error: E): Result<null, E> {
    return new Result<null, E>(false, null, error);
  }

  isValid: boolean;
  isError: boolean;

  value: T;
  error: E;

  private constructor(succeeded: boolean, success: T, error: E) {
    this.isValid = succeeded;
    this.isError = !succeeded;
    this.value = success;
    this.error = error;
  }
}
