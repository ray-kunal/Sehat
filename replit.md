# Migrant Worker Health Surveillance System

## Overview

This is a comprehensive health surveillance system designed for tracking and managing the health of migrant workers. The application provides a complete healthcare management solution with patient registration, health record tracking, disease surveillance, and reporting capabilities. Built as a full-stack web application, it serves healthcare workers and administrators in monitoring worker health, tracking disease patterns, and generating health reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Components**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theme configuration
- **Form Handling**: React Hook Form with Zod validation
- **Component Structure**: Modular component architecture with separate page components and reusable UI components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture with organized route handlers
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with structured error responses
- **Development**: Vite integration for development server with HMR support

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Centralized schema definitions with TypeScript types
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection Pooling**: Neon serverless connection pooling for scalability

### Database Schema Design
- **Users**: Healthcare worker authentication and authorization
- **Patients**: Migrant worker registration with comprehensive demographic data
- **Health Records**: Medical checkup records with symptoms, diagnosis, and treatment
- **Diseases**: Disease catalog with classification and tracking capabilities
- **Disease Cases**: Individual disease occurrence tracking linked to patients
- **Health Alerts**: Surveillance alert system for health emergencies
- **Enums**: Structured data types for health status, gender, severity levels, and disease types

### Authentication and Authorization
- **Session Management**: Session-based authentication with PostgreSQL session store
- **User Roles**: Role-based access control for healthcare workers
- **Security**: Secure session handling with HTTP-only cookies

### API Structure
- **Dashboard**: Aggregate statistics and health surveillance data
- **Patient Management**: CRUD operations for patient registration and management
- **Health Records**: Medical record creation, retrieval, and management
- **Disease Tracking**: Disease case management and surveillance
- **Health Alerts**: Alert creation and notification system
- **Reports**: Data export and reporting functionality

### Development Tools and Configuration
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Development Experience**: Hot module replacement, error overlays, and development banners
- **Path Aliases**: Organized import structure with @ aliases for clean code organization

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection Library**: @neondatabase/serverless for database connectivity

### UI and Styling Dependencies
- **Radix UI**: Comprehensive set of accessible React components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for component variant management

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Data Fetching and State Management
- **TanStack React Query**: Server state management and caching
- **Date-fns**: Date manipulation and formatting utilities

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking and enhanced developer experience
- **TSX**: TypeScript execution for development server

### Session and Security
- **Connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Session middleware for user authentication

### Development-specific (Replit Integration)
- **Replit Plugins**: Development banner, cartographer, and runtime error modal for enhanced Replit development experience