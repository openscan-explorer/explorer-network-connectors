#!/bin/bash

# Exit on error
set -e

echo "Publishing and tagging release"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "You must be on the main branch to publish!"
  echo "Current branch: $CURRENT_BRANCH"
  exit 1
fi

# Get the version from package.json
VERSION=$(node -p "require('./package.json').version")

echo " Version: $VERSION"

# Check if tag already exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
  echo "Tag v$VERSION already exists!"
  exit 1
fi

# Ensure we're on a clean working directory
if [[ -n $(git status -s) ]]; then
  echo "Working directory is not clean. Please commit or stash your changes."
  exit 1
fi

# Run checks
npm run check

npm run typecheck

# Build the project
npm run build

# Publish to npm
npm publish

# Create git tag
echo "Creating git tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION"

# Push tag to remote
echo "Pushing tag to remote..."
git push origin "v$VERSION"

echo "Successfully published v$VERSION and created tag!"
