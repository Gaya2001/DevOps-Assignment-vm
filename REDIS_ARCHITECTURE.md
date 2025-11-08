# GeoView Redis Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GCP Cloud Platform                          │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                 │
│  │   Frontend VM    │         │   Backend VM     │                 │
│  │  (React + Vite)  │◄───────►│  (Spring Boot)   │                 │
│  │  Port: 80/443    │  HTTPS  │  Port: 5000      │                 │
│  └──────────────────┘         └────────┬─────────┘                 │
│                                         │                            │
│                                         │ Cache Layer                │
│                                         ▼                            │
│                              ┌──────────────────┐                   │
│                              │   Redis Server   │                   │
│                              │   (e2-micro)     │                   │
│                              │   Port: 6379     │                   │
│                              │   Memory: 700MB  │                   │
│                              └────────┬─────────┘                   │
│                                       │                              │
│                                       │ Primary Storage              │
│                                       ▼                              │
│                              ┌──────────────────┐                   │
│                              │  MongoDB Server  │                   │
│                              │  (Database)      │                   │
│                              │  Port: 27017     │                   │
│                              └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. User Profile Request (Cache Hit)
```
User Browser → Frontend VM → Backend VM → Redis Cache → Response
                                  ↓
                            (No DB Query!)
```

### 2. User Profile Request (Cache Miss)
```
User Browser → Frontend VM → Backend VM → Redis Cache (miss)
                                  ↓
                            MongoDB Query
                                  ↓
                            Store in Redis
                                  ↓
                              Response
```

### 3. Add/Remove Favorite (Cache Invalidation)
```
User Browser → Frontend VM → Backend VM → MongoDB (Update)
                                  ↓
                            Evict Redis Cache
                                  ↓
                              Response
```

## Network Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPC Network (default)                     │
│                       Subnet: 10.128.0.0/24                      │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Frontend VM  │    │ Backend VM   │    │  Redis VM    │     │
│  │ 10.128.0.41  │    │ 10.128.0.42  │    │ 10.128.0.43  │     │
│  │              │    │              │    │              │     │
│  │ Public IP:   │    │ Public IP:   │    │ No Public IP │     │
│  │ xxx.xxx.xx.x │    │ xxx.xxx.xx.x │    │ (Internal)   │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                    │                    │             │
│         └────────────────────┴────────────────────┘             │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                          Internet
                               │
                        ┌──────▼──────┐
                        │ Load Balancer│
                        │     SSL      │
                        └─────────────┘
```

## Firewall Rules

```
Rule: allow-redis
├── Direction: INGRESS
├── Source: 10.128.0.42/32 (Backend VM)
├── Target: redis-server tag
├── Protocol: TCP
├── Port: 6379
└── Action: ALLOW

Rule: allow-mongodb
├── Direction: INGRESS
├── Source: 10.128.0.42/32 (Backend VM)
├── Target: mongodb-server tag
├── Protocol: TCP
├── Port: 27017
└── Action: ALLOW

Rule: allow-http-https
├── Direction: INGRESS
├── Source: 0.0.0.0/0 (Internet)
├── Target: http-server, https-server tags
├── Protocol: TCP
├── Port: 80, 443
└── Action: ALLOW
```

## Data Flow Sequence

### Scenario 1: First User Profile Request
```
┌──────┐     ┌─────────┐     ┌──────────┐     ┌───────┐     ┌─────────┐
│Client│     │Frontend │     │ Backend  │     │ Redis │     │ MongoDB │
└──┬───┘     └────┬────┘     └────┬─────┘     └───┬───┘     └────┬────┘
   │              │               │               │              │
   │ GET /profile │               │               │              │
   ├─────────────►│               │               │              │
   │              │ API Request   │               │              │
   │              ├──────────────►│               │              │
   │              │               │ Check Cache   │              │
   │              │               ├──────────────►│              │
   │              │               │               │              │
   │              │               │  Cache MISS   │              │
   │              │               │◄──────────────┤              │
   │              │               │               │              │
   │              │               │ Query User Data              │
   │              │               ├─────────────────────────────►│
   │              │               │               │              │
   │              │               │       User Document          │
   │              │               │◄─────────────────────────────┤
   │              │               │               │              │
   │              │               │ Store in Cache              │
   │              │               ├──────────────►│              │
   │              │               │               │              │
   │              │               │   Cached OK   │              │
   │              │               │◄──────────────┤              │
   │              │               │               │              │
   │              │  JSON Response                │              │
   │              │◄──────────────┤               │              │
   │              │               │               │              │
   │   User Data  │               │               │              │
   │◄─────────────┤               │               │              │
   │              │               │               │              │
