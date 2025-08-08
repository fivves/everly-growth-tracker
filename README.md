# Everly Growth Tracker

A React-based milestone tracking application for tracking personal growth and development goals.

## Features

- **Milestone Management**: Create, track, and manage personal milestones
- **Progress Tracking**: Mark milestones as "Did It", "Learning", or "Mastered"
- **Archive System**: Archive completed milestones for future reference
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Framer Motion for animations

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Docker Deployment (frontend + API)

This application includes Docker support for easy deployment to your homelab server.

#### Prerequisites

- Docker
- Docker Compose

#### Quick Deployment

1. **Clone the repository** to your homelab server
2. **Run the deployment script**:
   ```bash
   # On Linux/Mac
   ./deploy.sh
   
   # On Windows
   deploy.bat
   ```

3. **Access the application** at `http://your-server-ip:9378`
   - The frontend is served by Nginx
   - The API is proxied at `/api` and persists data on a Docker volume (`everly-data`)

#### Manual Deployment

```bash
# Build and start the application (frontend + API)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Configuration

- **Port**: The application runs on port 9378 by default
- **Health Check**: Available at `/health` endpoint
- **Static Assets**: Optimized with caching and compression
- **Security**: Includes security headers and CSP configuration

### Environment Variables

No environment variables are required for basic deployment. The application uses local storage for data persistence.

## Project Structure

```
src/
server/              # Minimal Node/Express API storing state on disk
├── components/          # Reusable UI components
├── features/
│   └── milestones/     # Milestone tracking feature
│       ├── components/ # Milestone-specific components
│       ├── store.ts    # Zustand state management
│       └── types.ts    # TypeScript type definitions
└── App.tsx            # Main application component
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
