# Docker Build & Push Guide

## Prerequisites

1. **Start Docker Desktop**
   - Make sure Docker Desktop is running before building

2. **Docker Hub Login**
   ```bash
   docker login
   # Username: satishkvk
   # Password: [your Docker Hub password]
   ```

## Quick Build & Push

### Option 1: Using the Build Script (Recommended)
```bash
./build-and-push.sh
```

This will:
- Extract version from package.json (currently: 0.1.0)
- Build for AMD64 platform
- Tag with version and latest
- Prompt to push to Docker Hub

### Option 2: With Custom Version
```bash
./build-and-push.sh 1.0.0
```

### Option 3: Manual Commands

#### Build the image:
```bash
docker buildx build \
  --platform linux/amd64 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VERSION=0.1.0 \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  -t satishkvk/spectrity-frontend:0.1.0 \
  -t satishkvk/spectrity-frontend:latest \
  --load \
  .
```

#### Push to Docker Hub:
```bash
docker push satishkvk/spectrity-frontend:0.1.0
docker push satishkvk/spectrity-frontend:latest
```

## Test Locally

### Run the built image:
```bash
docker run -p 3000:3000 satishkvk/spectrity-frontend:latest
```

### With environment variables:
```bash
docker run -p 3000:3000 --env-file .env satishkvk/spectrity-frontend:latest
```

### Check health:
```bash
docker ps  # Check if container is healthy
curl http://localhost:3000  # Test the endpoint
```

## Image Details

- **Image Name**: satishkvk/spectrity-frontend
- **Platform**: linux/amd64
- **Base Image**: node:20-alpine
- **Port**: 3000
- **Health Check**: Enabled (checks every 30s)

## Versioning Strategy

Version is automatically pulled from `package.json`:
```json
{
  "version": "0.1.0"
}
```

Each build creates two tags:
1. `satishkvk/spectrity-frontend:0.1.0` (version-specific)
2. `satishkvk/spectrity-frontend:latest` (always latest build)

## Update Version

To update the version, modify `package.json`:
```bash
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

Then rebuild and push.

## Troubleshooting

### Docker not running
```bash
# macOS: Open Docker Desktop application
open -a Docker

# Or check status
docker info
```

### Build fails with "no space left"
```bash
# Clean up unused images
docker system prune -a

# Or remove specific images
docker rmi $(docker images -q -f dangling=true)
```

### Authentication error
```bash
# Re-login to Docker Hub
docker logout
docker login
```

## Pull & Deploy

After pushing, anyone can pull and run:
```bash
docker pull satishkvk/spectrity-frontend:latest
docker run -d -p 3000:3000 --name spectrity-app satishkvk/spectrity-frontend:latest
```

## CI/CD Integration

For GitHub Actions, add this workflow:
```yaml
- name: Build and Push Docker
  run: |
    echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u satishkvk --password-stdin
    ./build-and-push.sh
```

## Next Steps

1. Start Docker Desktop
2. Run: `./build-and-push.sh`
3. Type 'y' when prompted to push
4. Image will be available at: https://hub.docker.com/r/satishkvk/spectrity-frontend
