class ApplicationException(Exception):

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class UnauthorizedError(ApplicationException):

    def __init__(self, message, status_code = 401):
        super().__init__(message, status_code)


class CouldNotCreateResource(ApplicationException):

    def __init__(self, message, status_code = 400):
        super().__init__(message, status_code)   


class NotFoundError(ApplicationException):

    def __init__(self, message, status_code = 404):
        super().__init__(message, status_code)


class AccessDeniedError(ApplicationException):

    def __init__(self, message, status_code = 403):
        super().__init__(message, status_code)


class DatabaseError(ApplicationException):

     def __init__(self, message, status_code = 404):
        super().__init__(message, status_code)   


class InvalidTokenException(UnauthorizedError):

    def __init__(self, message="Nieprawidłowy token", status_code = 401):
        super().__init__(message, status_code)


class TokenExpiredException(UnauthorizedError):

    def __init__(self, message="Token wygasł", status_code = 401):
        super().__init__(message, status_code)


class SurveyModifiedException(ApplicationException):

    def __init__(self, message="Ankieta została zmodyfikowana", status_code = 409):
        super().__init__(message, status_code)
