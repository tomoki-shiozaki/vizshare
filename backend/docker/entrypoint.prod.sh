#!/bin/sh
set -ex  # x で実行コマンドを表示、e でエラー時に停止

# 本番用設定
export DJANGO_SETTINGS_MODULE=config.settings

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn on port $PORT..."
# 0.0.0.0 でバインド、ワーカー数は必要に応じて調整
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --threads 4 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -