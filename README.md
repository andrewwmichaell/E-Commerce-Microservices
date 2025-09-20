# E-Commerce Microservices Platform

A comprehensive e-commerce platform built with microservices architecture using Java Spring Boot, .NET Core, and Angular with PrimeNG.

## 🏗️ Architecture Overview

This platform consists of multiple microservices:

### Java Spring Boot Services
- **Discovery Service (Eureka)** - Service registry and discovery
- **API Gateway** - Routes requests and handles cross-cutting concerns
- **Auth Service** - User authentication and JWT token management
- **Product Service** - Product catalog management (MySQL)
- **Order Service** - Order processing and management (PostgreSQL)

### .NET Core Services
- **Cart Service** - Shopping cart with Redis TTL logic
- **Payment Service** - Payment processing (SQL Server)

### Frontend
- **Angular + PrimeNG** - Modern single-page application

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17+ (for local development)
- .NET 8.0 (for local development)
- Node.js 18+ (for frontend development)

### Running with Docker Compose

1. **Clone and navigate to the project directory:**
   ```bash
   cd "task 4.1"
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:4200
   - API Gateway: http://localhost:8080
   - Eureka Dashboard: http://localhost:8761

### Manual Setup (Development)

#### 1. Start Databases
```bash
# Start required databases using Docker
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=productdb -e MYSQL_USER=productuser -e MYSQL_PASSWORD=productpass -p 3306:3306 mysql:8.0

docker run -d --name postgres-auth -e POSTGRES_DB=authdb -e POSTGRES_USER=authuser -e POSTGRES_PASSWORD=authpass -p 5432:5432 postgres:13

docker run -d --name postgres-order -e POSTGRES_DB=orderdb -e POSTGRES_USER=orderuser -e POSTGRES_PASSWORD=orderpass -p 5433:5432 postgres:13

docker run -d --name redis -p 6379:6379 redis:7-alpine

docker run -d --name sqlserver -e SA_PASSWORD=PaymentPass123! -e ACCEPT_EULA=Y -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest
```

#### 2. Start Java Services
```bash
# Start Discovery Service
cd discovery-service
mvn spring-boot:run

# Start Auth Service (in new terminal)
cd auth-service
mvn spring-boot:run

# Start Product Service (in new terminal)
cd product-service
mvn spring-boot:run

# Start Order Service (in new terminal)
cd order-service
mvn spring-boot:run

# Start API Gateway (in new terminal)
cd api-gateway
mvn spring-boot:run
```

#### 3. Start .NET Services
```bash
# Start Cart Service
cd cart-service
dotnet run

# Start Payment Service (in new terminal)
cd payment-service
dotnet run
```

#### 4. Start Frontend
```bash
cd frontend
npm install
npm start
```

## 🔧 Service Details

### Discovery Service (Port 8761)
- Eureka server for service registration and discovery
- All services register with this service

### API Gateway (Port 8080)
- Routes requests to appropriate microservices
- Handles CORS and load balancing
- Entry point for all client requests

### Auth Service (Port 8081)
- User registration and login
- JWT token generation and validation
- PostgreSQL database

### Product Service (Port 8082)
- Product catalog management
- CRUD operations for products
- MySQL database

### Order Service (Port 8083)
- Order creation and management
- Order status tracking
- PostgreSQL database

### Cart Service (Port 5001)
- Shopping cart management
- Redis with TTL (Time To Live) logic:
  - Default: 24 hours
  - After order: 7 days
  - After payment: Permanent

### Payment Service (Port 5002)
- Payment processing simulation
- Order payment tracking
- SQL Server database

### Frontend (Port 4200)
- Angular SPA with PrimeNG components
- JWT authentication
- Shopping cart management
- Order and payment flows

## 🗄️ Database Schema

### Auth Service (PostgreSQL)
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
```

### Product Service (MySQL)
```sql
CREATE TABLE products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500)
);
```

