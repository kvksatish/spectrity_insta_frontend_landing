#!/bin/bash

# Build and Push Docker Image Script with Auto-Versioning
# Usage:
#   ./build-and-push.sh              # Auto-increment patch version (0.5.4 -> 0.5.5)
#   ./build-and-push.sh minor        # Increment minor version (0.5.4 -> 0.6.0)
#   ./build-and-push.sh major        # Increment major version (0.5.4 -> 1.0.0)
#   ./build-and-push.sh 1.2.3        # Use specific version

set -e

# Configuration
DOCKER_USERNAME="satishkvk"
IMAGE_NAME="spectrity-frontend"
PLATFORM="linux/amd64"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_version() {
    echo -e "${BLUE}[VERSION]${NC} $1"
}

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_version "Current version: $CURRENT_VERSION"

# Determine version bump type or use specific version
if [ -n "$1" ]; then
    case "$1" in
        major|minor|patch)
            # Auto-increment using npm version
            print_info "Incrementing $1 version..."
            npm version "$1" --no-git-tag-version
            VERSION=$(node -p "require('./package.json').version")
            print_version "New version: $VERSION"

            # Commit version bump
            print_info "Committing version bump..."
            git add package.json package-lock.json
            git commit -m "chore: bump version to $VERSION" || print_warning "Nothing to commit"
            ;;
        [0-9]*)
            # Specific version provided
            VERSION="$1"
            print_info "Using specified version: $VERSION"

            # Update package.json with specific version
            npm version "$VERSION" --no-git-tag-version

            # Commit version change
            print_info "Committing version change..."
            git add package.json package-lock.json
            git commit -m "chore: set version to $VERSION" || print_warning "Nothing to commit"
            ;;
        *)
            print_error "Invalid argument: $1"
            print_info "Usage:"
            print_info "  ./build-and-push.sh              # Auto-increment patch"
            print_info "  ./build-and-push.sh patch        # Increment patch (0.5.4 -> 0.5.5)"
            print_info "  ./build-and-push.sh minor        # Increment minor (0.5.4 -> 0.6.0)"
            print_info "  ./build-and-push.sh major        # Increment major (0.5.4 -> 1.0.0)"
            print_info "  ./build-and-push.sh 1.2.3        # Use specific version"
            exit 1
            ;;
    esac
else
    # Default: auto-increment patch version
    print_info "Auto-incrementing patch version..."
    npm version patch --no-git-tag-version
    VERSION=$(node -p "require('./package.json').version")
    print_version "New version: $VERSION"

    # Commit version bump
    print_info "Committing version bump..."
    git add package.json package-lock.json
    git commit -m "chore: bump version to $VERSION" || print_warning "Nothing to commit"
fi

# Generate build timestamp
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Full image names
IMAGE_TAG="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
IMAGE_LATEST="${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

print_info "=========================================="
print_info "Docker Build Configuration"
print_info "=========================================="
print_info "Image Name: ${IMAGE_NAME}"
print_info "Version: ${VERSION}"
print_info "Platform: ${PLATFORM}"
print_info "Git Commit: ${GIT_COMMIT}"
print_info "Build Date: ${BUILD_DATE}"
print_info "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if logged in to Docker Hub
print_info "Checking Docker Hub authentication..."
if ! docker info | grep -q "Username"; then
    print_warning "Not logged in to Docker Hub. Attempting login..."
    docker login
fi

# Build the Docker image
print_info "Building Docker image for ${PLATFORM}..."
docker buildx build \
    --platform "${PLATFORM}" \
    --build-arg BUILD_DATE="${BUILD_DATE}" \
    --build-arg VERSION="${VERSION}" \
    --build-arg GIT_COMMIT="${GIT_COMMIT}" \
    -t "${IMAGE_TAG}" \
    -t "${IMAGE_LATEST}" \
    --load \
    .

if [ $? -eq 0 ]; then
    print_info "✅ Docker image built successfully!"
else
    print_error "❌ Docker build failed!"
    exit 1
fi

# Show image details
print_info "Image details:"
docker images | grep "${IMAGE_NAME}" | head -2

# Ask for confirmation before pushing
echo ""
read -p "Do you want to push the image to Docker Hub? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Push versioned tag
    print_info "Pushing ${IMAGE_TAG}..."
    docker push "${IMAGE_TAG}"

    # Push latest tag
    print_info "Pushing ${IMAGE_LATEST}..."
    docker push "${IMAGE_LATEST}"

    print_info "✅ Images pushed successfully!"
    print_info ""
    print_info "=========================================="
    print_info "Pull commands:"
    print_info "  docker pull ${IMAGE_TAG}"
    print_info "  docker pull ${IMAGE_LATEST}"
    print_info "=========================================="
else
    print_warning "Skipping push to Docker Hub"
fi

# Show how to run the image
print_info ""
print_info "To run the image locally:"
print_info "  docker run -p 3000:3000 --env-file .env ${IMAGE_TAG}"
print_info ""
print_info "To test the image:"
print_info "  docker run -p 3000:3000 ${IMAGE_TAG}"
