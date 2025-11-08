# Redis Manual Setup - Complete A-Z Guide

## Prerequisites
- GCP account with active project
- gcloud CLI installed and configured
- Backend server already running (internal IP: 10.128.0.42)
- Basic knowledge of Linux terminal

---

## PART 1: CREATE REDIS VM ON GCP

### Step 1: Open GCP Console
1. Go to https://console.cloud.google.com
2. Select your project: **DevOps-Assignment-vm**
3. Navigate to **Compute Engine** → **VM Instances**

### Step 2: Create New VM Instance
1. Click **"CREATE INSTANCE"** button
2. Configure the following:

**Basic Configuration:**
- **Name**: `redis-server`
- **Region**: `us-central1` (or same as your backend)
- **Zone**: `us-central1-a` (or same as your backend)

**Machine Configuration:**
- **Series**: E2
- **Machine type**: e2-micro (0.5-1 GB memory, 0.25-1 vCPU)

**Boot Disk:**
- Click **"CHANGE"**
- **Operating System**: Ubuntu
- **Version**: Ubuntu 22.04 LTS
- **Boot disk type**: Standard persistent disk
- **Size**: 10 GB
- Click **"SELECT"**

**Firewall:**
- ☐ Allow HTTP traffic (uncheck)
- ☐ Allow HTTPS traffic (uncheck)

**Advanced Options:**
- Expand **Networking** → **Network tags**
- Add tag: `redis-server`

3. Click **"CREATE"**
4. Wait 1-2 minutes for VM to start

### Step 3: Note the Internal IP
Once VM is created:
1. Find your VM in the list
2. Note the **Internal IP** (e.g., 10.128.0.43)
3. Write it down: `_________________`

---

## PART 2: CONNECT TO REDIS VM

### Step 4: SSH into Redis VM

**Option A: Using GCP Console (Easiest)**
1. In VM instances list, find `redis-server`
2. Click **SSH** button under "Connect" column
3. A new browser window will open with terminal

**Option B: Using gcloud CLI**
```bash
gcloud compute ssh redis-server --zone=us-central1-a
```

You should see a prompt like:
```
username@redis-server:~$
```

---

## PART 3: INSTALL REDIS

### Step 5: Update System Packages
```bash
sudo apt update
```
Wait for package list to update (~30 seconds)

### Step 6: Install Redis Server
```bash
sudo apt install redis-server -y
```
Wait for installation to complete (~1-2 minutes)

### Step 7: Verify Redis Installation
```bash
redis-server --version
```
You should see output like:
```
Redis server v=7.0.x
```

### Step 8: Check Redis Service Status
```bash
sudo systemctl status redis-server
```
Press `q` to exit the status view

You should see:
- `Active: active (running)` in green

---

## PART 4: CONFIGURE REDIS

### Step 9: Backup Original Configuration
```bash
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup
```

### Step 10: Open Redis Configuration File
```bash
sudo nano /etc/redis/redis.conf
```

Now you'll edit the file. Use arrow keys to navigate.

### Step 11: Configure Network Binding

**Find this line** (around line 69):
```
bind 127.0.0.1 -::1
```

**Change it to** (replace with YOUR Redis VM internal IP):
```
bind 0.0.0.0
```
OR more secure:
```
bind 127.0.0.1 10.128.0.43
```

💡 **Tip**: Press `Ctrl+W` to search, type `bind`, press Enter

### Step 12: Disable Protected Mode

**Find this line** (around line 111):
```
protected-mode yes
```

**Change it to**:
```
protected-mode no
```

### Step 13: Set Redis Password (IMPORTANT!)

**Find this line** (around line 1037):
```
# requirepass foobared
```

