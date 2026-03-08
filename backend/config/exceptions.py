"""Custom DRF exception handler — consistent error response format."""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'statusCode': response.status_code,
            'error': _get_error_label(response.status_code),
            'message': _flatten_errors(response.data),
        }
        return Response(error_data, status=response.status_code)

    return response


def _get_error_label(status_code: int) -> str:
    labels = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        409: 'Conflict',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
    }
    return labels.get(status_code, 'Error')


def _flatten_errors(data) -> str:
    if isinstance(data, str):
        return data
    if isinstance(data, list):
        return data[0] if data else 'An error occurred'
    if isinstance(data, dict):
        for key, val in data.items():
            if key == 'detail':
                return str(val)
            return f"{key}: {_flatten_errors(val)}"
    return str(data)
