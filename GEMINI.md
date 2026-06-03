# Bhasantar Frontend

## Project Overview

This is the frontend for Bhasantar, a web application for translating legal documents from English to Indian regional languages. It's built with React.js and Vite, using Tailwind CSS for styling. The application features a rich text editor using Quill.js and integrates with Firebase for user authentication.

The project is structured to support different user roles, including 'user', 'admin', 'superAdmin', and 'QA', each with different levels of access and functionality.

## Building and Running

### Prerequisites

*   Node.js (LTS version)
*   npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

1.  Create a `.env` file in the root of the project with the necessary Firebase configuration and backend API URL.
2.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build, run:

```bash
npm run build
```

This will create a `dist` directory with the optimized and minified files.

### Linting

To run the linter, use:

```bash
npm run lint
```

## Development Conventions

*   The project uses `react-router-dom` for routing, with private routes for role-based access control.
*   Global state is managed using React Context, with providers for authentication, notifications, and instance information.
*   Styling is done with Tailwind CSS. The configuration is in `tailwind.config.js` and `postcss.config.js`.
*   The project uses an alias `@` for the `src` directory in imports.
*   The backend API URL is configured in `src/main.jsx` and in the `.env` file.
*   Deployment is done to Google App Engine using `gcloud app deploy`. The configuration for the deployment is in the `app.yaml` file.
*   Continuous integration is set up with Vercel. The configuration for the deployment is in the `vercel.json` file.
