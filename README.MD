# Crowdsourced Civic Issue Reporting and Resolution System
## Smart India Hackathon 2025 Submission

## 📌 General Details
**Organization:** Government of Jharkhand  
**Department:** Department of Higher and Technical Education  
**Category:** Software  
**Theme:** Clean & Green Technology  

## 📝 Problem Statement
**Title:** Crowdsourced Civic Issue Reporting and Resolution System  

### Background
Local governments in India face persistent challenges in timely identification, prioritization, and resolution of daily civic issues such as:
- Potholes and damaged roads
- Malfunctioning streetlights
- Garbage overflow from bins
- Blocked drainage and sanitation problems

While citizens face these problems directly, the absence of efficient reporting and tracking mechanisms limits municipal responsiveness.

### Need
A streamlined, mobile-first civic issue reporting system that empowers citizens to submit incidents with photos, locations, and descriptions in real-time, while enabling municipalities to efficiently track, assign, and resolve them.

## 🚀 Proposed Solution
Our solution consists of two interconnected components:

### 1. Citizen Interface
Mobile/web client that allows citizens to:
- Report issues with a photo, description, category, and geolocation.
- Track their issue’s status across the lifecycle (Submitted → In Progress → Resolved).
- Get alerts/updates about progress.

### 2. Administrative Interface
Web-based portal for municipal staff to:
- View reported issues on a map or list.
- Filter by category, status, or department.
- Receive auto-routed issues mapped to departments based on category.
- Update statuses and assign tasks for resolution.

## 🏗️ Backend System
This repository contains the backend APIs powering the citizen-facing and admin-facing applications.

### Core Functions Implemented
- **REST APIs** for:
  - Department Management
  - Issue Reporting & Tracking
  - Auto-routing logic based on issue category → department.
- Strong validation to ensure clean data entry.
- Workflow support for issue lifecycle with enums:
  - SUBMITTED
  - IN_PROGRESS
  - RESOLVED
  - REJECTED
- Scalable structure with Spring Boot + JPA + PostgreSQL.

## 🛠️ Tech Stack
- **Language:** Java 17
- **Framework:** Spring Boot 3.x
- **Database:** PostgreSQL
- **ORM:** Hibernate (Spring Data JPA)
- **Validation:** Hibernate Validator (JSR-380)
- **Build Tool:** Maven
- **API Testing:** Postman / Curl

## 📂 Project Structure
```
sih/
└── src/main/java/com/example/sih
    ├── controller/ # REST controllers (API endpoints)
    │   ├── DepartmentController.java
    │   └── IssueReportController.java
    │
    ├── entity/ # JPA entities (tables)
    │   ├── Department.java
    │   └── IssueReport.java
    │
    ├── repository/ # Spring Data JPA repositories
    │   ├── DepartmentRepository.java
    │   └── IssueReportRepository.java
    │
    ├── service/ # Business logic
    │   ├── DepartmentService.java
    │   └── IssueReportService.java
    │
    ├── types/ # Enum types
    │   ├── IssueCategory.java
    │   └── Status.java
    │
    ├── exception/ # Global exception handling
    └── SihApplication.java # Spring Boot application entry point
```

## ⚙️ Features & Specifications
### Departments
Each department handles a defined issue category:
- Roads → Public Works
- Sanitation → Sanitation Dept.
- Lighting → Electrical Maintenance

### Issues
Each issue contains:
- Description
- Location → Latitude & Longitude
- Optional photo (URL)
- Category (ROADS, SANITATION, LIGHTING, etc.)
- Status (defaults to SUBMITTED, can be updated later)
- Auto-assigned to matching Department.

### Supported Workflows
- Update issue status: SUBMITTED → IN_PROGRESS → RESOLVED / REJECTED
- List issues by status
- List issues by category
- Department-level reporting

## 🌐 API Endpoints
### 🔹 Department APIs
- **POST /api/departments** → Create new department
- **GET /api/departments** → Retrieve all departments
- **GET /api/departments/{id}** → Retrieve department by ID

**Example Request:**
```json
{
  "name": "Sanitation Department",
  "categoryHandled": "SANITATION"
}
```

### 🔹 Issue APIs
- **POST /api/issues** → Create new issue
- **GET /api/issues** → Retrieve all issues
- **GET /api/issues/{id}** → Retrieve specific issue
- **PATCH /api/issues/{id}/status?newStatus=IN_PROGRESS** → Change issue status
- **GET /api/issues/status/{status}** → Filter issues by status
- **GET /api/issues/category/{category}** → Filter issues by category

**Example Request:**
```json
{
  "description": "Overflowing garbage bins near central park",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "photoUrl": "http://example.com/bin.jpg",
  "category": "SANITATION"
}
```

## ▶️ Local Setup
1. **Clone project:**
   ```bash
   git clone https://github.com/your-username/sih-backend.git
   cd sih-backend
   ```

2. **Setup PostgreSQL:**
   ```sql
   CREATE DATABASE civic_issues_db;
   ```

3. **Update credentials (application.properties):**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/civic_issues_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

4. **Run Application:**
   ```bash
   mvn spring-boot:run
   ```

5. **Test APIs with Curl/Postman:**
   ```bash
   curl -X POST http://localhost:8081/api/issues \
     -H "Content-Type: application/json" \
     -d '{"description":"Pothole","latitude":12.9,"longitude":77.6,"category":"ROADS"}'
   ```

## 🔮 Future Enhancements
- Push Notifications / WebSockets → for citizen updates.
- Interactive Dashboard → issue heatmaps, priority metrics.
- Mobile App for Workers → direct assignment and resolution reporting.
- AI-based Prioritization → infer urgency from citizen input.
- Cloud storage for media → AWS S3 / Cloudinary for photos and videos.
- Analytics & Reports → departmental efficiency and response times.

## 🏆 Impact
This project provides the digital bridge between citizens and municipalities. It enables:
- ✔️ Better engagement and transparency
- ✔️ Faster reporting-to-resolution loop
- ✔️ Smarter and cleaner cities

### Theme Contribution: Clean & Green Technology
By empowering citizens and ensuring quick government response, the project directly improves urban cleanliness, sanitation, and civic infrastructure.