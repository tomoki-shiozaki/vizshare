## 🧱 Development Environment Setup (Docker)

This project uses **Docker Compose** for local development.

To ensure that files created inside containers are owned by the host user,
you need to create a `.env` file **before building the containers**.
This file defines the UID and GID of your host user.

### 1. Create the `.env` file

In the project root directory (the same directory as `docker-compose.yml`), run the following commands:

```bash
echo "UID=$(id -u)" > .env
echo "GID=$(id -g)" >> .env
```

This allows the container user to match your host user and helps prevent file permission issues
when mounting volumes.
