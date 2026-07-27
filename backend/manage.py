#!/usr/bin/env python
"""Django's command-line utility for Trip Planner."""
import os
import sys

def main():
    # Insert app/ directory into sys.path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(base_dir, 'app')
    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
