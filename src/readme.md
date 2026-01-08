
## Project Overview

A Task Management backend API built with Node.js, TypeScript, and MongoDB, following Clean Architecture. It manages tasks, users, and scheduled background jobs.

## Architecture: Clean Architecture

The codebase is organized into layers with clear dependency rules:

**Interface Adapters (Controllers, Routes, Middlewar**es)

    ↓

**Application Layer (Use Cases, DTOs)**

    ↓

**Domain Layer (Entities, Business Rules, Errors)**

    ↓

**Infrastructure Layer (MongoDB, Agenda Scheduler, L**ogger)

* Inner layers don't depend on outer layers
* Business logic is isolated in the domain layer
* Infrastructure implements ports/interfaces defined in the application layer

## Key Features

### 1. Task Management

* CRUD operations for tasks
* Task lifecycle: OPEN → ASSIGNED → COMPLETED or CANCELLED
* Business rules enforced in the domain:
* Tasks must be assigned before completion
* Only the assignee can complete a task
* Completed tasks cannot be modified

### 2. User Management

* User CRUD operations
* Soft delete (users marked with deletedAt timestamp)
* Deleted users cannot be assigned to tasks

### 3. Scheduled Background Jobs (Agenda)

Three job types:* Due Date Reminder: Notifies assignees before due dates

* Overdue Escalation: Logs escalation when tasks pass due date
* Auto-Close Stale Tasks: Automatically completes tasks that remain OPEN too long

Jobs are persistent (survive restarts) and idempotent.

### 4. Audit Trail

* Complete history of all task actions
* Two audit types: USER (manual actions) and SYSTEM (automated actions)
* Stored in separate task_audits collection
* Transactional consistency (task updates + audit writes)

## Technology Stack

* Runtime: Node.js with TypeScript
* Framework: Express.js
* Database: MongoDB with Mongoose
* Job Scheduler: Agenda (MongoDB-backed)
* Validation: Joi
* Architecture: Clean Architecture with dependency injection

## Project Structure

**src/**

**|── domain/              # Core business logic**

    entities/        # Task, User, TaskAudit

    enums/          # TaskStatus, TaskPriority, etc.

    errors/         # Domain-specific errors



***|── application/         # Use cases & *orchestration****

    usecases/       # Business operations

    dto/            # Data transfer objects

    ports/          # Repository interfaces


**├── infrastructure/      # External concerns**

    db/             # MongoDB models &  repositories

    scheduler/      # Agenda job handlers


**├── interfaceAdapters/  # API layer**

 controllers/    # Request handlers

    routes/         # Express routes

    middlewares/    # Validation, error handling

**└── shared/             # Cross-cutting concerns**

    errors/         # Application errors

    logger/         # Logging utilities

└──container.ts   #dependencies injection

└──Index.ts	#root file to start server , agenda, mongoDb

└──app.ts		#APP build


## Design Highlights

1. Domain-driven design: Business rules live in domain entities
2. Dependency injection: Use cases receive dependencies via constructor
3. Error handling: Layered error types (Domain → Application → HTTP)
4. Transactions: Task updates and audit writes are atomic
5. Idempotency: Job handlers prevent duplicate executions

## API Endpoints

* /api/users - User management
* /api/tasks - Task management
* /api/audit - Audit history retrieval

The project demonstrates Clean Architecture principles with a focus on maintainability, testability, and separation of concerns.
