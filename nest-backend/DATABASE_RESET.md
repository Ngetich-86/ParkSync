# Database Reset System

This system provides comprehensive database management capabilities including dropping all tables, running fresh migrations, and monitoring database status.

## 🚀 Quick Start

### CLI Commands

```bash
# Check database status
npm run db:status

# Fresh reset (recommended for development)
npm run db:fresh

# Drop all tables only
npm run db:drop

# Run migrations only
npm run db:migrate

# Full reset with confirmation
npm run db:reset
```

### API Endpoints

All endpoints require authentication and appropriate role permissions:

- **GET** `/database/status` - Get database status (ADMIN+)
- **POST** `/database/drop-tables` - Drop all tables (SUPERADMIN only)
- **POST** `/database/run-migrations` - Run migrations (ADMIN+)
- **POST** `/database/reset` - Full reset with confirmation (SUPERADMIN only)
- **POST** `/database/reset-fresh` - Fresh reset (SUPERADMIN only)

## 📋 Features

### 1. **Complete Database Reset**
- Drops all tables, sequences, and enums
- Runs fresh migrations
- Handles foreign key constraints properly
- Safe CASCADE operations

### 2. **Database Status Monitoring**
- Lists all tables, sequences, and enums
- Shows migration history
- Indicates if database is empty

### 3. **Safety Features**
- Confirmation required for destructive operations
- Role-based access control
- Comprehensive error handling
- Detailed logging

### 4. **Migration Management**
- Creates migrations table if needed
- Runs all pending migrations
- Proper entity relationships

## 🛠️ Usage Examples

### Development Workflow

```bash
# 1. Check current status
npm run db:status

# 2. Fresh reset for clean start
npm run db:fresh

# 3. Verify everything is working
npm run db:status
```

### Production Reset (via API)

```bash
# 1. Get database status
curl -X GET "http://localhost:3000/database/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Reset database (requires SUPERADMIN role)
curl -X POST "http://localhost:3000/database/reset-fresh" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Manual Migration

```bash
# Run only migrations without dropping tables
npm run db:migrate

# Check migration status
npm run migration:show
```

## 🔧 Configuration

### Environment Variables

Make sure these are set in your `.env` file:

```env
DATABASE_URL=your_database_url
DB_SYNC=false  # Should be false for production
DB_LOGGING=true  # Enable for debugging
```

### Role Permissions

- **SUPERADMIN**: Can perform all operations including destructive resets
- **ADMIN**: Can run migrations and check status
- **MANAGER/ATTENDANT/CUSTOMER**: No database management access

## 📊 Database Schema

The system creates a complete schema with:

### Tables
- `user` - User management
- `vehicle` - Vehicle information
- `parking_slot` - Parking slot management
- `reservation` - Reservation system
- `parking_session` - Active parking sessions
- `payment` - Payment tracking
- `migrations` - Migration history

### Enums
- `user_role_enum` - User roles
- `role_enum` - System roles
- `slot_type_enum` - Slot types
- `payment_status_enum` - Payment statuses
- `notification_type_enum` - Notification types
- `vehicle_type_enum` - Vehicle types
- `reservation_type_enum` - Reservation types
- `reservation_status_enum` - Reservation statuses

## ⚠️ Safety Considerations

1. **Backup First**: Always backup your database before running reset operations
2. **Environment Check**: Ensure you're running against the correct environment
3. **Role Verification**: Verify your user has the required permissions
4. **Confirmation**: Use confirmation flags for destructive operations

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure your user has SUPERADMIN role
   - Check JWT token is valid

2. **Migration Errors**
   - Check database connection
   - Verify all entities are properly imported
   - Check for syntax errors in migration files

3. **Foreign Key Constraints**
   - The system handles CASCADE operations automatically
   - Check for circular dependencies

### Debug Mode

Enable detailed logging:

```bash
# Set in .env
DB_LOGGING=true

# Or run with debug
npm run start:debug
```

## 📝 Migration Files

The system includes a comprehensive migration (`1700000000001-CompleteSchema.ts`) that creates:

- All required tables with proper relationships
- All enums with correct values
- Proper indexes for performance
- Foreign key constraints
- UUID generation for primary keys

## 🔄 Workflow Integration

### CI/CD Pipeline

```yaml
# Example GitHub Actions step
- name: Reset Database
  run: |
    npm run db:fresh
    npm run test
```

### Development Setup

```bash
# New developer setup
git clone <repo>
npm install
npm run db:fresh
npm run start:dev
```

This system provides a robust, safe, and comprehensive database management solution for your ParkSync application.
