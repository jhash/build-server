import _ from 'lodash'

export const BAD_REQUEST = 400
export const UNAUTHORIZED = 401
export const FORBIDDEN = 403
export const NOT_FOUND = 404
export const METHOD_NOT_ALLOWED = 405
export const GONE = 410
export const UNSUPPORTED_MEDIA_TYPE = 415
export const UNPROCESSABLE_ENTITY = 422
export const TOO_MANY_REQUESTS = 429

const ERROR_CODE_DEFAULT_MESSAGES = {
  [BAD_REQUEST]: 'Bad Request', // The request is malformed, such as if the body does not parse
  [UNAUTHORIZED]: 'Unauthorized', // When no or invalid authentication details are provided. Also useful to trigger an auth popup if the API is used from a browser
  [FORBIDDEN]: 'Forbidden', // When authentication succeeded but authenticated user doesn't have access to the resource
  [NOT_FOUND]: 'Not Found', // When a non-existent resource is requested
  [METHOD_NOT_ALLOWED]: 'Method Not Allowed', // When an HTTP method is being requested that isn't allowed for the authenticated user
  [GONE]: 'Gone', // Indicates that the resource at this end point is no longer available. Useful as a blanket response for old API versions
  [UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type', // If incorrect content type was provided as part of the request
  [UNPROCESSABLE_ENTITY]: 'Unprocessable Entity', // Used for validation errors
  [TOO_MANY_REQUESTS]: 'Too Many Requests' // When a request is rejected due to rate limiting
}

class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (_.isFunction(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export default class BuildError extends ExtendableError {
  constructor(errorCode, message = ERROR_CODE_DEFAULT_MESSAGES[errorCode]) {
    super(message)
  }
}