```

### Scenario 2: Subsequent Profile Request (Cache Hit)
```
┌──────┐     ┌─────────┐     ┌──────────┐     ┌───────┐
│Client│     │Frontend │     │ Backend  │     │ Redis │
└──┬───┘     └────┬────┘     └────┬─────┘     └───┬───┘
   │              │               │               │
   │ GET /profile │               │               │
   ├─────────────►│               │               │
   │              │ API Request   │               │
   │              ├──────────────►│               │
   │              │               │ Check Cache   │
   │              │               ├──────────────►│
   │              │               │               │
   │              │               │  Cache HIT ✓  │
   │              │               │◄──────────────┤
   │              │               │               │
   │              │  JSON Response (from cache)   │
   │              │◄──────────────┤               │
   │              │               │               │
   │   User Data  │               │               │
   │◄─────────────┤               │               │
   │              │               │               │
   
   Time Saved: 90% faster (150ms → 15ms)
   DB Queries: 0 (vs 1)
```

## Cache Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cache Lifecycle                          │
└─────────────────────────────────────────────────────────────────┘

Event: User Login / Profile Access
         │
         ▼
    ┌─────────┐
    │ Request │
    └────┬────┘
         │
         ▼
    ┌─────────────┐      Cache Hit      ┌──────────────┐
    │ Check Redis ├────────────────────►│ Return Data  │
    └─────┬───────┘                     └──────────────┘
          │
          │ Cache Miss
          ▼
    ┌──────────────┐
    │ Query MongoDB│
    └─────┬────────┘
          │
          ▼
    ┌──────────────┐
    │ Store in     │
    │ Redis (TTL:  │
    │ 10 minutes)  │
    └─────┬────────┘
          │
          ▼
    ┌──────────────┐
    │ Return Data  │
    └──────────────┘

Event: Add/Remove Favorite
         │
         ▼
    ┌──────────────┐
    │ Update MongoDB│
    └─────┬────────┘
          │
          ▼
    ┌──────────────┐
    │ Evict Cache  │
    │ (CacheEvict) │
    └─────┬────────┘
          │
          ▼
    ┌──────────────┐
    │ Next request │
    │ will reload  │
    └──────────────┘
```

## Redis Memory Layout

```
┌─────────────────────────────────────────────────────────┐
│           Redis Memory (700MB e2-micro)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User Profiles Cache                                     │
│  ┌────────────────────────────────────────────┐        │
│  │ userProfile::673abc123                     │        │
│  │ {id, username, email, favoriteCountries}   │        │
│  │ TTL: 8 minutes remaining                   │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ userProfile::673def456                     │        │
│  │ {id, username, email, favoriteCountries}   │        │
│  │ TTL: 5 minutes remaining                   │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Username Cache                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ userByUsername::john_doe                   │        │
│  │ {id, username, email, favoriteCountries}   │        │
│  │ TTL: 9 minutes remaining                   │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Memory Usage: ~150MB / 700MB (21%)                     │
│  Keys Count: ~1,200                                      │
│  Eviction Policy: allkeys-lru                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Spring Boot Layer Architecture

```
┌───────────────────────────────────────────────────────────┐
│                   Spring Boot Application                  │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────┐         │
│  │         Controller Layer                     │         │
│  │  ┌──────────────┐    ┌──────────────┐      │         │
│  │  │ UserController│    │CacheController│     │         │
│  │  └───────┬──────┘    └──────┬───────┘      │         │
│  └──────────┼───────────────────┼──────────────┘         │
│             │                   │                         │
│  ┌──────────▼───────────────────▼──────────────┐         │
│  │         Service Layer                        │         │
│  │  ┌────────────────────────────────┐         │         │
│  │  │     UserService                │         │         │
│  │  │  @Cacheable("userProfile")     │         │         │
│  │  │  @CacheEvict("userProfile")    │         │         │
│  │  └────────────┬───────────────────┘         │         │
│  └───────────────┼─────────────────────────────┘         │
│                  │                                         │
│  ┌───────────────▼─────────────────────────────┐         │
│  │         Cache Layer (Redis)                 │         │
│  │  ┌──────────────────────────────┐          │         │
│  │  │    RedisConfig                │          │         │
│  │  │  - RedisTemplate              │          │         │
│  │  │  - CacheManager               │          │         │
│  │  │  - Jedis Connection           │          │         │
│  │  └──────────────┬───────────────┘          │         │
│  └─────────────────┼────────────────────────────┘         │
│                    │                                       │
│                    │ Network Connection                    │
│                    │                                       │
└────────────────────┼───────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │Redis Server  │
              │10.128.0.43   │
              │Port: 6379    │
              └──────────────┘
