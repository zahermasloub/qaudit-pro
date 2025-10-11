# Database Setup Guide / دليل إعداد قاعدة البيانات

## 🚀 PostgreSQL Setup

### 1. تثبيت PostgreSQL
```bash
# Windows (with Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

### 2. إنشاء قاعدة البيانات والمستخدم
```sql
-- Connect as postgres user
psql -U postgres

-- Create database and user
CREATE DATABASE qaudit_pro;
CREATE USER qaudit_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE qaudit_pro TO qaudit_user;
GRANT ALL ON SCHEMA public TO qaudit_user;

-- Exit psql
\q
```

### 3. تحديث متغيرات البيئة
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Update DATABASE_URL in .env.local:
DATABASE_URL="postgresql://qaudit_user:YOUR_SECURE_PASSWORD@localhost:5432/qaudit_pro?schema=public"
```

### 4. تطبيق Schema وإدخال البيانات الأولية
```bash
# Push schema to database
npx prisma db push

# Seed initial data
npm run seed
```

## 🔧 Testing Database Connection

```bash
# Test Prisma connection
npx prisma db pull

# Open Prisma Studio (optional)
npx prisma studio
```

## ⚡ Quick Start Commands

```bash
# After PostgreSQL is installed and running:
npm run db:setup    # Creates schema
npm run seed        # Seeds initial data
npm run dev         # Start development server
```

## 🔐 Security Notes

- **Never commit** `.env.local` to version control
- Use **strong passwords** for database users
- In production, use **environment-specific secrets**
- Consider **connection pooling** with PGBouncer for production

## 🏥 Troubleshooting

### Common Issues:
1. **"Can't reach database server"**
   - Ensure PostgreSQL service is running
   - Check port 5432 is not blocked

2. **"Authentication failed"**
   - Verify username/password in DATABASE_URL
   - Check user permissions in PostgreSQL

3. **"Database does not exist"**
   - Create database manually using psql
   - Ensure database name matches in DATABASE_URL
