# SmartCare CMS Backend

SmartCare CMS is a comprehensive healthcare management system with role-based access for patients, doctors, receptionists, lab technicians, and administrators.

## Features

- **Role-based Access Control**: Different views and permissions for patients, doctors, receptionists, lab technicians, and admins
- **Appointment Management**: Book, schedule, and manage appointments with online meeting support
- **Medical History**: Store and share patient medical history
- **Lab Reports**: Upload and manage lab reports with sharing capabilities
- **Billing System**: Generate bills for appointments and lab tests
- **Queue Management**: Doctor queue system for managing patients
- **Admin Approval**: Admin approval system for doctors, receptionists, and lab technicians

## Architecture

- **Backend**: .NET 9 Web API
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Email Service**: MailKit for sending notifications

## Setup

1. Install .NET 9 SDK
2. Install MongoDB
3. Clone the repository
4. Navigate to the backend directory: `cd backend/SmartCareCMS.API`
5. Update the connection string in `appsettings.json`
6. Run the application: `dotnet run`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get specific user
- `PUT /api/users/{id}/approve` - Approve user registration
- `PUT /api/users/{id}/reject` - Reject user registration
- `GET /api/users/pending-approvals` - Get pending approvals

### Appointments
- `GET /api/appointments` - Get appointments
- `GET /api/appointments/{id}` - Get specific appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Delete appointment
- `GET /api/appointments/doctor/{doctorId}/availability` - Get doctor availability

### Medical History
- `GET /api/medicalhistory` - Get medical histories
- `GET /api/medicalhistory/{id}` - Get specific medical history
- `POST /api/medicalhistory` - Create medical history
- `PUT /api/medicalhistory/{id}` - Update medical history
- `DELETE /api/medicalhistory/{id}` - Delete medical history
- `POST /api/medicalhistory/{id}/share` - Share medical history

### Lab Reports
- `GET /api/labreports` - Get lab reports
- `GET /api/labreports/{id}` - Get specific lab report
- `POST /api/labreports` - Create lab report
- `PUT /api/labreports/{id}` - Update lab report
- `DELETE /api/labreports/{id}` - Delete lab report
- `POST /api/labreports/{id}/status` - Update lab report status
- `POST /api/labreports/{id}/share` - Share lab report

### Billing
- `GET /api/billing` - Get billing records
- `GET /api/billing/{id}` - Get specific billing record
- `POST /api/billing` - Create billing record
- `PUT /api/billing/{id}` - Update billing record
- `DELETE /api/billing/{id}` - Delete billing record
- `POST /api/billing/{id}/payment` - Record payment
- `GET /api/billing/stats` - Get billing statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Queue (Doctor)
- `GET /api/queue/doctor/{doctorId}` - Get doctor's queue
- `POST /api/queue/doctor/{doctorId}/call-next` - Call next patient
- `POST /api/queue/appointment/{appointmentId}/complete` - Complete appointment
- `POST /api/queue/appointment/{appointmentId}/cancel` - Cancel appointment

## Roles

- **Patient**: Can book appointments, view medical history, and lab reports
- **Doctor**: Can accept appointments, view patient history, upload patient records, manage queue
- **Receptionist**: Can handle appointments, check doctor availability, generate bills
- **Lab Technician**: Can upload lab reports, accept reports from doctors, generate bills
- **Admin**: Can approve/reject registrations, view all data

## Security

- JWT tokens for authentication
- Role-based authorization
- Password hashing with BCrypt
- Input validation

## Configuration

Update the `appsettings.json` file with your MongoDB connection string and email settings:

```json
{
  "ConnectionStrings": {
    "MongoDBConnection": "your-mongodb-connection-string"
  },
  "JwtSettings": {
    "Secret": "your-jwt-secret-key"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": "587",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "your-email@gmail.com"
  }
}
```

## Running the Application

```bash
cd backend/SmartCareCMS.API
dotnet run
```

The API will be available at `https://localhost:5001` and `http://localhost:5000`.

## Frontend Integration

This backend is designed to work with the existing React frontend in the main project directory. The frontend can connect to this API using the appropriate endpoints.