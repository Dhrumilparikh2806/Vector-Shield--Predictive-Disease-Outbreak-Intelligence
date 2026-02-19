# Docker Deployment Guide for VectorShield

## Prerequisites
- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- Docker Compose
- No conflicts on ports 8000 (backend) and 3000 (frontend)

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Individual Docker Commands

### Build Images

```bash
# Build backend image
docker build -t vectorshield-backend:latest -f backend/Dockerfile .

# Build frontend image
docker build -t vectorshield-frontend:latest -f frontend/Dockerfile .
```

### Run Services Individually

```bash
# Run backend
docker run -p 8000:8000 --name vectorshield-backend vectorshield-backend:latest

# Run frontend
docker run -p 3000:3000 --name vectorshield-frontend vectorshield-frontend:latest
```

## Docker Images

### Backend Image
- **Base**: `python:3.11-slim`
- **Port**: 8000
- **Size**: ~500MB (optimized)
- **Health Check**: Enabled
- **Features**:
  - FastAPI with Uvicorn
  - ML models and data loaders
  - Database support

### Frontend Image
- **Base**: `node:18-alpine` (build) → `node:18-alpine` (production)
- **Port**: 3000
- **Size**: ~150MB (multi-stage build)
- **Server**: Node serve
- **Health Check**: Enabled
- **Features**:
  - React + Vite
  - Production-optimized build
  - Static file serving

## Networking

- Services communicate via internal Docker network: `vectorshield-network`
- Backend accessible to frontend at: `http://backend:8000`
- Frontend accessible at: `http://localhost:3000`

## Environment Variables

Create `.env` file in project root:

```bash
# Backend
ENVIRONMENT=production
PYTHONUNBUFFERED=1
DATABASE_URL=sqlite:///./vectorshield.db

# Frontend
REACT_APP_API_URL=http://localhost:8000/api/v1
```

Then use in docker-compose:
```yaml
env_file:
  - .env
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :8000
# or on Linux/Mac
lsof -i :8000

# Kill process
taskkill /PID <PID> /F
```

### Clear Docker Cache
```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

### View Container Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker logs <container_id> -f
```

### Rebuild Without Cache
```bash
docker-compose build --no-cache
```

## Production Deployment

### Using Docker with Vercel

1. Create `vercel.json` with Docker configuration:
```json
{
  "version": 2,
  "buildCommand": "docker-compose build",
  "outputDirectory": "frontend/dist"
}
```

2. Push to GitHub with Docker files

3. On Vercel:
   - Use Docker runtime
   - Configure environment variables
   - Deploy

### Using Docker with Other Platforms

- **AWS ECS**: Push images to ECR, use docker-compose
- **Google Cloud Run**: Use backend image for API
- **DigitalOcean App Platform**: Deploy from Docker Hub
- **Docker Swarm**: Use docker-compose for orchestration

## Best Practices

1. **Always use specific version tags** (not `latest`)
2. **Use `.dockerignore`** to exclude unnecessary files
3. **Multi-stage builds** for frontend to reduce image size
4. **Health checks** for automatic restart on failure
5. **Volumes** for development, read-only for production
6. **Use Docker Compose** for local development
7. **Set resource limits** in production

## Examples

### Development with Volume Mounts
```bash
docker-compose -f docker-compose.dev.yml up
```

Create `docker-compose.dev.yml`:
```yaml
version: '3.8'
services:
  backend:
    volumes:
      - ./backend:/app
      - /app/__pycache__
  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

### Production with Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

## Useful Docker Commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View image details
docker inspect <image_id>

# Execute command in container
docker exec -it vectorshield-backend /bin/bash

# Copy file from container
docker cp vectorshield-backend:/app/file.txt ./

# Push to Docker Hub
docker tag vectorshield-backend:latest yourusername/vectorshield-backend:latest
docker push yourusername/vectorshield-backend:latest
```

## Monitoring

```bash
# Real-time stats
docker stats

# View container processes
docker top vectorshield-backend

# Inspect container
docker inspect vectorshield-backend
```

## Next Steps

1. Test locally with `docker-compose up -d`
2. Check both services are healthy
3. Access http://localhost:3000
4. Deploy to production platform of choice
