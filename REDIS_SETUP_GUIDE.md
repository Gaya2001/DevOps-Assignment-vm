# Redis Setup Guide for GCP VM (Minimum Resources)

## Overview
This guide will help you set up Redis on a Google Cloud Platform VM with minimal resources for the GeoView application.

## Table of Contents
1. [GCP VM Creation](#1-gcp-vm-creation)
2. [Redis Installation](#2-redis-installation)
3. [Redis Configuration](#3-redis-configuration)
4. [Security Setup](#4-security-setup)
5. [Performance Tuning](#5-performance-tuning)
6. [Monitoring & Testing](#6-monitoring--testing)
7. [Spring Boot Integration](#7-spring-boot-integration)

---

## 1. GCP VM Creation

### Minimum Specifications
- **Machine Type**: e2-micro (0.25-1 vCPU, 1 GB memory)
- **OS**: Ubuntu 22.04 LTS
- **Boot Disk**: 10 GB Standard persistent disk
- **Region**: Choose closest to your users (e.g., us-central1)

### Create VM using gcloud CLI
```bash
gcloud compute instances create redis-server \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --boot-disk-type=pd-standard \
  --tags=redis-server \
  --metadata=startup-script='#!/bin/bash
    apt-get update
    apt-get install -y redis-server
  '
```

### Or Create via Console
1. Go to Compute Engine > VM Instances
2. Click "Create Instance"
3. Configure:
   - Name: `redis-server`
   - Region: Your preferred region
   - Machine type: e2-micro
   - Boot disk: Ubuntu 22.04 LTS, 10GB
4. Click "Create"

---

## 2. Redis Installation

### Connect to VM
```bash
gcloud compute ssh redis-server --zone=us-central1-a
```

### Install Redis
```bash
# Update package list
sudo apt update

# Install Redis
sudo apt install redis-server -y

# Check Redis version
redis-server --version
```

### Verify Installation
```bash
# Check Redis service status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping
# Should return: PONG
```

---

## 3. Redis Configuration

### Edit Redis Configuration
```bash
# Backup original config
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Edit configuration
sudo nano /etc/redis/redis.conf
```

### Essential Configuration Changes

#### 1. Bind to Internal IP
```conf
# Find and modify the bind directive
# Replace 127.0.0.1 with your VM's internal IP
bind 127.0.0.1 10.128.0.43

# Or bind to all interfaces (less secure, use with firewall rules)
bind 0.0.0.0
```

#### 2. Protected Mode
```conf
# Disable protected mode (only if using password)
protected-mode no
```

#### 3. Password Authentication (RECOMMENDED)
```conf
# Uncomment and set a strong password
requirepass YourStrongPasswordHere123!
```

#### 4. Memory Management (Critical for e2-micro)
```conf
# Set maximum memory (leave ~300MB for OS)
maxmemory 700mb

# Set eviction policy
maxmemory-policy allkeys-lru
```

#### 5. Performance Settings
```conf
# Save to disk less frequently (reduce I/O)
save 900 1
save 300 10
save 60 10000

# Disable RDB persistence if not needed (saves disk I/O)
# save ""

# Enable AOF for better persistence (optional)
appendonly no

# Limit database size
databases 4

# Disable slow operations
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

#### 6. Network Settings
```conf
# Increase timeout
timeout 300

# Keep TCP alive
tcp-keepalive 60

# Limit max clients
maxclients 100
```

### Apply Configuration
```bash
# Restart Redis
sudo systemctl restart redis-server

# Enable Redis on boot
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server
```

---

## 4. Security Setup

### Set Firewall Rules

#### Create Firewall Rule in GCP
```bash
# Allow Redis access from your backend server only
gcloud compute firewall-rules create allow-redis \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:6379 \
  --source-tags=backend-server \
  --target-tags=redis-server

# Or allow from specific IP (replace with your backend server IP)
gcloud compute firewall-rules create allow-redis-ip \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:6379 \
  --source-ranges=10.128.0.42/32 \
  --target-tags=redis-server
```

#### UFW Firewall on VM
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow Redis only from backend server
sudo ufw allow from 10.128.0.42 to any port 6379

# Check rules
sudo ufw status
```

### Test Connection
```bash
# From Redis VM
redis-cli -h 10.128.0.43 -p 6379 -a YourPassword ping

# From backend VM
redis-cli -h 10.128.0.43 -p 6379 -a YourPassword ping
```

---

## 5. Performance Tuning

### Linux System Tuning
```bash
# Edit sysctl configuration
sudo nano /etc/sysctl.conf
```

Add these lines:
```conf
# Increase max connections
net.core.somaxconn = 512

# Disable transparent huge pages
vm.overcommit_memory = 1
```

Apply changes:
```bash
sudo sysctl -p
```

### Disable Transparent Huge Pages
```bash
# Create systemd service
sudo nano /etc/systemd/system/disable-thp.service
```

Add content:
```ini
[Unit]
Description=Disable Transparent Huge Pages (THP)
After=sysinit.target local-fs.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/enabled'
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/defrag'

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable disable-thp.service
sudo systemctl start disable-thp.service
```

---

## 6. Monitoring & Testing

### Monitor Redis
```bash
# Monitor in real-time
redis-cli -h 10.128.0.43 -a YourPassword monitor

# Get server info
redis-cli -h 10.128.0.43 -a YourPassword info

# Check memory usage
redis-cli -h 10.128.0.43 -a YourPassword info memory

# Check stats
redis-cli -h 10.128.0.43 -a YourPassword info stats

# List all keys
redis-cli -h 10.128.0.43 -a YourPassword keys "*"

# Monitor slow queries
redis-cli -h 10.128.0.43 -a YourPassword slowlog get 10
```

### Performance Testing
```bash
# Install redis-tools
sudo apt install redis-tools -y

# Benchmark
redis-benchmark -h 10.128.0.43 -p 6379 -a YourPassword -q -n 10000
```

### Create Monitoring Script
```bash
# Create monitoring script
cat > ~/redis-monitor.sh << 'EOF'
#!/bin/bash
REDIS_HOST="10.128.0.43"
REDIS_PASSWORD="YourPassword"

echo "=== Redis Status ==="
redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD info server | grep redis_version
redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD info memory | grep used_memory_human
redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD info stats | grep total_connections_received
redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD info keyspace
redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD dbsize
EOF

chmod +x ~/redis-monitor.sh
./redis-monitor.sh
```

---

## 7. Spring Boot Integration

### Update application.properties
```properties
# Redis Configuration
spring.data.redis.host=10.128.0.43
spring.data.redis.port=6379
spring.data.redis.password=YourPassword
spring.data.redis.timeout=60000
spring.data.redis.jedis.pool.max-active=8
spring.data.redis.jedis.pool.max-idle=8
spring.data.redis.jedis.pool.min-idle=0
spring.data.redis.jedis.pool.max-wait=-1ms

# Cache Configuration
spring.cache.type=redis
spring.cache.redis.time-to-live=600000
spring.cache.redis.cache-null-values=false
```

### Test from Spring Boot Application
```bash
# Check if backend can connect to Redis
# From your backend VM
redis-cli -h 10.128.0.43 -p 6379 -a YourPassword ping
```

---

## Cost Optimization Tips

### 1. Use Preemptible VM (Save up to 80%)
```bash
gcloud compute instances create redis-server \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --preemptible \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB
```

**Note**: Preemptible VMs can be terminated by Google after 24 hours. Set up automatic restart or use Spot VMs for production.

### 2. Resource Monitoring
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check Redis memory
redis-cli -h 10.128.0.43 -a YourPassword info memory | grep used_memory_human
```

### 3. Adjust Memory Limits
If experiencing OOM (Out of Memory):
```bash
# In redis.conf, reduce maxmemory
maxmemory 500mb

# Restart Redis
sudo systemctl restart redis-server
```

---

## Troubleshooting

### Issue: Can't connect to Redis
```bash
# Check if Redis is running
sudo systemctl status redis-server

# Check if Redis is listening
sudo netstat -tlnp | grep 6379

# Check firewall
sudo ufw status

# Check logs
sudo tail -f /var/log/redis/redis-server.log
```

### Issue: Out of Memory
```bash
# Check memory
redis-cli -h 10.128.0.43 -a YourPassword info memory

# Clear all data (if safe)
redis-cli -h 10.128.0.43 -a YourPassword FLUSHALL

# Reduce TTL or maxmemory in config
```

### Issue: Connection timeout
```bash
# Increase timeout in redis.conf
timeout 300

# Check network connectivity
ping 10.128.0.43
telnet 10.128.0.43 6379
```

---

## Maintenance

### Backup Redis Data
```bash
# Manual backup
redis-cli -h 10.128.0.43 -a YourPassword SAVE

# Copy RDB file
sudo cp /var/lib/redis/dump.rdb ~/redis-backup-$(date +%Y%m%d).rdb
```

### Update Redis
```bash
sudo apt update
sudo apt upgrade redis-server -y
sudo systemctl restart redis-server
```

---

## Quick Reference

### Redis CLI Commands
```bash
# Connect
redis-cli -h 10.128.0.43 -p 6379 -a YourPassword

# Test connection
PING

# Get all keys
KEYS *

# Get key value
GET key_name

# Delete key
DEL key_name

# Clear database
FLUSHDB

# Server info
INFO

# Monitor commands
MONITOR
```

### Service Management
```bash
# Start Redis
sudo systemctl start redis-server

# Stop Redis
sudo systemctl stop redis-server

# Restart Redis
sudo systemctl restart redis-server

# Status
sudo systemctl status redis-server

# Enable on boot
sudo systemctl enable redis-server
```

---

## Estimated Costs

### Monthly Cost (e2-micro in us-central1)
- **Compute**: ~$6.11/month
- **Disk (10GB)**: ~$0.40/month
- **Network**: ~$0.12/GB (first 1GB free)

**Total**: ~$6.50-$8.00/month

### Cost Saving Options
- Use **Spot/Preemptible VM**: ~$1.22/month (80% savings)
- Use **Committed Use Discount**: 30-57% savings
- Use **E2-small** if you need more resources: ~$12.20/month

---

## Next Steps

1. ✅ Create GCP VM
2. ✅ Install Redis
3. ✅ Configure Redis
4. ✅ Set up security
5. ✅ Update Spring Boot application
6. ✅ Test connection
7. ✅ Monitor performance
8. ✅ Set up backups

Your Redis cache is now ready for production use!
