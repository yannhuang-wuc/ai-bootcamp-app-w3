# Deployment Guide - AWS EC2 with GitHub Actions

This guide explains the GitHub Actions workflow for deploying the Todo App to AWS EC2 using Docker.

## 📋 Workflow Overview

The deployment workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) automates the entire deployment process:

1. **Triggers**: Runs automatically on push to `main` branch, or manually via GitHub UI
2. **Build**: Creates a Docker image with your application
3. **Push**: Uploads the image to Docker Hub
4. **Deploy**: SSH into EC2 and runs the new container

---

## 🔧 Step-by-Step Explanation

### **Step 1: Checkout code**
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```
- **What it does**: Downloads your repository code to the GitHub Actions runner
- **Why needed**: GitHub Actions needs your code to build the Docker image

---

### **Step 2: Set up Docker Buildx**
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```
- **What it does**: Installs Docker Buildx, an advanced Docker build tool
- **Benefits**:
  - Enables build caching (faster subsequent builds)
  - Supports multi-platform builds
  - Better build performance

---

### **Step 3: Log in to Docker Hub**
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```
- **What it does**: Authenticates with Docker Hub using your credentials
- **Why needed**: Required to push images to your Docker Hub account
- **Required secrets**: `DOCKER_USERNAME`, `DOCKER_PASSWORD`

---

### **Step 4: Extract Docker metadata**
```yaml
- name: Extract Docker metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ${{ secrets.DOCKER_USERNAME }}/todo-app
    tags: |
      type=ref,event=branch
      type=sha,prefix={{branch}}-
      type=raw,value=latest,enable={{is_default_branch}}
```
- **What it does**: Generates Docker image tags and labels automatically
- **Tags created**:
  - `main` - branch name
  - `main-abc1234` - branch + git commit SHA
  - `latest` - only for main branch
- **Why useful**: Helps track which version is deployed

---

### **Step 5: Build and push Docker image**
```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```
- **What it does**: Builds your Docker image and pushes it to Docker Hub
- **Key features**:
  - Uses GitHub Actions cache for faster builds
  - Applies tags from Step 4
  - Pushes automatically after successful build
- **Build includes**:
  - Next.js app with standalone output
  - Prisma client generation
  - All dependencies

---

### **Step 6: Deploy to EC2**
```yaml
- name: Deploy to EC2
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.EC2_HOST }}
    username: ${{ secrets.EC2_USERNAME }}
    key: ${{ secrets.EC2_SSH_KEY }}
    port: ${{ secrets.EC2_SSH_PORT || 22 }}
    script: |
      # Commands executed on EC2...
```
- **What it does**: Connects to your EC2 instance via SSH and runs deployment commands
- **Required secrets**: `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY`, `EC2_SSH_PORT`

**Deployment script breakdown**:

1. **Navigate to app directory**
   ```bash
   cd /home/${{ secrets.EC2_USERNAME }}/todo-app || mkdir -p /home/${{ secrets.EC2_USERNAME }}/todo-app && cd /home/${{ secrets.EC2_USERNAME }}/todo-app
   ```
   - Creates directory if it doesn't exist
   - Changes into application directory

2. **Pull latest Docker image**
   ```bash
   docker pull ${{ secrets.DOCKER_USERNAME }}/todo-app:latest
   ```
   - Downloads the newly built image from Docker Hub

3. **Stop and remove old container**
   ```bash
   docker stop todo-app || true
   docker rm todo-app || true
   ```
   - Gracefully stops the running container
   - Removes the old container
   - `|| true` prevents errors if container doesn't exist

4. **Run new container**
   ```bash
   docker run -d \
     --name todo-app \
     --restart unless-stopped \
     -p 3000:3000 \
     -e DATABASE_URL="${{ secrets.DATABASE_URL }}" \
     -e BETTER_AUTH_SECRET="${{ secrets.BETTER_AUTH_SECRET }}" \
     -e BETTER_AUTH_URL="${{ secrets.BETTER_AUTH_URL }}" \
     -e GOOGLE_CLIENT_ID="${{ secrets.GOOGLE_CLIENT_ID }}" \
     -e GOOGLE_CLIENT_SECRET="${{ secrets.GOOGLE_CLIENT_SECRET }}" \
     ${{ secrets.DOCKER_USERNAME }}/todo-app:latest
   ```
   - `-d`: Runs in detached mode (background)
   - `--name todo-app`: Names the container for easy reference
   - `--restart unless-stopped`: Auto-restarts on failure or server reboot
   - `-p 3000:3000`: Maps port 3000 from container to host
   - `-e`: Passes environment variables to the container

5. **Clean up old images**
   ```bash
   docker image prune -af
   ```
   - Removes unused Docker images to free disk space
   - Keeps your EC2 instance clean

6. **Show running containers**
   ```bash
   docker ps
   ```
   - Displays running containers for verification

---

### **Step 7: Deployment notification**
```yaml
- name: Deployment notification
  if: success()
  run: |
    echo "✅ Deployment successful!"
```
- **What it does**: Shows success message in GitHub Actions logs
- **Only runs**: If all previous steps succeeded

---

## 🔐 Required GitHub Secrets

You must configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### Docker Hub Credentials
| Secret Name | Description | Example |
|------------|-------------|---------|
| `DOCKER_USERNAME` | Your Docker Hub username | `johndoe` |
| `DOCKER_PASSWORD` | Docker Hub password or access token | `dckr_pat_abc123...` |

**💡 Tip**: Use a Docker Hub Access Token instead of password for better security.

---

### AWS EC2 Connection
| Secret Name | Description | Example |
|------------|-------------|---------|
| `EC2_HOST` | Public IP or domain of EC2 instance | `3.25.123.45` or `todo.example.com` |
| `EC2_USERNAME` | SSH username on EC2 | `ec2-user` or `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key (entire content) | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `EC2_SSH_PORT` | SSH port (optional, defaults to 22) | `22` |

**💡 Tip**: Copy entire SSH private key including BEGIN/END lines.

---

### Application Environment Variables
| Secret Name | Description | Example |
|------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth | Random 32+ character string |
| `BETTER_AUTH_URL` | Public URL of your app | `https://todo.example.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-abc123...` |

---

## 🚀 EC2 Setup Requirements

Your EC2 instance must have:

1. **Docker installed**
   ```bash
   # For Amazon Linux 2
   sudo yum update -y
   sudo yum install docker -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ec2-user
   ```

2. **Port 3000 open** in Security Group
   - Add inbound rule: `Custom TCP | Port 3000 | Source: 0.0.0.0/0`

3. **SSH access configured**
   - Security group allows port 22 from GitHub Actions IPs
   - SSH key pair set up

---

## 📝 How to Deploy

### Automatic Deployment
1. Push code to `main` branch
2. GitHub Actions automatically runs the workflow
3. Monitor progress in **Actions** tab on GitHub
4. Access your app at `http://YOUR_EC2_IP:3000`

### Manual Deployment
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Deploy to AWS EC2** workflow
4. Click **Run workflow** → **Run workflow**

---

## 🔍 Monitoring & Troubleshooting

### View Deployment Logs
- GitHub: **Actions** tab → Click on workflow run
- EC2: SSH into instance and run:
  ```bash
  docker logs todo-app
  docker logs -f todo-app  # Follow logs in real-time
  ```

### Check Running Containers
```bash
docker ps
docker ps -a  # Include stopped containers
```

### Restart Container
```bash
docker restart todo-app
```

### View Container Environment
```bash
docker exec todo-app env
```

### Access Container Shell
```bash
docker exec -it todo-app sh
```

---

## 🎯 Deployment Flow Diagram

```
┌─────────────┐
│  Git Push   │
│  to main    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   GitHub Actions Starts     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Build Docker Image        │
│   (includes Prisma)         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Push to Docker Hub        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   SSH into EC2              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Pull Latest Image         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Stop Old Container        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Start New Container       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   ✅ Deployment Complete    │
└─────────────────────────────┘
```

---

## 🔒 Security Best Practices

1. **Use Docker Hub Access Tokens** instead of passwords
2. **Rotate SSH keys** regularly
3. **Limit EC2 Security Group** access to necessary IPs only
4. **Use environment variables** for all sensitive data (never hardcode)
5. **Enable CloudWatch** logs for EC2 monitoring
6. **Set up alerts** for failed deployments

---

## 📚 Additional Resources

- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS EC2 Docker Setup](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html)

---

## ❓ Common Issues

### Issue: Docker image not found
**Solution**: Check Docker Hub credentials and image name in workflow

### Issue: SSH connection failed
**Solution**: Verify EC2 security group allows SSH from GitHub Actions, check SSH key format

### Issue: Container exits immediately
**Solution**: Check container logs with `docker logs todo-app`, verify environment variables

### Issue: Port already in use
**Solution**: Stop old container with `docker stop todo-app && docker rm todo-app`

---

**Happy Deploying! 🚀**
