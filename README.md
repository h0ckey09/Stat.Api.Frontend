# Stat API Frontend

A React frontend application for connecting to the Stat API backend server at https://www.statresearch.com:3001.

## Features

- **Authentication System**: Login/logout functionality with token management
- **Dashboard**: Main interface with profile information and quick actions
- **API Explorer**: Interactive tool to discover and test backend endpoints
- **Material-UI Design**: Modern, responsive user interface
- **Axios Integration**: HTTP client with automatic authentication headers
- **React Router**: Client-side routing for single-page application experience

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Authentication component
│   ├── Dashboard.js      # Main dashboard view
│   ├── ApiExplorer.js    # API testing interface
│   └── Navbar.js         # Navigation bar
├── contexts/
│   └── AuthContext.js    # Authentication state management
├── services/
│   └── apiService.js     # API communication layer
├── App.js                # Main application component
└── index.js              # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at http://localhost:3000.

### Building for Production

```bash
npm run build
```

## Backend Integration

The application is configured to connect to:
- **Backend URL**: https://www.statresearch.com:3001
- **Proxy Configuration**: Enabled in package.json for development
- **Authentication**: Bearer token authentication with automatic header injection

## Features Overview

### Authentication
- Login form with username/password
- Automatic token storage in localStorage
- Protected routes that redirect to login when unauthenticated
- Automatic token inclusion in API requests

### API Explorer
- Discover common API endpoints automatically
- Test GET, POST, PUT, DELETE requests
- View formatted JSON responses
- Error handling with detailed feedback
- Quick access to common endpoint patterns

### Dashboard
- User profile information
- Connection status
- Quick navigation to other features

## API Service Configuration

The API service (`src/services/apiService.js`) includes:
- Axios instance with base URL configuration
- Request interceptor for authentication headers
- Response interceptor for error handling
- Methods for common operations
- Endpoint discovery functionality

## Authentication Flow

1. User enters credentials on login page
2. Frontend sends credentials to `/auth/login` endpoint
3. Backend returns JWT token
4. Token stored in localStorage and included in subsequent requests
5. Protected routes check for token presence
6. Automatic logout on 401 responses

## Development Notes

Since the backend requires authentication, you'll need:
1. Valid credentials for your Stat API backend
2. Proper CORS configuration on the backend server
3. SSL certificate (backend uses HTTPS)

## Common Endpoints to Explore

The API Explorer includes quick buttons for:
- `/api` - Main API base
- `/auth/login` - Authentication
- `/auth/profile` - User profile
- `/health` - Health check
- `/status` - Server status

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend includes the frontend domain in its CORS configuration.

### SSL Certificate Issues
The backend uses HTTPS. If using self-signed certificates in development, you may need to accept the certificate in your browser.

### Authentication Errors
If getting "Unauthorized" responses, verify:
1. Backend server is running and accessible
2. Credentials are correct
3. Authentication endpoints match your backend implementation

## Customization

To adapt this frontend for your specific backend:

1. **Update API endpoints** in `src/services/apiService.js`
2. **Modify authentication flow** in `src/contexts/AuthContext.js`
3. **Customize UI components** in the `src/components/` directory
4. **Add new routes** in `src/App.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
