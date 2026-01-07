# SmartCare Health Hub

A comprehensive healthcare management system with role-based access for patients, doctors, receptionists, lab technicians, and administrators.

## Project Structure

This project consists of two main parts:

1. **Frontend**: React application built with Vite, TypeScript, shadcn-ui, and Tailwind CSS
2. **Backend**: .NET 9 Web API with MongoDB database

## Features

- **Role-based Access Control**: Different views and permissions for patients, doctors, receptionists, lab technicians, and admins
- **Appointment Management**: Book, schedule, and manage appointments with online meeting support
- **Medical History**: Store and share patient medical history
- **Lab Reports**: Upload and manage lab reports with sharing capabilities
- **Billing System**: Generate bills for appointments and lab tests
- **Queue Management**: Doctor queue system for managing patients
- **Admin Approval**: Admin approval system for doctors, receptionists, and lab technicians

## Backend Setup

The backend is located in the `backend/` directory. To set it up:

1. Install .NET 9 SDK
2. Install MongoDB
3. Navigate to the backend directory: `cd backend/SmartCareCMS.API`
4. Update the connection string in `appsettings.json`
5. Run the application: `dotnet run`

## Frontend Setup

The frontend uses Node.js and npm. To set it up:

```sh
# Install the necessary dependencies.
npm i

# Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Technologies Used

### Backend
- .NET 9 Web API
- MongoDB
- JWT Authentication
- MailKit for email notifications

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## API Endpoints

The backend provides a comprehensive REST API. See the backend README for full API documentation.

## Architecture

The system follows a microservices-like architecture with:
- Separate backend service for business logic and data management
- React frontend for user interface
- MongoDB for data persistence
- JWT for authentication and authorization
