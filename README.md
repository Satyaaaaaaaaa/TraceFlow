# Fabric Test Network Setup Guide

This guide walks you through **completely resetting Docker**, installing a fresh Docker + Docker Compose (plugin), and then starting a Hyperledger Fabric test network.

**⚠️ Warning**  
The steps below **completely remove** all existing Docker containers, images, volumes, and configurations. Use with caution on a development machine only.

## Prerequisites

- Ubuntu (tested on 20.04 / 22.04)
- `sudo` privileges
- Internet connection

## 1. Complete Docker Cleanup (Nuclear Option)

```bash
# Stop all running containers (if any)
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true

# Remove all Docker-related packages
sudo apt-get purge -y \
  docker-engine docker docker.io docker-ce docker-ce-cli \
  containerd.io docker-buildx-plugin docker-compose-plugin

sudo apt-get autoremove -y --purge

# Remove old standalone docker-compose binary (if exists)
sudo rm -f /usr/local/bin/docker-compose /usr/bin/docker-compose

# Remove Docker data and config directories
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
sudo rm -rf /etc/docker
sudo rm -rf ~/.docker

# Update package index
sudo apt-get update

# Install required packages
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Create keyrings directory and add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt-get update

# Install Docker Engine + Compose plugin
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Should show Docker version
docker --version

# Should show Docker Compose plugin version (v2.x)
docker compose version

# Quick test
sudo docker run --rm hello-world

# Stop services
sudo systemctl stop docker
sudo systemctl stop containerd

# Clear corrupted containerd data (common after unclean shutdowns)
sudo rm -rf /var/lib/containerd

# Start services again
sudo systemctl start containerd
sudo systemctl start docker

# Check status
sudo systemctl status docker --no-pager
sudo systemctl status containerd --no-pager

# Final test
sudo docker run --rm hello-world

# Go to fabric-samples test-network (adjust path if different)
cd ~/NEHU/Temp/fabric-samples/test-network

# Clean up any previous network
sudo ./network.sh down

# Start the network
sudo ./network.sh up

# ────────────────────────────────────────────────
# Optional: Create a channel (after network is up)
# ────────────────────────────────────────────────

# If you want to (re)create channel:
sudo ./network.sh down   # only if you want to start completely fresh
sudo ./network.sh up createChannel

cd ~/NEHU/Temp/fabric-samples/test-network
sudo ./network.sh down
sudo ./network.sh up
# or with channel:
# sudo ./network.sh up createChannel

# ─────────────────────────────────────
# If you see permission errors later
# ─────────────────────────────────────
sudo usermod -aG docker $USER
newgrp docker

# ─────────────────────────────────────
# CREATING THE CHANNEL
# MAKE SURE DOCKER IS IN 28 OR A VERSION LOWER THAN THE LATEST
# ─────────────────────────────────────

sudo ./network.sh down 
sudo ./network.sh up createChannel -c mychannel -ca
sudo ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript -ccl javascript 
