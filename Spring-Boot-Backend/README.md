# GeoView Spring Boot Backend

This is the Spring Boot backend for the GeoView application, providing REST API endpoints for user authentication and country management.

## 🚀 Features

- **User Authentication**: Register, login, logout with JWT tokens
- **User Profile Management**: Get and update user profiles
- **Favorite Countries**: Add, remove, and manage favorite countries
- **Security**: Spring Security with JWT authentication
- **Database**: H2 (development) / MySQL (production) with JPA
- **CORS**: Configured for frontend integration

## 📋 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user

### User Management (`/api/users`)

- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `POST /favorites` - Add country to favorites (protected)
- `DELETE /favorites/{countryCode}` - Remove country from favorites (protected)
- `GET /getall/favorite` - Get all favorite countries (protected)

## 🛠️ Technology Stack

- **Spring Boot 3.2.0**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **JWT (jsonwebtoken)** - Token-based authentication
- **H2 Database** - In-memory database for development
- **MySQL** - Production database support
- **Maven** - Dependency management

## 🔧 Configuration

### Database Configuration

**Development (H2):**

```properties
spring.datasource.url=jdbc:h2:mem:geoviewdb
spring.h2.console.enabled=true
```

**Production (MySQL):**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/geoviewdb
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### JWT Configuration

```properties
geoview.app.jwtSecret=your_secret_key
geoview.app.jwtExpirationMs=604800000  # 7 days
```

## 🏃‍♂️ Running the Application

### Prerequisites

- Java 17 or higher
- Maven 3.6+

### Steps

1. Clone the repository
2. Navigate to the Spring-Boot-Backend directory
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
4. The server will start on `http://localhost:5000`

### H2 Console (Development)

Access the H2 database console at: `http://localhost:5000/h2-console`

- JDBC URL: `jdbc:h2:mem:geoviewdb`
- Username: `sa`
- Password: `password`

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/geoview/
│   │   ├── GeoViewBackendApplication.java
│   │   ├── config/
│   │   │   └── WebSecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   └── UserController.java
│   │   ├── dto/
│   │   │   ├── SignUpRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── JwtResponse.java
│   │   │   ├── MessageResponse.java
│   │   │   └── AddFavoriteRequest.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   └── FavoriteCountry.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   ├── security/
│   │   │   ├── AuthTokenFilter.java
│   │   │   ├── JwtUtils.java
│   │   │   └── UserPrincipal.java
│   │   └── service/
│   │       └── UserDetailsServiceImpl.java
│   └── resources/
│       └── application.properties
└── test/
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Cross-origin request handling
- **Cookie-based Tokens**: HttpOnly cookies for enhanced security
- **Session Management**: Stateless authentication

## 🔄 Migration from Node.js

This Spring Boot backend is a complete replacement for the Node.js/Express backend with equivalent functionality:

- **MongoDB → JPA/H2**: Database migration with preserved data structure
- **Express Routes → Spring Controllers**: RESTful API endpoints
- **Mongoose Models → JPA Entities**: Object-relational mapping
- **JWT Authentication**: Maintained token-based auth system
- **CORS Configuration**: Cross-origin support preserved

## 🚀 Deployment

### Development

```bash
mvn spring-boot:run
```

### Production (JAR)

```bash
mvn clean package
java -jar target/geoview-backend-1.0.0.jar
```

### Docker (Optional)

```dockerfile
FROM openjdk:17-jre-slim
COPY target/geoview-backend-1.0.0.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📞 API Usage Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"123456"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Add Favorite Country (requires authentication)

```bash
curl -X POST http://localhost:5000/api/users/favorites \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token" \
  -d '{"countryCode":"US","countryName":"United States","flagUrl":"https://..."}'
```

## 🤝 Frontend Integration

The backend is configured to work with the React frontend running on:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

CORS is properly configured to allow credentials and support the existing frontend authentication flow.

---

**Note**: This Spring Boot backend maintains 100% API compatibility with the original Node.js backend, ensuring seamless frontend integration without any changes required to the React application.
