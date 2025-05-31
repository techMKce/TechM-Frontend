# UMP Frontend

This repository contains the frontend code for the UMP (User Management Platform) application. It is built using modern web technologies to provide a responsive and intuitive user interface.

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite:** A fast development build tool for modern web projects.
*   **Tailwind CSS:** A utility-first CSS framework for rapid styling.
*   **React Router:** A standard library for routing in React applications.\
*   **Axios:** A promise-based HTTP client for the browser and Node.js.

## Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/ump-frontend.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd ump-frontend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
# or
yarn dev
```

This will start the development server at `http://localhost:5173` (or another available port). The application will hot-reload as you make changes to the code.

### Building for Production

To build the application for production, run:

```bash
npm run build
# or
yarn build
```

This will generate a `dist` directory containing the optimized production build.

### Running the Production Build

To serve the production build locally, you can use a tool like `serve`:

```bash
npm install -g serve
serve -s dist
```

## Project Structure
