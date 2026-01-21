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

# ─────────────────────────────────────────────────────────────────────────────────────────────────────────
# -----------------------------------------FOR DOCKER ----------------------------------------------------- 
# ─────────────────────────────────────────────────────────────────────────────────────────────────────────
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

# ─────────────────────────────────────────────────────────────────────────────────────────────────────────
# -----------------------------------------FOR BLOCKCHAIN-------------------------------------------------- 
# ─────────────────────────────────────────────────────────────────────────────────────────────────────────

# Go to fabric-samples test-network (adjust path if different)
cd ~/NEHU/fabric-samples/test-network

# Clean up any previous network
sudo ./network.sh down


# ────────────────────────────────────────────────────────────────
# CREATING THE CHANNEL
# MAKE SURE DOCKER IS IN 28 OR A VERSION LOWER THAN THE LATEST
# ────────────────────────────────────────────────────────────────

sudo ./network.sh down 
sudo ./network.sh up createChannel -c mychannel -ca 
sudo ./network.sh deployCC -ccn traceability -ccp "../../TraceFlow/fabric-network/chaincode/node" -ccl javascript

# ───────────────
# EXPORTING
# ───────────────

export PATH=${PWD}/../bin:$PATH 
export FABRIC_CFG_PATH=$PWD/../config/ 
export CORE_PEER_TLS_ENABLED=true 
export CORE_PEER_LOCALMSPID="Org1MSP" 
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt 
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp 
export CORE_PEER_ADDRESS=localhost:7051

# ────────────
# IMPORTANT
# ────────────
sudo chown -R $USER:$USER organizations/
sudo chmod -R 755 organizations/

# ───────────────
# INVOKING
# ───────────────

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n traceability --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"initLedger","Args":[]}'

# ────────────────────
# Start the network
# ────────────────────
sudo ./network.sh up

# ────────────────────────────────────────────────────────────
# -----------------------RUNNING THE SERVER-------------------
# ────────────────────────────────────────────────────────────
cd server-api
node server.js

# ────────────────────────────────────────────────────────────
# -----------------------RUNNING CLIENT UI--------------------
# ────────────────────────────────────────────────────────────
cd client ui (in NEHU)

npm install --save-dev cross-env (FOR LINUX AND MAC)
npm run start 

# ───────────────────────────────
# FOR ADMIN AND OTHER PRODUCTS
# ───────────────────────────────

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n traceability --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"getProductAsset","Args":["product1"]}' 

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n traceability --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"createProductAsset","Args":["product1", "Organic Lakadong Turmeric", "Megha-Farmers-Coop"]}' 

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n traceability --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"getProductAsset","Args":["product1"]}' 

sudo chown -R $USER:$USER /home/jaden-d-syiem/NEHU/fabric-samples/test-network/channel-artifacts/

peer channel fetch config /home/jaden-d-syiem/NEHU/fabric-samples/test-network/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c mychannel --tls --cafile /home/jaden-d-syiem/NEHU/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem



