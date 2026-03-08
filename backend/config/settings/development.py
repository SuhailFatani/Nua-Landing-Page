"""Development settings — DEBUG on, relaxed security."""
from .base import *

DEBUG = True

# Accept all hosts in development
ALLOWED_HOSTS = ['*']

# Show full errors in development
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
]

# More permissive CORS in development
CORS_ALLOW_ALL_ORIGINS = True

LOGGING['root']['level'] = 'DEBUG'
