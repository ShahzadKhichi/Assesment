import os
import sys
import django

sys.path.insert(0, 'app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def reset_db():
    with connection.cursor() as cursor:
        cursor.execute('SET FOREIGN_KEY_CHECKS = 0;')
        cursor.execute('SHOW TABLES;')
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Found {len(tables)} tables to drop.")
        for table in tables:
            cursor.execute(f"DROP TABLE IF EXISTS `{table}`;")
            print(f"Dropped table: {table}")
        cursor.execute('SET FOREIGN_KEY_CHECKS = 1;')

if __name__ == '__main__':
    reset_db()
