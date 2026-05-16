# VPS INFOMANIAK — ÉVALUATION CAPACITÉ POUR NEWAGRIQDODO V2

**Date:** 2026-05-15  
**VPS Actuel:** VPS Lite Infomaniak  
**IP:** 83.228.247.77  
**Exécution:** Ubuntu 24.04 LTS 64-bits

---

## 1. RESSOURCES VPS LITE ACTUELLES

| Ressource | Capacity | Notes |
|-----------|----------|-------|
| **vCPU** | ~2 cores | Partagé, burst available |
| **RAM** | ~2-4 GB | Typical Lite plan |
| **Storage** | ~20-40 GB SSD | Sufficient for MVP |
| **Bandwidth** | 500 Mb/s unlimited | ✅ Excellent |
| **Location** | Plan-les-Ouates, CH | ✅ Local (low latency) |

---

## 2. BESOINS NEWAGRIQDODO V2 (PAR PHASE)

### Phase 0-1 : MVP (Semaines 1-3)
**Target:** 10-50 exploitations actives en test

```
Frontend:      React static assets (~5 MB)
Backend:       Node.js API (single instance)
Database:      PostgreSQL + PostGIS
Cache:         Redis (optional, peut ignorer phase 1)
Estimé RAM:    ~1.5 GB
Estimé CPU:    ~30-40% peak
Storage:        ~5 GB (logs + data)
```

**Verdict:** ✅ VPS Lite **SUFFISANT**

---

### Phase 2 : Beta Production (Semaines 4-6)
**Target:** 100-200 exploitations actives

```
Frontend:      React + map tiles cached
Backend:       Node.js API + webhooks Odoo
Database:      PostgreSQL + PostGIS + indexes
Cache:         Redis (sessions + data cache)
Estimé RAM:    ~2.5-3 GB
Estimé CPU:    ~50-60% peak (webhook processing)
Storage:        ~15 GB (data growth)
Concurrent:     ~20-30 users simultaneous
```

**Verdict:** ⚠️ VPS Lite **BORDERLINE** — fonctionnera mais serré
- Swap memory actif
- API responses lentes si pics webhook
- Pas de margin pour growth

---

### Phase 3-4 : Full Scale (Semaines 7-12 et après)
**Target:** 500-2000+ exploitations

```
Frontend:      React + map tiles + service worker
Backend:       Node.js cluster (2-4 instances) + load balancer
Database:      PostgreSQL (master-replica) + PostGIS + heavy indexing
Cache:         Redis (sessions + data + webhook queue)
Message Queue: Bull (for async jobs)
Estimé RAM:    ~6-8 GB minimum
Estimé CPU:    ~70-80% peak (multi-instance needed)
Storage:        ~100+ GB (rapid growth)
Concurrent:     ~100-200 users simultaneous
```

**Verdict:** ❌ VPS Lite **INSUFFISANT**
- Require upgrade immédiat
- PostgreSQL seul va devenir bottleneck
- Webhook queue va overflow
- Map tiles rendering va lag

---

## 3. POINTS DE RUPTURE & TIMELINE

### Semaine 4-6 (Phase 2 Beta)
**Risk Level:** 🟡 MEDIUM

**Symptômes:**
- API response time > 500ms sous charge
- PostgreSQL CPU spikes à 80%+
- Webhooks Odoo commencent à backup en file d'attente
- Memory swapping actif (slow disk I/O)

**Action:** Monitoring strict, optimisation DB queries

---

### Semaine 7-8 (Phase 3 début)
**Risk Level:** 🔴 HIGH

**Symptômes:**
- API timeouts (> 5 sec)
- PostgreSQL can't handle concurrent writes
- Redis out of memory si cache pas optimisé
- Frontend map tiles slow to load

**Action nécessaire:** **UPGRADE VPS obligatoire**

---

### Semaine 10+ (Phase 4 full)
**Risk Level:** 🔴 CRITICAL si pas upgrade

**Symptômes:**
- Production instable
- Users reporting slowness
- Data loss risk (webhooks missed)
- Cannot scale further on single VPS

**Action obligatoire:** **Migrate to Standard/Pro plan**

---

## 4. RECOMMANDATIONS D'UPGRADE

### Scenario A : Upgrade graduel (RECOMMANDÉ)
```
Semaine 1-6:   VPS Lite (current)
               → Phase MVP + Beta fonctionnelle

Semaine 7:     Upgrade → VPS Standard
               - ~4-6 vCPU
               - ~8 GB RAM
               - ~100 GB SSD
               Coût: ~CHF 30-50/mois
               
Semaine 10+:   Upgrade → VPS Pro (si 500+ exploitations)
               - ~8-16 vCPU
               - ~16-32 GB RAM
               - ~200-400 GB SSD
               Coût: ~CHF 80-150/mois
```

**Avantage:** Scalabilité progressive, pas d'over-provisioning phase 1

---

