#!/bin/bash

# dc.sh - A wrapper for docker compose to standardize commands across the project.
# Added /usr/local/bin to PATH to ensure docker/docker-compose are found.
export PATH=$PATH:/usr/local/bin

COMMAND=$1
shift

case "$COMMAND" in
  up)
    docker compose up "$@"
    ;;
  down)
    docker compose down "$@"
    ;;
  ps)
    docker compose ps "$@"
    ;;
  logs)
    docker compose logs "$@"
    ;;
  exec)
    SERVICE=$1
    shift
    docker compose exec "$SERVICE" "$@"
    ;;
  run)
    SERVICE=$1
    shift
    docker compose run --rm "$SERVICE" "$@"
    ;;
  build)
    docker compose build "$@"
    ;;
  restart)
    docker compose restart "$@"
    ;;
  *)
    echo "Usage: ./dc.sh {up|down|ps|logs|exec|run|build|restart} [args]"
    exit 1
    ;;
esac
