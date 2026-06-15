[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=23874533&assignment_repo_type=AssignmentRepo)

# Venue Vendors — COSC2758 Assignment 2

**GitHub Repository:** https://github.com/rmit-fsd-2026-s1/a2-fsd-pra01-02-wed-6-30pm-alex-team-24

## Production URLs (Render)
- Frontend: _TBA_
- Backend API: _TBA_
- Admin Frontend: _TBA_
- Admin Backend (GraphQL): _TBA_

## How to Run Locally

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:3002`

### Frontend
```bash
npm install
npm start
```
Runs on `http://localhost:3001`

### Admin Backend
```bash
cd admin-backend
npm install
npm run dev
```
Runs on `http://localhost:4000`

### Admin Frontend
```bash
cd admin-frontend
npm install
npm start
```
Runs on `http://localhost:3003`

## Environment Variables

`backend/.env` needs: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `PORT`

`admin-backend/.env` needs: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `PORT`

## References
- COSC2758 lectorial slides and practical materials (RMIT University, 2026)
- Assignment 1 codebase used as starting point
