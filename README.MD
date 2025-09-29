# Civic Issues Backend

## Overview

This is the backend system for a Civic Issue Reporting application designed to streamline the process of reporting and managing civic problems such as potholes, garbage accumulation, street lighting issues, and water leaks. The system serves multiple stakeholders:

- **Citizens**: Use a mobile app (built with React Native) to submit reports with descriptions, locations (latitude/longitude), optional photos, and categories.
- **Departments**: Issues are automatically assigned based on categories (e.g., Roads, Waste Management). Departments can update issue statuses through the system.
- **Admins**: Access an analytics dashboard (built with React.js) to view statistics like active/resolved issues, leaderboards, average resolution times, and time-series data for cities, localities, and departments.

The backend is built with Spring Boot and Java, providing RESTful APIs for issue management, analytics, and administrative tasks. It uses PostgreSQL for data storage, ensuring robust handling of issue lifecycles, real-time counters for performance optimization, and recalculations to maintain data integrity.

### Problem Solved
- Creates a unified channel for collecting civic reports, ensuring reliability and traceability.
- Tracks issue lifecycles: SUBMITTED → IN_PROGRESS → RESOLVED/REJECTED.
- Maintains efficient counters to avoid performance bottlenecks in analytics queries.
- Supports leaderboards, summaries, and metrics for better oversight.
- Provides admin tools to recalculate and correct any data drifts between counters and actual issue data.

This backend digitizes civic issue management, promoting transparency for citizens, accountability for departments, and data-driven decisions for admins.

## Features

### Core Functionality
- **Issue Reporting and Lifecycle Management**:
    - Citizens can create issues with descriptions, geolocations, photos, and categories.
    - Automatic routing to relevant departments based on issue category.
    - Status updates (e.g., from SUBMITTED to RESOLVED) with timestamp tracking.
    - Location updates (relocation to different cities/localities) with counter adjustments.
    - Issue deletion with proper counter decrements.

- **Entity Management**:
    - Create, read, update, and delete cities, localities, and departments.
    - Search functionalities for cities and localities by name.

- **Analytics and Insights**:
    - Leaderboards for cities, localities, and departments based on metrics like ACTIVE, RESOLVED, or TOTAL issues.
    - Summaries including active/resolved counts, total issues, average resolution hours, and resolution rates.
    - Time-series data for daily new issues.

- **Counter System**:
    - Real-time counters (activeIssueCount, resolvedIssueCount) stored directly on City, Locality, and Department entities for O(1) access.
    - Incremental updates during issue creation, status changes, relocations, and deletions.
    - Avoids expensive COUNT(*) queries for analytics.

- **Recalculation Service**:
    - Admin endpoints to resync counters with actual issue data from the database, ensuring consistency in case of bugs or data drifts.

- **Error Handling**:
    - Centralized exception handling for validation errors (400), not found (404), and internal errors (500).
    - Returns JSON error responses with field-specific messages.

- **Data Seeding**:
    - Initial data.sql script inserts sample cities, localities, departments, and random issues with varied statuses.
    - Post-insertion updates to compute initial counters.

### Design Choices and Nuances
- **Performance Optimization**: Counters are updated transactionally via a dedicated CounterService to ensure fast analytics without querying large issue tables.
- **Eventual Consistency Handling**: RecalculationService acts as a safety net, using aggregate queries to recompute counters.
- **Status Transitions**: Only handled through CounterService to maintain counter accuracy (e.g., SUBMITTED/IN_PROGRESS count as active; RESOLVED/REJECTED as resolved).
- **Resolution Metrics**: Average resolution time uses PostgreSQL's EXTRACT(EPOCH) for precise calculations, excluding REJECTED issues.
- **Validation**: Enforced via Jakarta Validation annotations on DTOs and entities (e.g., @NotNull, @NotBlank).
- **DTO Separation**: Prevents lazy-loading issues and ensures clean API responses.
- **Native Queries**: Used for temporal arithmetic in metrics due to Hibernate limitations.

## Technologies Used

- **Framework**: Spring Boot 3.x (for REST APIs, dependency injection, and embedded Tomcat).
- **Language**: Java 17+.
- **Database**: PostgreSQL (with JPA/Hibernate for ORM).
- **Build Tool**: Maven (pom.xml manages dependencies).
- **Dependencies**:
    - Spring Boot Starter Web: For REST endpoints.
    - Spring Boot Starter Data JPA: For database persistence.
    - PostgreSQL Driver: JDBC connection.
    - Lombok: Reduces boilerplate code (@Data, @Builder, etc.).
    - Jakarta Validation + Hibernate Validator: For input validation.
    - Spring Boot Starter Test: For unit/integration tests.
- **Enums**: Status (SUBMITTED, IN_PROGRESS, RESOLVED, REJECTED) and IssueCategory (ROADS, SANITATION, LIGHTING, WASTE, WATER).
- **Other**: Transactional services for atomic operations, custom JPA queries for aggregations.

## Prerequisites