### Order Service (PostgreSQL)
```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(order_id),
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);
```

### Payment Service (SQL Server)
```sql
CREATE TABLE Payments (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    UserId BIGINT NOT NULL,
    Status VARCHAR(50) NOT NULL,
    PaymentDate DATETIME2 NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    PaymentMethod VARCHAR(100),
    TransactionId VARCHAR(100),
    Notes VARCHAR(1000)
);
```

## 🔐 Authentication Flow

1. User registers/logs in through Auth Service
2. JWT token is generated and returned
3. Frontend stores token in localStorage
4. All subsequent requests include JWT in Authorization header
5. API Gateway validates JWT before forwarding requests

## 🛒 Cart TTL Logic

The cart service implements sophisticated TTL (Time To Live) logic:

1. **Default State**: Cart items expire after 24 hours
2. **Order Placed**: Cart TTL extended to 7 days
3. **Payment Successful**: Cart items become permanent (no expiry)

This ensures:
- Users have time to complete their purchase
- Cart data is preserved during the order process
- Successful payments result in permanent cart history

## 🧪 Testing the Application

### 1. Register a New User
- Navigate to http://localhost:4200/register
- Create a new account

### 2. Browse Products
- View available products on the home page
- Add items to cart

### 3. Manage Cart
- View cart items with quantities
- Update quantities or remove items
- See TTL information

### 4. Place Order
- Proceed to checkout
- Fill in shipping information
- Place order (extends cart TTL to 7 days)

### 5. Process Payment
- Enter payment details
- Process payment (makes cart permanent)
- View order confirmation

### 6. View Order History
- Check order status
- View past orders

## 📊 Monitoring

- **Eureka Dashboard**: http://localhost:8761
- **Service Health**: Each service exposes health endpoints
- **Logs**: Check Docker logs for debugging

## 🔧 Configuration

### Environment Variables
- Database connection strings
- JWT secret keys
- Service discovery URLs
- Redis connection strings

### Port Configuration
- Discovery: 8761
- API Gateway: 8080
- Auth Service: 8081
- Product Service: 8082
- Order Service: 8083
- Cart Service: 5001
- Payment Service: 5002
- Frontend: 4200

## 🚀 Deployment

### Production Considerations
1. Use environment-specific configuration
2. Implement proper secret management
3. Set up monitoring and logging
4. Configure load balancers
5. Implement circuit breakers
6. Set up health checks

### Scaling
- Each service can be scaled independently
- Use container orchestration (Kubernetes)
- Implement horizontal pod autoscaling
- Use managed databases for production

## 🛠️ Development

### Adding New Features
1. Create new microservice or extend existing ones
2. Register with Eureka
3. Update API Gateway routes
4. Add frontend components
5. Update documentation

### Code Structure
- Each service is independently deployable
- Shared models and DTOs
- Consistent error handling
- Comprehensive logging

## 📝 API Documentation

### Auth Service
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/validate` - Token validation

### Product Service
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Order Service
- `POST /orders` - Create order
- `GET /orders/user/{userId}` - Get user orders
- `GET /orders/{id}` - Get order by ID
- `PUT /orders/{id}/status` - Update order status

### Cart Service
- `GET /cart/{userId}` - Get cart items
- `POST /cart/add` - Add item to cart
- `PUT /cart/{userId}/items/{itemId}/quantity` - Update quantity
- `DELETE /cart/{userId}/items/{itemId}` - Remove item
- `POST /cart/{userId}/extend-expiry` - Extend cart TTL

### Payment Service
- `POST /payment/process` - Process payment
- `GET /payment/{id}` - Get payment by ID
- `GET /payment/order/{orderId}` - Get payments by order
- `POST /payment/{id}/refund` - Refund payment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review the logs
3. Check service health endpoints
4. Create an issue in the repository

---

**Note**: This is a demonstration project. For production use, implement proper security measures, error handling, monitoring, and testing.
