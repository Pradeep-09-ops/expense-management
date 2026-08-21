# Expense Management System

A full-stack **Expense Management System** built using the **MERN stack**. The application allows users to create groups, add members, manage group details, and provides a structured backend API with Swagger documentation.

## 🚀 Features

* User authentication using JWT
* User registration and login
* Create expense groups
* Add members to groups
* View group details
* Display group members
* Protected API routes
* RESTful backend APIs
* Swagger API documentation
* React-based frontend
* MongoDB database integration
* Environment variable configuration
* Responsive and clean UI

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* dotenv
* CORS
* Swagger / OpenAPI

### Development Tools

* Git & GitHub
* VS Code
* Postman
* Swagger UI

## 📁 Project Structure

```text
Expense_Management/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── services/
│   ├── swagger/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Expense_Management
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> Do not commit the `.env` file to GitHub. It is already included in `.gitignore`.

## ▶️ Running the Project

### Start the Backend

From the `backend` directory:

```bash
npm start
```

or, if using nodemon:

```bash
npm run dev
```

### Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

The backend will normally run at:

```text
http://localhost:3000
```

## 📚 API Documentation

The backend APIs are documented using **Swagger UI**.

Once the backend server is running, open:

```text
http://localhost:3000/api-docs/
```

Swagger provides an interactive interface for viewing and testing the available API endpoints.

## 🔑 Authentication

The application uses **JWT-based authentication**.

After successful login:

1. The backend generates a JWT token.
2. The frontend stores the authentication information.
3. The token is sent with protected API requests.
4. Backend middleware verifies the token before allowing access to protected resources.

## 👥 Group Management

Authenticated users can:

* Create a new group
* Add members to a group
* View group information
* View group members
* Navigate between groups and their details

The group system is designed as the foundation for future expense-sharing functionality.

## 🗄️ Database

The project uses **MongoDB** as its database with **Mongoose** for schema definition and database interaction.

Main entities currently include:

* User
* Group
* Group Member

## 🔒 Security

The project follows basic security practices including:

* Password hashing
* JWT authentication
* Protected routes
* Environment variables for sensitive configuration
* `.gitignore` protection for secrets
* Input validation through backend logic

## 🔮 Future Enhancements

Planned functionality can include:

* Add and manage expenses
* Split expenses between group members
* Track individual balances
* Settlement and payment tracking
* Expense history
* Dashboard statistics
* Notifications
* Profile management
* Improved authorization and role-based permissions

## 👨‍💻 Author

**Pradeep Sharma**

Built as a full-stack web development project using the MERN stack.

## 📄 License

This project is for educational and development purposes.