**Change it to** (remove # and set strong password):
```
requirepass GeoView2024RedisCache!
```

💡 **Write down your password**: `_________________`

### Step 14: Configure Memory Limit

**Find this line** (around line 1328):
```
# maxmemory <bytes>
```

**Change it to**:
```
maxmemory 700mb
```

### Step 15: Set Memory Eviction Policy

**Find this line** (around line 1364):
```
# maxmemory-policy noeviction
```

**Change it to**:
```
maxmemory-policy allkeys-lru
```

### Step 16: Configure Persistence (Optional - for cache, minimal persistence)

**Find these lines** (around line 438-440):
```
save 3600 1 300 100 60 10000
```

**Change to** (less frequent saves):
```
save 900 1
save 300 10
save 60 10000
```

### Step 17: Disable AOF (for cache optimization)

**Find this line** (around line 1332):
```
appendonly no
```

**Make sure it says**:
```
appendonly no
```

### Step 18: Limit Database Count

**Find this line** (around line 241):
```
databases 16
```

**Change to**:
```
databases 4
```

### Step 19: Disable Dangerous Commands (Security)

**Scroll to the bottom of the file**, add these lines:
```
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

### Step 20: Save Configuration File
1. Press `Ctrl+X` to exit
2. Press `Y` to confirm save
3. Press `Enter` to confirm filename

---

## PART 5: SYSTEM TUNING

### Step 21: Configure System Parameters
```bash
sudo nano /etc/sysctl.conf
```

**Scroll to bottom**, add these lines:
```
# Redis optimizations
net.core.somaxconn = 512
vm.overcommit_memory = 1
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

### Step 22: Apply System Changes
```bash
sudo sysctl -p
```

### Step 23: Disable Transparent Huge Pages

**Create service file**:
```bash
sudo nano /etc/systemd/system/disable-thp.service
```

**Paste this content**:
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

Save and exit (`Ctrl+X`, `Y`, `Enter`)

**Enable the service**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable disable-thp.service
sudo systemctl start disable-thp.service
```

---

## PART 6: START REDIS WITH NEW CONFIG

### Step 24: Restart Redis Service
```bash
sudo systemctl restart redis-server
```

### Step 25: Enable Redis on Boot
```bash
sudo systemctl enable redis-server
```

### Step 26: Check Redis Status
```bash
sudo systemctl status redis-server
```

Should show:
- `Active: active (running)` ✅
- No errors

Press `q` to exit

---

## PART 7: TEST REDIS LOCALLY

### Step 27: Test Redis Connection (No Password)
```bash
redis-cli ping
```

Should return:
```
(error) NOAUTH Authentication required.
```
This is CORRECT! Password is working.

### Step 28: Test Redis with Password
```bash
redis-cli -a GeoView2024RedisCache! ping
```

Should return:
```
PONG
```
✅ Success!

### Step 29: Test Basic Operations
```bash
redis-cli -a GeoView2024RedisCache!
```

Now you're in Redis CLI. Try these commands:
```redis
SET test "Hello Redis"
GET test
DEL test
INFO server
DBSIZE
EXIT
```

---

## PART 8: CONFIGURE FIREWALL

### Step 30: Enable UFW Firewall
```bash
sudo ufw --force enable
```

### Step 31: Allow SSH (Important!)
```bash
sudo ufw allow 22/tcp
```

### Step 32: Allow Redis from Backend Server Only

**Replace `10.128.0.42` with YOUR backend server internal IP**:
```bash
sudo ufw allow from 10.128.0.42 to any port 6379
```

### Step 33: Check Firewall Status
```bash
sudo ufw status
```

Should show:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
6379                       ALLOW       10.128.0.42
```

---

## PART 9: CONFIGURE GCP FIREWALL RULE

### Step 34: Exit Redis VM
```bash
exit
```

You're now back in your local terminal.

### Step 35: Create GCP Firewall Rule

**Option A: Using gcloud CLI**
```bash
gcloud compute firewall-rules create allow-redis-from-backend \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:6379 \
  --source-ranges=10.128.0.42/32 \
  --target-tags=redis-server \
  --description="Allow Redis access from backend server only"
```

**Option B: Using GCP Console**
1. Go to **VPC Network** → **Firewall**
2. Click **CREATE FIREWALL RULE**
3. Configure:
   - **Name**: `allow-redis-from-backend`
   - **Direction**: Ingress
   - **Action on match**: Allow
   - **Targets**: Specified target tags
   - **Target tags**: `redis-server`
   - **Source filter**: IPv4 ranges
   - **Source IPv4 ranges**: `10.128.0.42/32`
   - **Protocols and ports**: 
     - ☑ TCP → `6379`
4. Click **CREATE**

---

## PART 10: TEST REDIS FROM BACKEND SERVER

### Step 36: SSH into Backend Server
```bash
gcloud compute ssh backend-server --zone=us-central1-a
```

### Step 37: Install Redis CLI on Backend (if not installed)
```bash
sudo apt update
sudo apt install redis-tools -y
```

### Step 38: Test Redis Connection from Backend

**Replace `10.128.0.43` with YOUR Redis server internal IP**:
```bash
redis-cli -h 10.128.0.43 -p 6379 -a GeoView2024RedisCache! ping
```

Should return:
```
PONG
```
✅ Success! Backend can connect to Redis!

### Step 39: Test Network Connectivity
```bash
telnet 10.128.0.43 6379
```

Press `Ctrl+]` then type `quit` to exit telnet.

### Step 40: Exit Backend Server
```bash
exit
```

---

## PART 11: UPDATE SPRING BOOT APPLICATION

### Step 41: Update application.properties

On your local machine, open:
```
Spring-Boot-Backend/src/main/resources/application.properties
```

**Find the MongoDB section**, add BELOW it:

```properties
# Redis Configuration
spring.data.redis.host=10.128.0.43
spring.data.redis.port=6379
spring.data.redis.password=GeoView2024RedisCache!
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

**Important**: Replace `10.128.0.43` with YOUR Redis VM internal IP!

Save the file.

---

## PART 12: BUILD SPRING BOOT APPLICATION

### Step 42: Open Terminal in Project Directory
```bash
cd "c:\Users\Kavindu gayashan\OneDrive\Desktop\DevOps Vm\DevOps-Assignment-vm\Spring-Boot-Backend"
```

### Step 43: Clean Previous Build
```bash
mvn clean
```

### Step 44: Compile and Check for Errors
```bash
mvn compile
```

Should show:
```
BUILD SUCCESS
```

### Step 45: Run Tests (Optional)
```bash
mvn test
```

### Step 46: Package Application
```bash
mvn package -DskipTests
```

Wait 2-3 minutes for build to complete.

Should show:
```
BUILD SUCCESS
```

### Step 47: Verify JAR File Created
```bash
dir target\geoview-backend-1.0.0.jar
```

You should see the JAR file listed.

---

## PART 13: DEPLOY TO BACKEND SERVER

### Step 48: Copy JAR to Backend Server

**Using gcloud CLI**:
```bash
gcloud compute scp target/geoview-backend-1.0.0.jar backend-server:~/ --zone=us-central1-a
```

Wait for file transfer to complete (~30 seconds)

### Step 49: SSH into Backend Server
```bash
gcloud compute ssh backend-server --zone=us-central1-a
```

### Step 50: Stop Current Application
```bash
sudo systemctl stop geoview-backend
```

### Step 51: Backup Current JAR
```bash
sudo cp /opt/geoview/geoview-backend.jar /opt/geoview/geoview-backend.jar.backup
```

### Step 52: Move New JAR to Application Directory
```bash
sudo mv ~/geoview-backend-1.0.0.jar /opt/geoview/geoview-backend.jar
```

### Step 53: Set Proper Permissions
```bash
sudo chown geoview:geoview /opt/geoview/geoview-backend.jar
sudo chmod 755 /opt/geoview/geoview-backend.jar
```

### Step 54: Start Application
```bash
sudo systemctl start geoview-backend
```

### Step 55: Check Application Status
```bash
sudo systemctl status geoview-backend
```

Should show:
- `Active: active (running)` ✅

Press `q` to exit

---

## PART 14: VERIFY REDIS INTEGRATION

### Step 56: Check Application Logs
```bash
sudo journalctl -u geoview-backend -f
```

Look for:
- ✅ "Jedis connection factory initialized"
- ✅ "Redis connection established"
- ❌ NO errors about Redis connection

Press `Ctrl+C` to stop watching logs

### Step 57: Test Cache Health Endpoint
```bash
curl http://localhost:5000/api/cache/health
```

**Expected response**:
```json
{
  "status": "UP",
  "service": "Redis Cache",
  "message": "Redis is connected and operational"
}
```

✅ If you see this, Redis is working!

### Step 58: Test Cache Stats Endpoint
```bash
curl http://localhost:5000/api/cache/stats
```

**Expected response**:
```json
{
  "success": true,
  "totalKeys": 0,
  "cacheType": "Redis"
}
```

### Step 59: Test User Profile Caching

**First, login to get token**:
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}' \
  | jq -r '.token')

echo $TOKEN
```

**Make first profile request** (will fetch from database):
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/user/profile
```

**Check logs** - should see "Fetching user from database"

**Make second profile request** (will fetch from cache):
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/user/profile
```

**Check logs** - should NOT see "Fetching user from database"
This means it's using Redis cache! ✅

---

## PART 15: MONITOR REDIS

### Step 60: Exit Backend Server
```bash
exit
```

### Step 61: SSH Back into Redis Server
```bash
gcloud compute ssh redis-server --zone=us-central1-a
```

### Step 62: Monitor Redis Commands in Real-time
```bash
redis-cli -a GeoView2024RedisCache! monitor
```

This shows all Redis commands as they happen.

**In another terminal**, make requests to your backend and watch them appear here!

Press `Ctrl+C` to stop monitoring.

### Step 63: Check Redis Memory Usage
```bash
redis-cli -a GeoView2024RedisCache! info memory
```

Look for:
- `used_memory_human`: Shows current memory usage
- `maxmemory_human`: Should show 700M

### Step 64: Check Redis Statistics
```bash
redis-cli -a GeoView2024RedisCache! info stats
```

Look for:
- `total_connections_received`: Number of connections
- `total_commands_processed`: Number of commands
- `keyspace_hits`: Cache hits
- `keyspace_misses`: Cache misses

### Step 65: List All Cached Keys
```bash
redis-cli -a GeoView2024RedisCache! keys "*"
```

You should see keys like:
- `userProfile::673abc123...`
- `userByUsername::john_doe`

### Step 66: Check Key Count
```bash
redis-cli -a GeoView2024RedisCache! dbsize
```

Shows total number of keys in Redis.

### Step 67: Get Info About Specific Key
```bash
redis-cli -a GeoView2024RedisCache! ttl "userProfile::YOUR_KEY_HERE"
```

Shows remaining time-to-live in seconds (should be around 600 = 10 minutes)

---

## PART 16: CREATE MONITORING SCRIPT

### Step 68: Create Monitoring Script
```bash
nano ~/redis-monitor.sh
```

**Paste this content**:
```bash
#!/bin/bash
REDIS_PASSWORD="GeoView2024RedisCache!"

echo "=========================================="
echo "      Redis Status Report"
echo "=========================================="
echo ""
echo "--- Server Info ---"
redis-cli -a $REDIS_PASSWORD info server | grep redis_version
echo ""
echo "--- Memory Usage ---"
redis-cli -a $REDIS_PASSWORD info memory | grep used_memory_human
redis-cli -a $REDIS_PASSWORD info memory | grep maxmemory_human
echo ""
echo "--- Statistics ---"
redis-cli -a $REDIS_PASSWORD info stats | grep total_connections_received
redis-cli -a $REDIS_PASSWORD info stats | grep total_commands_processed
redis-cli -a $REDIS_PASSWORD info stats | grep keyspace_hits
redis-cli -a $REDIS_PASSWORD info stats | grep keyspace_misses
echo ""
echo "--- Key Count ---"
redis-cli -a $REDIS_PASSWORD dbsize
echo ""
echo "=========================================="
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

### Step 69: Make Script Executable
```bash
chmod +x ~/redis-monitor.sh
```

### Step 70: Run Monitoring Script
```bash
./redis-monitor.sh
```

You can run this anytime to check Redis status!

---

## PART 17: VERIFY FROM FRONTEND

### Step 71: Open Your Frontend Application

In browser, go to: `http://your-frontend-domain`

### Step 72: Login to Application

Use your credentials to login.

### Step 73: View Profile Multiple Times

1. Go to Profile page
2. Note the response time
3. Refresh the page
4. Response should be faster (cached!)

### Step 74: Add/Remove Favorites

1. Add a country to favorites
2. Cache should be invalidated
3. Next profile request will be slower (cache miss)
4. Subsequent requests will be fast again (cache hit)

---

## PART 18: PERFORMANCE TESTING

### Step 75: SSH into Backend Server
```bash
gcloud compute ssh backend-server --zone=us-central1-a
```

### Step 76: Install Apache Bench
```bash
sudo apt install apache2-utils -y
```

### Step 77: Run Load Test

**Get token first**:
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}' \
  | jq -r '.token')
