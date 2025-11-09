# Redis Deployment Checklist

## Pre-Deployment

### Environment Check
- [ ] GCP project is set up and accessible
- [ ] gcloud CLI is installed and configured
- [ ] You have necessary permissions (Compute Admin)
- [ ] Backend VM is running and accessible
- [ ] Backend VM internal IP is known: `_____________`

### Code Review
- [ ] `pom.xml` has Redis dependencies added
- [ ] `application.properties` is ready (will update IP later)
- [ ] `RedisConfig.java` is in place
- [ ] `UserService.java` is created
- [ ] `CacheController.java` is created
- [ ] `UserController.java` is updated
- [ ] No compilation errors: `mvn clean compile`

---

## Phase 1: Create Redis VM (15 minutes)

### Step 1: Create VM Instance
```bash
gcloud compute instances create redis-server \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --boot-disk-type=pd-standard \
  --tags=redis-server
```

- [ ] Command executed successfully
- [ ] VM is running: `gcloud compute instances list`
- [ ] Note internal IP: `_____________`

### Step 2: SSH into VM
```bash
gcloud compute ssh redis-server --zone=us-central1-a
```

- [ ] Successfully connected to VM
- [ ] Ubuntu prompt appears

---

## Phase 2: Install Redis (10 minutes)

### Option A: Automated Installation (Recommended)
```bash
# Download script
wget https://raw.githubusercontent.com/Gaya2001/DevOps-Assignment-vm/main/redis-setup.sh

# Make executable
chmod +x redis-setup.sh

# Run with sudo
sudo ./redis-setup.sh
```

- [ ] Script downloaded
- [ ] Script executed without errors
- [ ] Redis is running: `sudo systemctl status redis-server`
- [ ] Note password from script output: `_____________`

### Option B: Manual Installation
```bash
# Update packages
sudo apt update

# Install Redis
sudo apt install -y redis-server

# Verify installation
redis-server --version
```

- [ ] Redis installed
- [ ] Version displayed: `_____________`

### Manual Configuration (if using Option B)
```bash
# Backup config
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Edit config
sudo nano /etc/redis/redis.conf
```

Update these settings:
- [ ] `bind 0.0.0.0` (or specific IP)
- [ ] `protected-mode no`
- [ ] `requirepass YourStrongPassword123!`
- [ ] `maxmemory 700mb`
- [ ] `maxmemory-policy allkeys-lru`
- [ ] Save and exit (Ctrl+X, Y, Enter)

```bash
# Restart Redis
sudo systemctl restart redis-server

# Enable on boot
sudo systemctl enable redis-server
```

- [ ] Redis restarted successfully
- [ ] Redis enabled on boot

---

## Phase 3: Configure Firewall (5 minutes)

### GCP Firewall Rule
Exit SSH and run on your local machine:

```bash
# Get your backend VM internal IP
gcloud compute instances describe backend-server \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].networkIP)'
```

- [ ] Backend IP noted: `_____________`

```bash
# Create firewall rule
gcloud compute firewall-rules create allow-redis-from-backend \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:6379 \
  --source-ranges=<BACKEND_INTERNAL_IP>/32 \
  --target-tags=redis-server
```

- [ ] Firewall rule created
- [ ] Rule visible in GCP Console

### VM Firewall (UFW)
Back in Redis VM SSH:

```bash
# Enable UFW
sudo ufw --force enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow Redis from backend
sudo ufw allow from <BACKEND_INTERNAL_IP> to any port 6379

# Check status
sudo ufw status
```

- [ ] UFW enabled
- [ ] Rules added
- [ ] Status shows correct rules

---

## Phase 4: Test Redis Connection (5 minutes)

### Test Locally on Redis VM
```bash
redis-cli -p 6379 -a YourPassword ping
```

- [ ] Returns: `PONG`

### Test from Backend VM
SSH into backend VM:

```bash
gcloud compute ssh backend-server --zone=us-central1-a

# Test connection
redis-cli -h <REDIS_INTERNAL_IP> -p 6379 -a YourPassword ping
```

- [ ] Returns: `PONG` from backend VM
- [ ] Connection successful

---

## Phase 5: Update Application (10 minutes)

### Update application.properties
On your local machine:

```bash
cd Spring-Boot-Backend/src/main/resources
nano application.properties
```

Update Redis configuration:
```properties
spring.data.redis.host=<REDIS_INTERNAL_IP>
spring.data.redis.port=6379
spring.data.redis.password=YourPassword
```

