# Stat.Api.Frontend
A simple frontend (temporary until Helix is done) for accessing some of the UI components of the API server.

## Project Structure

This is a React-based frontend application with Bootstrap 5 integrated locally.

```
Stat.Api.Frontend/
├── public/              # Static files
│   └── index.html       # HTML entry point
├── src/                 # Source code
│   ├── assets/          # Static assets
│   │   ├── css/         # CSS files (Bootstrap 5)
│   │   └── js/          # JavaScript files (Bootstrap 5)
│   ├── components/      # React components
│   │   └── Header.js    # Example header component
│   ├── styles/          # Custom styles
│   │   └── main.css     # Main stylesheet
│   ├── utils/           # Utility functions
│   ├── App.js           # Main App component
│   └── index.js         # Application entry point
├── .babelrc             # Babel configuration
├── .gitignore           # Git ignore rules
├── package.json         # Project dependencies
└── webpack.config.js    # Webpack configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm start
```

This will start the webpack dev server at `http://localhost:3000` and automatically open your browser.

### Build

Create a production build:
```bash
npm run build
```

The build output will be in the `dist/` directory.

## Bootstrap 5

Bootstrap 5 CSS and JavaScript files are included locally in:
- `src/assets/css/bootstrap.min.css` - Bootstrap CSS
- `src/assets/js/bootstrap.bundle.min.js` - Bootstrap JS with Popper

These files are imported in `src/index.js` and are available throughout the application.

## Features

- React 18.2.0
- Bootstrap 5.3.2 (local files)
- Webpack 5 for bundling
- Babel for JavaScript transpilation
- Hot Module Replacement for development
- Standard React project structure

