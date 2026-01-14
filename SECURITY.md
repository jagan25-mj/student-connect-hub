# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in MiniHub, please report it responsibly:

1. **Do not** create a public GitHub issue
2. Email the maintainers directly with details
3. Allow up to 48 hours for an initial response

## Secure Configuration

### Environment Variables

All sensitive configuration must be stored in environment variables, never in code.

Required environment variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port (optional, defaults to 5000)
- `NODE_ENV` - Environment mode (`development` or `production`)
- `FRONTEND_URL` - Allowed CORS origin for production

### Generating Secure Secrets

#### JWT Secret
Generate a cryptographically secure JWT secret:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

**Requirements:**
- Minimum 256 bits (64 hex characters recommended)
- Use a cryptographically secure random generator
- Never reuse secrets across environments

### Key Rotation Procedures

#### When to Rotate Secrets
- Immediately if a secret is exposed (committed to git, logs, etc.)
- Periodically (recommended: every 90 days for production)
- When team members with access leave the project
- After any security incident

#### JWT Secret Rotation
1. Generate a new JWT secret using the method above
2. Update the `JWT_SECRET` environment variable
3. Restart the backend server
4. **Note:** All existing user sessions will be invalidated

#### MongoDB Credentials Rotation
1. Log into MongoDB Atlas
2. Go to Database Access → Edit user
3. Generate a new password
4. Update `MONGO_URI` in your environment
5. Restart the backend server
6. Verify database connectivity

### Secret Storage Best Practices

#### Development
- Use `.env` files (already in `.gitignore`)
- Never commit `.env` files to version control
- Use `.env.example` as a template without real values

#### Production
- Use your hosting platform's secret management:
  - **Vercel**: Environment Variables in project settings
  - **Railway**: Variables tab in service settings
  - **Heroku**: Config Vars in app settings
  - **AWS**: Secrets Manager or Parameter Store
  - **Azure**: Key Vault
- Enable secret scanning in your GitHub repository
- Use encrypted secrets for CI/CD pipelines

### Security Checklist

Before deploying to production:

- [ ] All secrets are in environment variables (not code)
- [ ] `.env` is in `.gitignore`
- [ ] `NODE_ENV` is set to `production`
- [ ] CORS is configured with specific frontend URL
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] MongoDB connection uses TLS
- [ ] No debug/development logs in production

## Security Features

### Implemented Protections

| Feature | Description |
|---------|-------------|
| Rate Limiting | IP and user-based limits on all endpoints |
| Input Validation | Schema-based validation with express-validator |
| Password Hashing | bcrypt with salt rounds |
| JWT Authentication | Secure token-based auth with expiration |
| Helmet.js | HTTP security headers |
| CORS | Configured allowed origins |
| NoSQL Injection Prevention | Query sanitization |
| XSS Prevention | Input sanitization |

### HTTP Security Headers (via Helmet)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (in production)
- `Content-Security-Policy`
