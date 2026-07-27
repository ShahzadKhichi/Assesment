import os
import sys

# Add app directory to Python path for Vercel serverless execution
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
