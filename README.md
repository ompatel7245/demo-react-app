# Star Wars Character Finder

A simple React application to browse and filter characters from the Star Wars universe using the [SWAPI](https://swapi.dev/) API.

## Features
- Search characters by name (with value debouncing)
- Filter by homeworld, species, and films
- View character details in a modal (including their starships and vehicles)
- Basic login/logout flow with session persistence
- Responsive layout using Bootstrap 5
- API caching to avoid redundant fetches

## Setup
1. Clone the project and navigate into the directory.
2. Run `npm install` to get the dependencies.
3. Run `npm start` to launch the app on `localhost:3000`.

## Login Credentials
Use these to log in:
- **Email**: `ompatel@gmail.com`
- **Password**: `Test@123`

## Project Info
This project was built to test React state management, filtering logic, and API integration. It uses `yup` for login validation and a custom caching utility for the SWAPI data.
