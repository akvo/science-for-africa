# Science of Africa

## 🚀 Quick Start

### Development Mode
```bash
# Start all services
docker compose up

# Access your application:
# - Frontend: http://localhost:3000
# - Strapi Admin: http://localhost:1337/admin
# - API Documentation: http://localhost:1337/documentation
# - Database Admin: http://localhost:5050
# - Mail Server: http://localhost:8025
```

### Production Simulation
```bash
# Build and run production-like environment
docker compose -f compose.mimic-prod.yml up --build

# Access via Nginx reverse proxy:
# - Application: http://localhost
# - CMS: http://localhost/cms
```

## 📁 Project Structure

```
${PROJECT_DIR}/
├── backend/                    # Strapi CMS
│   ├── __tests__/             # Backend test files
│   │   ├── helpers/           # Test utilities
│   │   ├── api/               # API endpoint tests
│   │   ├── controllers/       # Controller tests
│   │   └── models/            # Model/Service tests
│   ├── config/                # Strapi configuration
│   ├── src/                   # API routes and controllers
│   ├── scripts/               # Startup and utility scripts
│   ├── jest.config.js         # Jest configuration
│   ├── Dockerfile             # Production build
│   └── Dockerfile-dev         # Development build
├── frontend/                  # Next.js Application
│   ├── __tests__/             # Frontend test files
│   │   ├── components/        # Component tests
│   │   ├── lib/               # Utility tests
│   │   ├── pages/             # Page tests
│   │   └── __snapshots__/     # Jest snapshots
│   ├── src/                   # Application source code
│   ├── jest.config.js         # Jest configuration
│   ├── jest.setup.js          # Jest setup file
│   ├── Dockerfile             # Production build
│   └── docker-entrypoint.sh   # Runtime environment injection
├── nginx/                     # Nginx reverse proxy
│   └── conf.d/                # Nginx configuration
├── db/                        # Database initialization
│   └── docker-entrypoint-initdb.d/
├── pgadmin4/                  # Database administration
├── TESTING.md                 # Testing documentation
├── compose.yml                # Development environment
└── compose.mimic-prod.yml     # Production simulation
```

## 🔧 Development

### Services Overview

| Service  | Port | Description |
|----------|------|-------------|
| Frontend | 3000 | Next.js development server |
| Backend  | 1337 | Strapi CMS with hot reload |
| Database | 5432 | PostgreSQL with persistent storage |
| PgAdmin  | 5050 | Database administration interface |
| Mailpit  | 8025 | Email testing and preview |

### Backend (Strapi)
- **URL**: http://localhost:1337
- **Admin Panel**: http://localhost:1337/admin
- **API Endpoint**: http://localhost:1337/api
- **File Uploads**: Persistent volume mounted
- **Hot Reload**: Enabled via volume mounts

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled with fast refresh
- **API Proxy**: Configured to backend
- **Environment Variables**: Runtime injection

### Database (PostgreSQL)
- **Host**: localhost:5432
- **Database**: ${PROJECT_DIR}
- **Username**: akvo
- **Password**: password
- **Admin Interface**: http://localhost:5050

### Email Testing (Mailpit)
- **SMTP**: localhost:1025
- **Web Interface**: http://localhost:8025
- **Features**: Email preview, testing, debugging

## 📦 Available Commands

### Development
```bash
# Start development environment
docker compose up

# View logs
docker compose logs -f [service_name]

# Rebuild specific service
docker compose up --build [service_name]

# Stop all services
docker compose down

# Reset database (destructive)
docker compose down -v
```

### Production Simulation
```bash
# Build and start production environment
docker compose -f compose.mimic-prod.yml up --build

# Scale services
docker compose -f compose.mimic-prod.yml up --scale frontend=2

# View production logs
docker compose -f compose.mimic-prod.yml logs
```

### Database Operations
```bash
# Access database directly
docker compose exec db psql -U akvo -d ${PROJECT_DIR}

# Backup database
docker compose exec db pg_dump -U akvo ${PROJECT_DIR} > backup.sql

# Restore database
cat backup.sql | docker compose exec -T db psql -U akvo -d ${PROJECT_DIR}
```

### Data Seeding
The project includes a comprehensive data seeder that populates the database with realistic test data and programmatically synchronizes API permissions (RBAC).

```bash
# Run seeder (standard method)
docker compose exec backend npm run seed
```

**Features:**
- **Programmatic RBAC**: Automatically sets up permissions for all roles (Guest, Member, Expert, etc.) based on the [RBAC Specification](agent_docs/features/api-auth-rbac.md).
- **Realistic Data**: Generates institutions, users, communities, forums, and resources using Faker.
- **Production Barrier**: Prevents accidental data loss. To run in production, you must set `ALLOW_SEED=true`.

## 🛠️ Configuration

### Environment Variables

#### Backend Configuration
- `DATABASE_*`: PostgreSQL connection settings
- `JWT_SECRET`: Authentication token secret
- `APP_KEYS`: Strapi application keys
- `SMTP_*`: Email server configuration
- `GCS_*`: Google Cloud Storage (optional)

#### Frontend Configuration
- `NEXT_PUBLIC_BACKEND_URL`: API endpoint URL
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry

### Email Configuration
The setup includes Mailpit for email testing:
- SMTP server runs on port 1025
- Web interface available at http://localhost:8025
- All emails are captured and can be viewed in the interface

## 🚢 Deployment