- [ ] File updated with correct IP
- [ ] Password set correctly
- [ ] File saved

### Build Application
```bash
cd Spring-Boot-Backend
mvn clean install
```

- [ ] Build successful: `BUILD SUCCESS`
- [ ] JAR file created: `target/geoview-backend-1.0.0.jar`
- [ ] No errors in build logs

---

## Phase 6: Deploy to Backend VM (10 minutes)

### Copy JAR to Backend
```bash
# From local machine
gcloud compute scp target/geoview-backend-1.0.0.jar \
  backend-server:/home/your-username/ \
  --zone=us-central1-a
```

- [ ] File copied successfully

### Deploy on Backend VM
SSH into backend VM:

```bash
# Stop current application
sudo systemctl stop geoview-backend

# Backup old JAR
sudo mv /opt/geoview/geoview-backend.jar /opt/geoview/geoview-backend.jar.backup

# Copy new JAR
sudo cp ~/geoview-backend-1.0.0.jar /opt/geoview/geoview-backend.jar

# Start application
sudo systemctl start geoview-backend

# Check status
sudo systemctl status geoview-backend
```

- [ ] Application stopped
- [ ] Old JAR backed up
- [ ] New JAR deployed
- [ ] Application started
- [ ] Status shows "active (running)"

### Check Logs
```bash
sudo journalctl -u geoview-backend -f
```

Look for:
- [ ] Redis connection successful
- [ ] No connection errors
- [ ] Application started on port 5000

---

## Phase 7: Verify Integration (15 minutes)

### Test Cache Health Endpoint
```bash
curl http://localhost:5000/api/cache/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "Redis Cache",
  "message": "Redis is connected and operational"
}
```

- [ ] Endpoint returns 200 OK
- [ ] Status is "UP"
- [ ] Message indicates operational

### Test Cache Stats
```bash
curl http://localhost:5000/api/cache/stats
```

- [ ] Returns statistics
- [ ] Shows Redis cache type
- [ ] Key count displayed

### Test User Profile Caching

#### First Request (Cache Miss)
```bash
# Login first to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  | jq -r '.token')

# Get profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/cache/profile
```

- [ ] Profile returned
- [ ] Check logs: See "Fetching user from database"

#### Second Request (Cache Hit)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/user/profile
```

- [ ] Profile returned (faster)
- [ ] Check logs: No database fetch message
- [ ] Data served from cache

### Monitor Redis
In Redis VM:

```bash
redis-cli -h localhost -p 6379 -a YourPassword monitor
```

- [ ] Monitor running
- [ ] See cache operations
- [ ] GET/SET commands visible

---

## Phase 8: Performance Testing (10 minutes)

### Load Test with ab (Apache Bench)
On backend VM:

```bash
# Install ab if needed
sudo apt install -y apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/user/profile
```

- [ ] Test completed
- [ ] Note average response time: `_____________ms`
- [ ] Note requests per second: `_____________`

### Check Cache Hit Ratio
```bash
redis-cli -h <REDIS_IP> -p 6379 -a YourPassword info stats | grep keyspace
```

- [ ] Cache hits > cache misses
- [ ] Hit ratio > 80%

---

## Phase 9: Monitoring Setup (5 minutes)

### Create Monitoring Script
On Redis VM:

```bash
cat > ~/redis-monitor.sh << 'EOF'
#!/bin/bash
REDIS_PASSWORD="YourPassword"

echo "=== Redis Status ==="
redis-cli -a $REDIS_PASSWORD info server | grep redis_version
redis-cli -a $REDIS_PASSWORD info memory | grep used_memory_human
redis-cli -a $REDIS_PASSWORD info stats | grep total_connections
redis-cli -a $REDIS_PASSWORD dbsize
EOF

