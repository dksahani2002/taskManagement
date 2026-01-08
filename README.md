
# **Project Overview**

A Task Management backend API built with  **Node.js** ,  **TypeScript** , and  **MongoDB** , following **Clean Architecture** principles.
The system manages  **tasks** ,  **users** ,  **audit trails** , and **scheduled background jobs** in a scalable and maintainable way.

---

## Architecture: Clean Architecture

The codebase is organized into layered architecture with strict dependency rules:

```
Interface Adapters (Controllers, Routes, Middlewares)
        ↓
Application Layer (Use Cases, DTOs, Ports)
        ↓
Domain Layer (Entities, Business Rules, Errors)
        ↓
Infrastructure Layer (MongoDB, Agenda Scheduler, Logger)
```

### Core Principles

* Inner layers **do not depend on outer layers**
* Business logic is **isolated in the Domain layer**
* Infrastructure implements **interfaces (ports)** defined in the Application layer
* Frameworks and databases are **replaceable**

---

## Key Features

### 1. Task Management

* CRUD operations for tasks
* Task lifecycle:
  `OPEN → ASSIGNED → COMPLETED / CANCELLED`
* Business rules enforced at the domain level:
  * Tasks must be assigned before completion
  * Only the assignee can complete a task
  * Completed tasks cannot be modified

---

### 2. User Management

* User CRUD operations
* Soft delete support (`deletedAt` timestamp)
* Deleted users cannot be assigned to tasks

---

### 3. Scheduled Background Jobs (Agenda)

Three types of background jobs:

* **Due Date Reminder**
  Notifies assignees before task due dates
* **Overdue Escalation**
  Logs escalation when tasks pass their due date
* **Auto-Close Stale Tasks**
  Automatically completes tasks that remain `OPEN` for too long

**Job Characteristics**

* Persistent (survive application restarts)
* Idempotent (safe against duplicate execution)

---

### 4. Audit Trail

* Complete history of all task-related actions
* Two audit types:
  * `USER` – manual actions
  * `SYSTEM` – automated/job-driven actions
* Stored in a dedicated `task_audits` collection
* Transactional consistency:
  * Task updates and audit records are written atomically

---

## Technology Stack

* **Runtime:** Node.js with TypeScript
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose
* **Job Scheduler:** Agenda (MongoDB-backed)
* **Validation:** Joi
* **Architecture:** Clean Architecture with dependency injection

---

## Project Structure

```
src/
├── domain/                 # Core business logic
│   ├── entities/           # Task, User, TaskAudit
│   ├── enums/              # TaskStatus, TaskPriority, etc.
│   └── errors/             # Domain-specific errors
│
├── application/            # Use cases & orchestration
│   ├── usecases/           # Business operations
│   ├── dto/                # Data transfer objects
│   └── ports/              # Repository interfaces
│
├── infrastructure/         # External concerns
│   ├── db/                 # MongoDB models & repositories
│   └── scheduler/          # Agenda job handlers
│
├── interfaceAdapters/      # API layer
│   ├── controllers/        # Request handlers
│   ├── routes/             # Express routes
│   └── middlewares/        # Validation & error handling
│
├── shared/                 # Cross-cutting concerns
│   ├── errors/             # Application-level errors
│   └── logger/             # Logging utilities
│
├── container.ts            # Dependency injection setup
├── app.ts                  # Express app configuration
└── index.ts                # Application entry point
```

---

## Design Highlights

* **Domain-Driven Design**
  Business rules are encapsulated within domain entities
* **Dependency Injection**
  Use cases receive dependencies via constructors
* **Layered Error Handling**
  Domain → Application → HTTP error mapping
* **Transactional Safety**
  Task updates and audit writes are atomic
* **Idempotent Jobs**
  Background job handlers prevent duplicate executions

---

## API Endpoints

* `GET /api/users` – User management
* `GET /api/tasks` – Task management
* `GET /api/audit` – Audit history retrieval

---

## Summary

This project demonstrates a **production-grade Clean Architecture implementation** with a strong focus on:

* Maintainability
* Testability
* Clear separation of concerns
* Scalable background processing