### Production Checklist
- [ ] Update all environment variables with production values
- [ ] Configure SSL certificates in Nginx
- [ ] Set up proper database credentials
- [ ] Configure external storage (GCS/S3) for file uploads
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Environment-Specific Builds
```bash
# Build production images
docker build -t ${PROJECT_DIR}-backend ./backend
docker build -t ${PROJECT_DIR}-frontend ./frontend
docker build -t ${PROJECT_DIR}-nginx ./nginx

# Push to registry
docker tag ${PROJECT_DIR}-backend your-registry/${PROJECT_DIR}-backend:latest
docker push your-registry/${PROJECT_DIR}-backend:latest
```

## 🔐 Security Considerations

### Development
- Default credentials are used for convenience
- All services are exposed on localhost
- Debug mode is enabled

### Production
- Change all default passwords and secrets
- Use environment variables for sensitive data
- Implement proper SSL/TLS
- Configure firewall rules
- Enable audit logging

## 🧪 Testing

This project includes comprehensive testing infrastructure for both backend and frontend.

### Quick Start
```bash
# Run all backend tests
cd backend && npm test

# Run all frontend tests
cd frontend && npm test

# Run tests in Docker
docker compose exec backend npm test
docker compose exec frontend npm test
```

### Backend Testing (Jest + Supertest)

**Test Scripts:**
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci       # Run tests in CI mode
```

**Test Structure:**
```
backend/__tests__/
├── helpers/
│   ├── setup.js      # Test environment setup
│   └── strapi.js     # Strapi test utilities
├── api/
│   ├── health.test.js   # API endpoint tests
│   └── auth.test.js     # Authentication tests
├── controllers/
│   └── example.test.js  # Controller tests
└── models/
    └── example.test.js  # Model/Service tests
```

**Example Test:**
```javascript
const request = require('supertest');
const { setupStrapi, getStrapi } = require('../helpers/strapi');

describe('API Endpoint', () => {
  beforeAll(async () => await setupStrapi());

  it('should return data', async () => {
    const strapi = getStrapi();
    const response = await request(strapi.server.httpServer)
      .get('/api/your-endpoint')
      .expect(200);
    expect(response.body.data).toBeDefined();
  });
});
```

### Frontend Testing (Jest + React Testing Library)

**Test Scripts:**
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:update   # Update snapshots
npm run test:ci       # Run tests in CI mode
```

**Test Structure:**
```
frontend/__tests__/
├── components/
│   ├── Button.test.jsx        # Component unit tests
│   ├── Card.snapshot.test.jsx # Snapshot tests
│   └── Form.interaction.test.jsx # Interaction tests
├── lib/
│   ├── strapi.test.js         # Utility function tests
│   └── test-utils.jsx         # Custom test utilities
└── pages/
    └── Home.test.jsx          # Page component tests
```

**Test Types Included:**
- **Unit Tests**: Test individual components and functions
- **Interaction Tests**: Test user interactions with @testing-library/user-event
- **Snapshot Tests**: Catch unintended UI changes

**Example Test:**
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Coverage Reports
After running \`npm run test:coverage\`, view reports at:
- Backend: \`backend/coverage/lcov-report/index.html\`
- Frontend: \`frontend/coverage/lcov-report/index.html\`

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: cd backend && npm ci && npm run test:ci
    - run: cd frontend && npm ci && npm run test:ci
```

For detailed testing documentation, see [TESTING.md](TESTING.md).

## 📚 Documentation

### Key Technologies
- [Strapi v4](https://docs.strapi.io/) - Headless CMS
- [Next.js 14](https://nextjs.org/docs) - React Framework
- [PostgreSQL 16](https://www.postgresql.org/docs/) - Database
- [Docker](https://docs.docker.com/) - Containerization
- [Nginx](https://nginx.org/en/docs/) - Reverse Proxy

### API Documentation

The Science for Africa API is fully documented using Swagger/OpenAPI v3.
- **Interactive Playground**: http://localhost:1337/documentation
- **OpenAPI JSON**: http://localhost:1337/documentation/v1/openapi.json
- **GraphQL playground**: http://localhost:1337/graphql (if enabled)

## 🆘 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check for port usage
lsof -i :3000
lsof -i :1337
lsof -i :5432

# Kill processes if needed
npx kill-port 3000 1337 5432
```

#### Database Connection Issues
```bash
# Reset database
docker compose down -v
docker compose up db
# Wait for database to be ready, then start other services
```

#### Image Build Issues
```bash
# Clean Docker cache
docker system prune -f
docker builder prune -f

# Rebuild without cache
docker compose build --no-cache
```

#### Permission Issues
```bash
# Fix file permissions (if needed)
sudo chown -R $USER:$USER .
```

### Logs and Debugging
```bash
# View all logs
docker compose logs

# Follow specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Debug mode
DEBUG=* docker compose up
```

## 🤝 Contributing

### Development Workflow
1. Make changes to source code
2. Test locally with `docker compose up`
3. Verify production build with `docker compose -f compose.mimic-prod.yml up`
4. Submit pull request

### Code Style
- Backend: Follow Strapi conventions
- Frontend: Use Prettier and ESLint
- Commit messages: Follow conventional commits

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 Next Steps

1. **Content Modeling**: Create your content types in Strapi admin
2. **Frontend Development**: Build your pages and components
3. **API Integration**: Connect frontend to Strapi API
4. **Authentication**: Implement user authentication if needed
5. **Deployment**: Configure production environment

**Happy coding! 🚀**