```

**Run benchmark**:
```bash
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/user/profile
```

**Results to note**:
- `Requests per second`: Higher is better
- `Time per request`: Lower is better (should be 10-30ms with cache)
- `Failed requests`: Should be 0

---

## PART 19: BACKUP REDIS DATA (OPTIONAL)

### Step 78: SSH into Redis Server
```bash
gcloud compute ssh redis-server --zone=us-central1-a
```

### Step 79: Create Manual Backup
```bash
redis-cli -a GeoView2024RedisCache! SAVE
```

### Step 80: Copy Backup File
```bash
sudo cp /var/lib/redis/dump.rdb ~/redis-backup-$(date +%Y%m%d).rdb
```

### Step 81: Verify Backup
```bash
ls -lh ~/redis-backup-*
```

---

## PART 20: FINAL VERIFICATION CHECKLIST

### Step 82: Complete This Checklist

**Redis Server**:
- [ ] Redis VM is running
- [ ] Redis service is active
- [ ] Redis responds to PING
- [ ] Password authentication works
- [ ] Memory limit is 700MB
- [ ] Firewall rules are active

**Network**:
- [ ] GCP firewall rule created
- [ ] UFW firewall configured
- [ ] Backend can connect to Redis
- [ ] Redis only accessible from backend

**Application**:
- [ ] application.properties updated
- [ ] Application built successfully
- [ ] JAR deployed to backend
- [ ] Application starts without errors
- [ ] No Redis connection errors in logs

**Functionality**:
- [ ] `/api/cache/health` returns UP
- [ ] `/api/cache/stats` works
- [ ] User profile caching works
- [ ] Second request is faster (cached)
- [ ] Cache invalidation works

**Performance**:
- [ ] Response time < 50ms (cached)
- [ ] Cache hit ratio > 80%
- [ ] Memory usage < 700MB
- [ ] Load test passes

---

## CONGRATULATIONS! 🎉

Your Redis caching system is now fully configured and operational!

### Quick Reference for Daily Use

**Check Redis Status**:
```bash
sudo systemctl status redis-server
```

**Monitor Redis**:
```bash
redis-cli -a GeoView2024RedisCache! monitor
```

**Check Cache Health**:
```bash
curl http://localhost:5000/api/cache/health
```

**View Redis Memory**:
```bash
redis-cli -a GeoView2024RedisCache! info memory
```

**Run Monitoring Script**:
```bash
./redis-monitor.sh
```

---

## Important Information to Save

**Redis VM Internal IP**: `_________________`
**Redis Password**: `_________________`
**Redis Port**: `6379`
**Backend VM Internal IP**: `10.128.0.42`

**Connection String**:
```
redis://:GeoView2024RedisCache!@10.128.0.43:6379
```

---

## Troubleshooting

### If Redis won't start:
```bash
sudo journalctl -u redis-server -n 50
```

### If application can't connect:
```bash
# Check firewall
sudo ufw status

# Test connection
redis-cli -h 10.128.0.43 -p 6379 -a GeoView2024RedisCache! ping
```

### If out of memory:
```bash
# Clear cache
redis-cli -a GeoView2024RedisCache! FLUSHDB

# Or reduce maxmemory in /etc/redis/redis.conf
```

---

**Setup Complete! Your Redis cache is ready for production use!** ✅