- Java JDK 17 or higher.
- Maven 3.6+.
- PostgreSQL 13+ (with a database created, e.g., `civic_issues_db`).
- Git (for cloning the repository).

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/civic-issues-backend.git
cd civic-issues-backend
```

### 2. Configure Database
- Create a PostgreSQL database:
  ```sql
  CREATE DATABASE civic_issues_db;
  ```
- Update `src/main/resources/application.properties` with your database credentials:
  ```properties
  spring.datasource.url=jdbc:postgresql://localhost:5432/civic_issues_db
  spring.datasource.username=your_username
  spring.datasource.password=your_password
  spring.jpa.hibernate.ddl-auto=update  # Or 'create' for initial setup
  spring.jpa.show-sql=true  # Optional: Logs SQL queries
  ```
- The application will automatically create tables via JPA on startup. Data seeding happens via `data.sql` if `spring.sql.init.mode=always`.

### 3. Build the Project
```bash
mvn clean install
```

### 4. Run the Application
```bash
mvn spring-boot:run
```
- The server starts on `http://localhost:8081` (configurable in `application.properties`).
- Access Swagger UI (if enabled) or use Postman for testing APIs.

### 5. Testing
- Run unit/integration tests:
  ```bash
  mvn test
  ```
- Sample data is seeded on startup for development.

## API Endpoints

All endpoints are prefixed with `/api/` and return JSON. Use tools like Postman or curl for testing.

### Issues (/api/issues)
- **Create Issue**: `POST /api/issues`
    - Body Example:
      ```json
      {
        "description": "Pothole near Lalpur Chowk",
        "latitude": 23.36,
        "longitude": 85.33,
        "photoUrl": "http://example.com/pothole.jpg",
        "category": "ROADS",
        "cityId": 1,
        "localityId": 1
      }
      ```
    - Response: Created issue DTO (201 Created).

- **Update Status**: `PATCH /api/issues/{id}/status?status=RESOLVED`
    - Updates status and adjusts counters.
    - Response: Updated issue DTO.

- **Update Location**: `PATCH /api/issues/{id}/location`
    - Body Example:
      ```json
      {
        "cityId": 2,
        "localityId": 5
      }
      ```
    - Adjusts counters for old/new locations.

- **Delete Issue**: `DELETE /api/issues/{id}`
    - Response: 204 No Content.

### Cities (/api/cities)
- **Create City**: `POST /api/cities`
    - Body Example:
      ```json
      {
        "name": "Ranchi",
        "area": 182,
        "population": 1304858
      }
      ```

- **Get City by ID**: `GET /api/cities/{id}`

- **Search Cities**: `GET /api/cities/search?name=ran`

- **Delete City**: `DELETE /api/cities/{id}`

- **Recalculate Counters**: `POST /api/cities/recalculate`

### Localities (/api/localities)
- **Create Locality**: `POST /api/localities`
    - Body Example:
      ```json
      {
        "name": "Lalpur",
        "city": {"id": 1}
      }
      ```

- **Get Locality by ID**: `GET /api/localities/{id}`

- **Get Localities by City**: `GET /api/localities/by-city/{cityId}`

- **Search Localities**: `GET /api/localities/search?name=Lal`

- **Delete Locality**: `DELETE /api/localities/{id}`

- **Recalculate Counters**: `POST /api/localities/recalculate`

### Departments (/api/departments)
- **Create Department**: `POST /api/departments`
    - Body Example:
      ```json
      {
        "name": "Water Supply Dept",
        "categoryHandled": "WATER"
      }
      ```

- **Get All Departments**: `GET /api/departments`

- **Get Department by ID**: `GET /api/departments/{id}`

- **Delete Department**: `DELETE /api/departments/{id}`

- **Recalculate Counters**: `POST /api/departments/recalculate`

### Analytics (/api/analytics)
- **City Leaderboard**: `GET /api/analytics/cities/leaderboard?metric=TOTAL&limit=5`
    - Metrics: ACTIVE, RESOLVED, TOTAL.

- **City Summary**: `GET /api/analytics/cities/{id}/summary`
    - Includes counts, avg resolution hours, resolution rate.

- **City Time-Series (New Issues)**: `GET /api/analytics/cities/{id}/timeseries/new-issues`

- **Locality Leaderboard**: `GET /api/analytics/localities/leaderboard?metric=ACTIVE&limit=5`

- **Locality Summary**: `GET /api/analytics/localities/{id}/summary`

- **Department Leaderboard**: `GET /api/analytics/departments/leaderboard?metric=RESOLVED&limit=5`

- **Department Summary**: `GET /api/analytics/departments/{id}/summary`

### Admin (/api/admin)
- **Recalculate Cities**: `POST /api/admin/recalculate/cities`
- **Recalculate Localities**: `POST /api/admin/recalculate/localities`
- **Recalculate Departments**: `POST /api/admin/recalculate/departments`

## Error Handling

- **400 Bad Request**: For validation failures (e.g., missing fields). Response includes error map.
- **404 Not Found**: For non-existent entities.
- **500 Internal Server Error**: For unexpected issues.
- All errors return JSON with details.

## Usage Workflow Example

1. Citizen reports an issue: `POST /api/issues` → Status SUBMITTED, counters incremented.
2. Department updates: `PATCH /api/issues/{id}/status?status=IN_PROGRESS`.
3. Resolution: `PATCH /api/issues/{id}/status?status=RESOLVED` → Counters adjusted, resolvedAt set.
4. Admin views summary: `GET /api/analytics/cities/{id}/summary`.
5. If needed, recalculate: `POST /api/admin/recalculate/cities`.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/new-feature`.
3. Commit changes: `git commit -m 'Add new feature'`.
4. Push to branch: `git push origin feature/new-feature`.
5. Open a Pull Request.

Please follow code style guidelines and add tests for new features.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact

For questions, reach out to [anishrajdmk@gmail.com] or open an issue on GitHub.