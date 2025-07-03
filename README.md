# Cryptocurrency Platform (In Development)

## Overview
This project is a microservices-based back-end system designed to support a future cryptocurrency transaction platform. Currently, it includes services for secure authentication, user management, file storage, OTP verification, notifications, and real-time coin data. Transaction functionality is planned for future development. The system is built with scalability and security in mind, leveraging modern technologies like Spring Boot, Kafka, and Redis.

## Technologies
- **Languages**: Java
- **Frameworks**: Spring Boot, Spring Cloud, Spring Security (JWT, OAuth2)
- **Databases**: MySQL, MongoDB, Redis
- **Tools**: Docker, Kafka, AWS S3, Maven, Postman
- **Other**: WebSocket, CoinGecko API

## Architecture
The platform follows a microservices architecture with an API Gateway for secure request routing. Each service is designed to handle a specific functionality, communicating via REST APIs or Kafka for asynchronous messaging.

### Services
1. **Identity Service**  
   Manages user authentication and authorization using JWT-based access/refresh tokens with token versioning for password resets and two-factor authentication. Integrates OAuth2 for Google and GitHub login. Uses MySQL for storage and Redis for caching token versions.

2. **API Gateway**  
   Routes external requests to internal services, enforcing token validation via introspection to the Identity Service. Ensures internal services are not exposed externally for enhanced security.

3. **Profile Service**  
   Handles user profile management, storing data in MongoDB. Supports avatar uploads by integrating with the File Service.

4. **File Service**  
   Manages file storage on AWS S3, supporting public/private uploads and image resizing. Metadata is stored in MongoDB.

5. **OTP Service**  
   Generates and verifies OTPs using MongoDB TTL indexes with rate-limiting to prevent spam. Integrates with Notification Service via Kafka for OTP delivery.

6. **Notification Service**  
   Processes notifications (e.g., OTPs) via Kafka, delivering emails using SendGrid with templated messages.

7. **Coin Service**  
   Fetches real-time cryptocurrency prices from CoinGecko API, streaming data via WebSocket and caching in Redis for performance.

8. **Common Module**  
   Provides shared utilities and classes for consistent service communication.

## Setup and Installation
1. **Prerequisites**:
   - Java 17, Maven, Docker
   - MySQL, MongoDB, Redis, Kafka
   - AWS account with S3 access
   - SendGrid and CoinGecko API keys

2. **Steps**:
   ```bash
   # Clone the repository
   git clone https://github.com/hieund18/trading-crypto-platform.git

   # Navigate to project directory
   cd trading-crypto-platform

   # Configure environment variables (e.g., database credentials, API keys) in application.yml
   cp src/main/resources/application-example.yml src/main/resources/application.yml
   ```

3. **Access**:
   - API Gateway: `http://localhost:8888`
   - Test endpoints using Postman.

## Future Plans
- Implement transaction processing for cryptocurrency trades.
- Enhance security with additional audit logging and monitoring.
- Optimize performance for high-throughput transaction scenarios.

## Current Status
The project is in active development, with core services operational and transaction features planned for future iterations.

## Contact
For questions or contributions, reach out at hieund.forwork@gmail.com