```

## Performance Comparison

### Before Redis
```
Request Timeline (Average: 200ms)
├──────────────────────────────────────────────────────────┤
│ Network: 20ms │ DB Query: 150ms │ Processing: 20ms │ Return: 10ms │
└──────────────────────────────────────────────────────────┘

Breakdown:
- Network Latency: 20ms (10%)
- MongoDB Query: 150ms (75%)  ← Bottleneck
- Data Processing: 20ms (10%)
- Response Return: 10ms (5%)
```

### After Redis (Cache Hit)
```
Request Timeline (Average: 20ms)
├──────┤
│ Network: 10ms │ Redis: 5ms │ Return: 5ms │
└──────┘

Breakdown:
- Network Latency: 10ms (50%)
- Redis Query: 5ms (25%)  ← Fast!
- Response Return: 5ms (25%)

Performance Gain: 90% faster (200ms → 20ms)
```

## Monitoring Dashboard Concept

```
┌─────────────────────────────────────────────────────────────┐
│              Redis Performance Dashboard                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Cache Hit Ratio:  ▓▓▓▓▓▓▓▓▓░ 92%                          │
│  Memory Usage:     ▓▓▓░░░░░░░ 28% (200MB/700MB)            │
│  Connections:      ▓░░░░░░░░░ 12/100                        │
│  Keys:             1,247 active keys                         │
│  Evictions:        3 (last 24h)                             │
│  Response Time:    15ms average                              │
│                                                              │
│  Top Keys:                                                   │
│  ├─ userProfile::*        (847 keys)                        │
│  ├─ userByUsername::*     (395 keys)                        │
│  └─ health:check          (5 keys)                          │
│                                                              │
│  Recent Activity:                                            │
│  ├─ 14:32:15 GET userProfile::673abc  [HIT]  3ms          │
│  ├─ 14:32:14 GET userProfile::673def  [HIT]  2ms          │
│  ├─ 14:32:10 DEL userProfile::673xyz  [OK]   1ms          │
│  └─ 14:32:08 SET userProfile::673aaa  [OK]   4ms          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Cost Analysis

```
┌────────────────────────────────────────────────────────┐
│              Monthly Cost Breakdown                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Component          │ Specs        │ Cost/Month        │
│  ──────────────────┼──────────────┼─────────────────  │
│  Redis VM          │ e2-micro     │ $6.11             │
│  Storage (10GB)    │ Standard     │ $0.40             │
│  Network (5GB)     │ Egress       │ $0.60             │
│  ──────────────────┼──────────────┼─────────────────  │
│  Total                             │ $7.11             │
│                                                         │
│  Savings from reduced DB load:     │ -$2.50            │
│  Net Additional Cost:              │ $4.61             │
│                                                         │
│  Performance Benefit:              │ 90% improvement   │
│  ROI:                              │ Immediate ✓       │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ► : Data flow direction
- ▼ : Process flow
- ◄ : Response flow
- ✓ : Success/Optimal path
- ░ : Empty/Unused
- ▓ : Used/Active
