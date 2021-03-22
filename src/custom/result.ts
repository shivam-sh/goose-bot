/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 */

class Result<T, E> {
    success(value: T): Result<T, null> {
        return new Result<T, null>(true, value, null);
    }

    failure<T>(error: E): Result<null, E> {
        return new Result<null, E>(false, null, error);
    }

    isValid: boolean
    isError: boolean

    value: T
    error: E

    private constructor(succeeded: boolean, success: T, error: E) {
        this.isValid = succeeded
        this.isError = !succeeded
        this.value = success
        this.error = error
    }
}