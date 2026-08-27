#!/usr/bin/env bash
#
# Deploys Essor: pulls the latest code, fetches the reactive_resume image built by CI
# (.github/workflows/docker-build.yml), and recreates the container via Docker Compose.
# Meant to run on the actual deployment host (behind Traefik) or locally against a
# docker-compose stack already brought up with `compose.yml`. Database migrations run
# automatically at server startup, so there is no separate migration step here.
#
# Usage:
#   ./scripts/deploy.sh              # git pull + pull the CI-built image + redeploy
#   ./scripts/deploy.sh --no-pull    # skip git pull, deploy from the working tree as-is
#   ./scripts/deploy.sh --branch foo # pull a specific branch instead of the current one
#   ./scripts/deploy.sh --build      # build the image locally instead of pulling it from
#                                     # the registry (slow on a bandwidth-constrained server;
#                                     # mainly useful for local dev or testing an unpushed branch)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SERVICE="reactive_resume"
DO_PULL=true
DO_BUILD=false
BRANCH=""

while [[ $# -gt 0 ]]; do
	case "$1" in
	--no-pull)
		DO_PULL=false
		shift
		;;
	--build)
		DO_BUILD=true
		shift
		;;
	--branch)
		BRANCH="${2:?--branch requires a value}"
		shift 2
		;;
	-h | --help)
		grep -E '^#( |$)' "$0" | sed -E 's/^# ?//'
		exit 0
		;;
	*)
		echo "Unknown argument: $1" >&2
		exit 1
		;;
	esac
done

log() { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }
die() {
	printf '\n\033[1;31m✖ %s\033[0m\n' "$1" >&2
	exit 1
}

command -v docker >/dev/null 2>&1 || die "docker is not installed or not on PATH."
docker compose version >/dev/null 2>&1 || die "docker compose (v2 plugin) is required."

if [[ ! -f .env && ! -f .env.example ]]; then
	die "No .env or .env.example found -- copy .env.example to .env and fill in real secrets first."
fi
if [[ ! -f .env ]]; then
	echo "⚠ No .env file found -- deploying with only the placeholder values from .env.example." >&2
	echo "  Real secrets (AUTH_SECRET, CINETPAY_*, etc.) belong in a gitignored .env file, layered on top." >&2
fi

if [[ "$DO_PULL" == true ]]; then
	log "Checking working tree"
	if [[ -n "$(git status --porcelain)" ]]; then
		die "Working tree has uncommitted changes -- commit, stash, or pass --no-pull before deploying."
	fi

	CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
	TARGET_BRANCH="${BRANCH:-$CURRENT_BRANCH}"

	log "Pulling latest '$TARGET_BRANCH'"
	git fetch origin "$TARGET_BRANCH"
	git checkout "$TARGET_BRANCH"
	git pull --ff-only origin "$TARGET_BRANCH"
else
	log "Skipping git pull (--no-pull); deploying the working tree as-is"
fi

if [[ "$DO_BUILD" == true ]]; then
	log "Building the $SERVICE image locally"
	docker compose build "$SERVICE"
else
	log "Pulling the $SERVICE image built by CI"
	docker compose pull "$SERVICE"
fi

log "Recreating the $SERVICE container"
docker compose up -d "$SERVICE"

log "Waiting for $SERVICE to report healthy"
CONTAINER_ID="$(docker compose ps -q "$SERVICE")"
[[ -n "$CONTAINER_ID" ]] || die "Could not find the $SERVICE container after 'docker compose up -d'."

# The container's own healthcheck only starts probing after its `start_period` (10s) and
# probes every `interval` (30s) thereafter, so this budget must comfortably clear a couple of
# those intervals -- 60 attempts * 2s = 120s.
ATTEMPTS=60
for ((i = 1; i <= ATTEMPTS; i++)); do
	STATUS="$(docker inspect "$CONTAINER_ID" --format '{{.State.Health.Status}}' 2>/dev/null || echo "unknown")"
	if [[ "$STATUS" == "healthy" ]]; then
		log "$SERVICE is healthy"
		break
	fi
	if [[ "$STATUS" == "unhealthy" ]]; then
		docker compose logs --tail 50 "$SERVICE" >&2
		die "$SERVICE reported unhealthy -- see logs above."
	fi
	if [[ "$i" == "$ATTEMPTS" ]]; then
		docker compose logs --tail 50 "$SERVICE" >&2
		die "$SERVICE did not become healthy within $((ATTEMPTS * 2))s -- see logs above."
	fi
	sleep 2
done

log "Cleaning up dangling images"
docker image prune -f >/dev/null

log "Deploy complete"
docker compose ps "$SERVICE"
