# Resume Figma

A resume project built with React 18+ and Vite, ready to connect with Figma Make.

## Prerequisites

- Node.js 16+ and npm
- A Figma account with access to Figma Make

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build the project for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Connecting to Figma Make

This repository is properly initialized and ready to connect with Figma Make:

1. **In Figma:**
   - Open your Figma file
   - Access Figma Make from the menu
   - Go to Settings

2. **Connect GitHub:**
   - Authorize the Figma GitHub app
   - Select this repository (`plgs2005/resume_figma`)
   - Link it to your Figma Make project

3. **Push Code:**
   - Make changes in Figma
   - Use Figma Make to generate React components
   - Push the generated code to this repository

4. **Develop:**
   - Pull the latest changes from GitHub
   - Run `npm install` to install any new dependencies
   - Run `npm run dev` to see your Figma designs as working code

## Project Structure

```
resume_figma/
├── public/           # Static assets
├── src/              # Source files
│   ├── App.jsx       # Main App component
│   ├── App.css       # App styles
│   ├── main.jsx      # Application entry point
│   └── index.css     # Global styles
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite configuration
└── README.md         # This file
```

## Features

- ⚡️ React 18 with Vite for fast development
- 🎨 Ready for Figma Make integration
- 📦 ES Modules support
- 🔥 Hot Module Replacement (HMR)
- 🏗️ Optimized production builds

## License

ISC