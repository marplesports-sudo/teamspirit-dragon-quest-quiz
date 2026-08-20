#!/usr/bin/env bash
# Деплой app/ на статический хост по SSH.
#
# Атомарная выкладка: распаковываем рядом, потом переставляем каталоги, так что
# частично распакованное дерево никогда не отдаётся наружу. Предыдущая версия
# остаётся в $REMOTE_DIR.old — откат это один mv.
#
# Настраивается двумя переменными окружения:
#   DEPLOY_HOST  — ssh-хост (алиас из ~/.ssh/config либо user@host)
#   DEPLOY_DIR   — каталог на сервере, по умолчанию /var/www/teamspirit-quiz
#
#   DEPLOY_HOST=myserver ./deploy/deploy.sh
set -euo pipefail

HOST="${DEPLOY_HOST:?укажите DEPLOY_HOST, напр. DEPLOY_HOST=myserver ./deploy/deploy.sh}"
REMOTE_DIR="${DEPLOY_DIR:-/var/www/teamspirit-quiz}"
cd "$(dirname "$0")/.."

ARCHIVE=$(mktemp -t ts-quiz).tgz
trap 'rm -f "$ARCHIVE"' EXIT
# tests/ и package.json нужны только для разработки — на прод не едут
tar czf "$ARCHIVE" \
  --exclude='./tests' --exclude='./package.json' --exclude='.DS_Store' \
  -C app .

scp "$ARCHIVE" "$HOST:/tmp/ts-quiz.tgz"
ssh "$HOST" "
  set -euo pipefail
  rm -rf $REMOTE_DIR.new
  mkdir -p $REMOTE_DIR.new
  tar xzf /tmp/ts-quiz.tgz -C $REMOTE_DIR.new
  chown -R www-data:www-data $REMOTE_DIR.new
  rm -rf $REMOTE_DIR.old
  if [ -d $REMOTE_DIR ]; then mv $REMOTE_DIR $REMOTE_DIR.old; fi
  mv $REMOTE_DIR.new $REMOTE_DIR
  rm -f /tmp/ts-quiz.tgz
"
echo "Deployed to $HOST:$REMOTE_DIR"