chmod +x ~/redis-monitor.sh
```

- [ ] Script created
- [ ] Script executable
- [ ] Run script: `./redis-monitor.sh`

### Set Up Cron Job (Optional)
```bash
# Add to crontab
(crontab -l 2>/dev/null; echo "0 * * * * ~/redis-monitor.sh >> ~/redis-status.log") | crontab -
```

- [ ] Cron job added
- [ ] Monitoring automated

---

## Phase 10: Documentation Update (5 minutes)

### Update Your Documentation
- [ ] Document Redis VM IP in your notes
- [ ] Document Redis password in secure location
- [ ] Update architecture diagram with Redis
- [ ] Add Redis info to README.md
- [ ] Document firewall rules

### Create Backup
```bash
# On Redis VM
redis-cli -a YourPassword SAVE
sudo cp /var/lib/redis/dump.rdb ~/redis-backup-$(date +%Y%m%d).rdb
```

- [ ] Backup created
- [ ] Backup file exists

---

## Post-Deployment Verification

### System Health Checks
- [ ] Redis VM is running
- [ ] Redis service is active
- [ ] Backend application is running
- [ ] No errors in application logs
- [ ] No errors in Redis logs

### Functional Checks
- [ ] Users can login
- [ ] User profiles load correctly
- [ ] Favorites can be added
- [ ] Favorites can be removed
- [ ] Cache is being used (check logs)
- [ ] Cache invalidation works

### Performance Checks
- [ ] Response times improved
- [ ] Cache hit ratio > 80%
- [ ] Memory usage < 700MB
- [ ] No connection errors

### Security Checks
- [ ] Redis requires password
- [ ] Firewall rules restrict access
- [ ] No public access to Redis
- [ ] UFW is enabled
- [ ] SSH access works

---

## Rollback Plan (If Needed)

### If Issues Occur

1. **Restore Previous Version**
```bash
sudo systemctl stop geoview-backend
sudo mv /opt/geoview/geoview-backend.jar.backup /opt/geoview/geoview-backend.jar
sudo systemctl start geoview-backend
```

2. **Disable Redis Temporarily**
```properties
# In application.properties
# spring.cache.type=redis  # Comment this out
spring.cache.type=none
```

3. **Stop Redis VM**
```bash
gcloud compute instances stop redis-server --zone=us-central1-a
```

- [ ] Rollback steps documented
- [ ] Backup verified before deployment

---

## Cost Monitoring

### Expected Monthly Costs
- [ ] Redis VM (e2-micro): ~$6.11
- [ ] Storage (10GB): ~$0.40
- [ ] Network egress: ~$0.60
- [ ] **Total**: ~$7.11/month

### Monitor in GCP Console
- [ ] Billing alerts set up
- [ ] Cost tracking enabled
- [ ] Budget alerts configured

---

## Maintenance Tasks

### Daily
- [ ] Check application logs
- [ ] Monitor cache hit ratio
- [ ] Check Redis memory usage

### Weekly
- [ ] Review Redis logs
- [ ] Check firewall rules
- [ ] Verify backups

### Monthly
- [ ] Update Redis if needed
- [ ] Review performance metrics
- [ ] Clean old backups
- [ ] Review costs

---

## Success Criteria

### Deployment Successful If:
- [x] Redis VM is running
- [x] Application connects to Redis
- [x] Cache health endpoint returns UP
- [x] User profiles are cached
- [x] Cache invalidation works
- [x] Performance improved (>50%)
- [x] No errors in logs
- [x] Security measures in place

### Performance Targets:
- [x] Response time < 50ms (vs ~200ms before)
- [x] Cache hit ratio > 80%
- [x] Memory usage < 700MB
- [x] Zero connection errors

---

## Support Contacts

### If You Need Help:
1. **Check Documentation**
   - REDIS_SETUP_GUIDE.md
   - REDIS_INTEGRATION.md
   - REDIS_QUICK_REFERENCE.md

2. **Check Logs**
   - Application: `sudo journalctl -u geoview-backend -f`
   - Redis: `sudo tail -f /var/log/redis/redis-server.log`

3. **Test Endpoints**
   - Health: `curl http://localhost:5000/api/cache/health`
   - Stats: `curl http://localhost:5000/api/cache/stats`

4. **Monitor Redis**
   - `redis-cli -a Password monitor`
   - `redis-cli -a Password info`

---

## Completion Sign-Off

**Deployment completed by:** _______________
**Date:** _______________
**Time:** _______________

**Redis VM IP:** _______________
**Backend VM IP:** _______________
**Redis Password:** _______________ (store securely!)

**Performance Improvement:** _______________
**Cache Hit Ratio:** _______________
**Issues Encountered:** _______________

---

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Watch cache performance
   - Check for errors
   - Monitor memory usage

2. **Optimize if needed**
   - Adjust TTL values
   - Tune memory limits
   - Optimize cache strategy

3. **Document lessons learned**
   - Update runbooks
   - Document any issues
   - Share with team

4. **Plan enhancements**
   - Consider Redis Sentinel
   - Explore additional caching
   - Review session storage

---

**Congratulations! Your Redis deployment is complete! 🎉**
