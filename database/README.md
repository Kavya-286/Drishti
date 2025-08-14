# 🗄️ Drishti Database Schema

This directory contains the database schema and migration tools for the Drishti Startup Validation Platform.

## 📋 Overview

The platform currently uses **localStorage** for data persistence but this directory provides a complete **PostgreSQL** database schema design for production deployment.

## 📁 Files

- **`schema.sql`** - Complete database schema with tables, indexes, and constraints
- **`migrate_data.js`** - Data migration script from localStorage to PostgreSQL
- **`README.md`** - This documentation file

## 🏗️ Database Architecture

### Core Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | User authentication and basic profile | Primary table for all users |
| `entrepreneur_profiles` | Extended entrepreneur data | 1:1 with users (entrepreneurs) |
| `investor_profiles` | Extended investor data | 1:1 with users (investors) |
| `startups` | Startup/idea information | Many:1 with users (founders) |
| `validations` | AI validation results | 1:Many with startups |
| `investments` | Investment tracking | Many:Many between users/startups |
| `notifications` | System notifications | Many:1 with users |
| `watchlist` | Investor saved startups | Many:Many between investors/startups |

### Supporting Tables

- `founder_assessments` - Founder readiness evaluations
- `user_sessions` - Session management and security
- `activity_log` - User action tracking and analytics

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb drishti_db

# Apply schema
psql drishti_db < schema.sql
```

### 2. Environment Configuration

```bash
# Set database connection
export DATABASE_URL="postgresql://username:password@localhost:5432/drishti_db"
```

### 3. Data Migration

```bash
# Install dependencies
npm install pg uuid bcrypt

# Run migration
node migrate_data.js migrate

# Backup localStorage data
node migrate_data.js backup
```

## 📊 Schema Features

### ✅ Data Integrity
- **Primary keys** using UUIDs for global uniqueness
- **Foreign key constraints** to maintain referential integrity
- **Check constraints** for data validation
- **Unique constraints** to prevent duplicates

### ⚡ Performance
- **Optimized indexes** on frequently queried columns
- **Composite indexes** for complex queries
- **Partial indexes** for conditional queries
- **JSONB columns** for flexible schema evolution

### 🔒 Security
- **Password hashing** with bcrypt
- **Session management** with secure tokens
- **Activity logging** for audit trails
- **Soft deletes** for data recovery

### 📈 Scalability
- **Normalized design** to reduce data redundancy
- **JSON columns** for flexible data structures
- **Trigger-based** timestamp updates
- **View definitions** for common queries

## 🔄 Migration Strategy

### Phase 1: Parallel Operation
1. Deploy database schema
2. Update application to write to both localStorage and database
3. Verify data consistency
4. Monitor performance

### Phase 2: Read Migration
1. Update application to read from database
2. Keep localStorage as backup
3. Test all functionality
4. Performance optimization

### Phase 3: Complete Migration
1. Remove localStorage dependencies
2. Cleanup old code
3. Full database operation
4. Enable advanced features

## 📋 Data Types and Constraints

### User Types
```sql
user_type: 'entrepreneur' | 'investor'
plan_type: 'free' | 'pro' | 'enterprise'
auth_provider: 'email' | 'google' | 'linkedin'
```

### Investment Types
```sql
investment_type: 'equity' | 'debt' | 'convertible' | 'grant' | 'safe'
status: 'interested' | 'due-diligence' | 'negotiating' | 'committed' | 'closed' | 'rejected'
```

### Validation Levels
```sql
viability_level: 'very-low' | 'low' | 'medium' | 'high'
current_stage: 'idea' | 'mvp' | 'beta' | 'launched' | 'growth'
```

## 🛠️ Common Queries

### Get Startup with Validation
```sql
SELECT s.*, v.overall_score, v.viability_level 
FROM startups s 
LEFT JOIN validations v ON s.id = v.startup_id 
WHERE s.is_public = true 
ORDER BY v.overall_score DESC;
```

### Investor Dashboard Data
```sql
SELECT 
    u.first_name || ' ' || u.last_name as name,
    COUNT(DISTINCT i.startup_id) as investments,
    COUNT(DISTINCT w.startup_id) as watchlist_items
FROM users u
JOIN investor_profiles ip ON u.id = ip.user_id
LEFT JOIN investments i ON u.id = i.investor_id
LEFT JOIN watchlist w ON u.id = w.investor_id
WHERE u.user_type = 'investor'
GROUP BY u.id, u.first_name, u.last_name;
```

### Notification Summary
```sql
SELECT 
    type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_read = false) as unread
FROM notifications 
WHERE recipient_id = $1 
GROUP BY type;
```

## 📚 Best Practices

### 1. Query Optimization
- Use indexes for WHERE, ORDER BY, and JOIN conditions
- Limit result sets with pagination
- Use EXPLAIN ANALYZE for query performance analysis

### 2. Data Validation
- Always use parameterized queries to prevent SQL injection
- Validate data at application level before database insertion
- Use database constraints as final validation layer

### 3. Security
- Never store plain text passwords
- Use UUIDs instead of sequential IDs for public-facing identifiers
- Implement proper session management

### 4. Maintenance
- Regular VACUUM and ANALYZE operations
- Monitor database size and performance
- Backup database regularly
- Keep schema documentation updated

## 🔍 Monitoring Queries

### Database Size
```sql
SELECT 
    schemaname,
    tablename,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### Index Usage
```sql
SELECT 
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Active Connections
```sql
SELECT 
    datname,
    usename,
    application_name,
    state,
    query_start
FROM pg_stat_activity
WHERE datname = 'drishti_db';
```

## 🆘 Troubleshooting

### Common Issues

1. **Connection Issues**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check firewall/network settings

2. **Migration Errors**
   - Verify schema is applied
   - Check data format compatibility
   - Review foreign key constraints

3. **Performance Issues**
   - Check query execution plans
   - Verify indexes are being used
   - Monitor connection pool usage

### Getting Help

- Review PostgreSQL documentation
- Check application logs for detailed errors
- Use database monitoring tools
- Consider consulting PostgreSQL experts for complex issues

---

## 📞 Contact

For questions about the database schema or migration process, please refer to the main project documentation or contact the development team.