### Scenario B : Surprovision d'entrée
```
Semaine 1:     Upgrade → VPS Standard immédiatement
               Coût supplémentaire phase 1: ~CHF 30-50/mois
               Avantage: Pas d'urgence upgrade phase 7
               Risque: Cost for unused capacity phase 1
```

---

## 5. CHECKLIST INFRASTRUCTURE

### Phase 0-1 (VPS Lite OK)
- [ ] Monitoring: CPU, RAM, Disk, DB connections
- [ ] Alertes: RAM > 80%, CPU > 75%, Disk > 70%
- [ ] Backups: DB daily + incremental
- [ ] Logs: Centralized (ELK ou Logi)
- [ ] DB indexes: Optimized queries (farm_id, user_id, parcel_id)
- [ ] Redis: Optional, can defer to phase 2

### Phase 2 (Prepare upgrade path)
- [ ] Load testing: Simulate 100 concurrent users
- [ ] Database profiling: Slow query logs
- [ ] Cache strategy: Implement Redis for sessions + data
- [ ] Monitoring dashboard: Real-time metrics
- [ ] Upgrade plan: Document playbook for VPS Standard migration
- [ ] Data migration test: Rehearse upgrade path

### Phase 3+ (Mandatory: VPS Standard minimum)
- [ ] PostgreSQL optimization: Master-replica setup (if traffic > 500 exploitations)
- [ ] Load balancer: If Node.js cluster > 1 instance
- [ ] Message queue: Bull for async webhooks
- [ ] CDN (optional): For map tiles + static assets
- [ ] Database sharding (future): If > 2000 exploitations

---

## 6. COÛTS ESTIMÉS (INFOMANIAK)

| Plan | vCPU | RAM | SSD | Prix/mois CHF |
|------|------|-----|-----|---------------|
| **Lite** (current) | 2 | 2-4 GB | 20-40 GB | ~10-15 |
| **Standard** | 4-6 | 8 GB | 100 GB | ~30-50 |
| **Pro** | 8-16 | 16-32 GB | 200-400 GB | ~80-150 |

**Note:** Vérifier pricing Infomaniak exact — peut changer

---

## 7. ALERTES À MONITORER

### Weekly checks (Phase 1-2)
```
1. PostgreSQL size: SELECT pg_database_size('newagriqdodo');
2. Connections: SELECT count(*) FROM pg_stat_activity;
3. Slow queries: Enable log_min_duration_statement = 500
4. Cache hit ratio: Redis INFO stats
5. Disk usage: df -h /
6. Memory: free -h
```

### Critical thresholds
| Metric | Warning | Critical |
|--------|---------|----------|
| RAM usage | 70% | 85% |
| CPU (5min avg) | 60% | 80% |
| Disk usage | 60% | 75% |
| DB connections | 80/100 | 95/100 |
| API response (p95) | 500ms | 2000ms |
| Webhook queue size | >100 | >1000 |

---

## 8. MIGRATION PLAYBOOK (VPS Lite → Standard)

**When to trigger:** When Phase 3 starts OR metrics hit critical threshold

```
Day 1:
  1. Provision new VPS Standard (parallel setup)
  2. Migrate PostgreSQL data (pg_dump + pg_restore)
  3. Set up replication (optional, for zero-downtime)
  4. Test full stack on new VPS

Day 2:
  1. Update DNS → point to new VPS IP
  2. Monitor for 2 hours for issues
  3. Keep old VPS alive for 24h rollback

Day 3:
  1. Decommission old VPS Lite
  2. Update documentation
  3. Celebrate! 🎉
```

---

## 9. RECOMMENDATION FINALE

### ✅ DO
- **Start on VPS Lite** (current plan)
- **Implement monitoring from day 1** (CPU, RAM, Disk, DB)
- **Plan upgrade timeline** (trigger week 7 if growth on track)
- **Run load tests** before phase 3 (identify bottlenecks early)
- **Document playbook** for VPS Standard migration

### ❌ DON'T
- ❌ Ignore monitoring — you'll get surprise outages
- ❌ Wait until phase 4 to upgrade — you'll have service disruption
- ❌ Skip backups — you'll lose data
- ❌ Over-provision early — waste money on phase 1-2
- ❌ Use default PostgreSQL config — tune for your workload

---

## 10. COMMUNICATION À FABIEN

**VPS Lite suffisant pour MVP (phases 0-2) ✅**

**Mais préparez l'upgrade phase 3:**
- Semaine 7 = trigger upgrade → VPS Standard
- Budget ~CHF 30-50/mois supplémentaire
- Pas de downtime si planifié bien

**Je vais monitorer et vous alerter si:**
- Performance dégrade
- Upgrade timeline doit accélérer
- Bottlenecks apparaissent avant phase 3

**Vous m'avertissez si:**
- Timing change
- Budget constraints
- Infrastructure strategy change

---

**Statut:** ✅ READY FOR DEVELOPMENT  
Infra supports MVP → Beta phases. Upgrade path clear for scale.

---

**FIN ASSESSMENT**
