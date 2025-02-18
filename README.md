# Secure File Sharing App

## Overview
The **Secure File Sharing App** is a full-stack web application that allows users to upload, share, and manage files securely. It is built using Django for the backend and React with Vite for the frontend, containerized using Docker.

## Features
- User authentication and authorization
- Secure file upload and storage
- Role-based access control
- Encrypted file sharing
- Activity logs for tracking user actions
- Dockerized setup for easy deployment

## Tech Stack
- **Backend:** Django, SQLite (or PostgreSQL for production)
- **Frontend:** React with Vite, Tailwind CSS
- **Database:** SQLite (default) or PostgreSQL
- **Containerization:** Docker & Docker Compose

---

## Installation & Setup
### Prerequisites
Ensure you have the following installed on your system:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Clone the Repository
```sh
git clone https://github.com/yourusername/SecureFileSharingApp.git
cd SecureFileSharingApp
```

### Set Up Environment Variables
Create a `.env` file inside the `backend/` directory and configure the required variables:
```ini
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=*
```

---

## Running the Application with Docker

### **Step 1: Build and Start Containers**
```sh
docker compose up --build
```
This will start the backend (Django) and frontend (React) services.

### **Step 2: Apply Migrations**
After the containers are running, apply database migrations:
```sh
docker exec -it django_backend python manage.py migrate
```

### **Step 3: Create a Superuser (Admin Access)**
```sh
docker exec -it django_backend python manage.py createsuperuser
```

### **Step 4: Access the Application**
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Django Admin:** [http://localhost:8000/admin](http://localhost:8000/admin)

---

## Project Structure
```
SecureFileSharingApp/
│── backend/         # Django backend
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   ├── your_django_project/
│── frontend/        # React frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│── docker-compose.yml
│── .env
```

---

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST   | `/api/auth/login/` | User login |
| POST   | `/api/auth/register/` | User registration |
| POST   | `/api/files/upload/` | Upload a file |
| GET    | `/api/files/list/` | List user files |
| GET    | `/api/files/download/<file_id>/` | Download a file |

---

## Troubleshooting
### **Issue: React Frontend Not Loading**
- Ensure **Vite** is configured to expose the server externally. Update `vite.config.js`:
```js
server: {
  host: '0.0.0.0',
  port: 5173,
  strictPort: true
}
```
- Restart the frontend container:
```sh
docker compose restart frontend
```

### **Issue: Django Backend Not Running**
- Check logs:
```sh
docker logs django_backend
```
- Restart backend:
```sh
docker compose restart backend
```

---

## Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

---

## License
This project is licensed under the **MIT License**.

---

## Contact
For questions or feedback, reach out at **your.email@example.com**.

---

🚀 Happy Coding! 🎯

