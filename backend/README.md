
## 🗝️ First-Time Setup

### 1. Copy environment template
```cp .env.example .env```
Edit `.env` with your credentials (DB_ROOT_PASSWORD only needed for db:create)

### 2. Database User
Create a user with privileges to create tables

### 3. Create database (uses DB_USER credentials by default)
```npm run db:create```

### 4. Run migrations
```npm run db:migrate```

### 5. Start dev server (auto-reload)
```npm run dev```

## 🌡️ Connection Diagnostics
```
  # Verify database connectivity independently
  npm run db:check

  # Sample output on failure:
  # ❌ [CLI Diagnostic] Database connection FAILED
  # 🔑 Authentication failed. Verify DB_USER/ DB_PASSWORD
```

## 🚀 Production Deployment
```
  # Build optimized bundle (esbuild)
  npm run build

  # Start production server
  npm start

  # Health check endpoint
  curl http://localhost:3000/health
```

Header 1
========

Header 2
_________
