# Finance Analysis Dashboard 📈

A comprehensive personal finance management and analytics application built with a **Spring Boot** backend and a **React/Vite** frontend. Track your spending, set financial goals, manage transactions, and visualize your financial health in real-time.

---

## 🛠️ Tech Stack

### Frontend (`/finance-dashboard`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend (`/finance`)
- **Framework**: Spring Boot 3.5.x (Java 21)
- **Database**: PostgreSQL (Spring Data JPA)
- **Caching**: Redis (Spring Boot Cache)
- **Security**: Spring Security + JWT Authentication
- **Emails**: Spring Boot Starter Mail (SMTP)

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have the following installed on your local machine:
- **Java 21**
- **Node.js** (v18 or higher)
- **PostgreSQL**
- **Redis**

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd finance
   ```

2. Update `src/main/resources/application.properties` with your local database credentials if they differ from the defaults:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/finance_analytics
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   
   # Provide your Gmail credentials for Forgot Password features
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```

3. Run the Spring Boot application using the Maven wrapper:
   ```bash
   # On Windows
   .\mvnw.cmd spring-boot:run
   
   # On Mac/Linux
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8081`.

### 2. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd finance-dashboard
   ```

2. Install the Node dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `finance-dashboard` directory (optional for local dev, as it defaults to localhost):
   ```env
   VITE_API_URL=http://localhost:8081/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

---

## ☁️ Deployment

This repository is configured for a split-hosting deployment:
- **Backend**: Hosted on [Railway](https://railway.app)
- **Frontend**: Hosted on [Vercel](https://vercel.com)

### Backend Deployment (Railway)
1. Import this repository into Railway.
2. In the Railway Service settings, set the **Root Directory** to `/finance`.
3. Add a PostgreSQL database and a Redis service in your Railway project.
4. In your `finance` service variables, add the following (using Railway's reference variables):
   - `SPRING_DATASOURCE_URL`: `jdbc:${{Postgres.DATABASE_URL}}`
   - `SPRING_DATASOURCE_USERNAME`: `${{Postgres.PGUSER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{Postgres.PGPASSWORD}}`
   - `SPRING_DATA_REDIS_HOST`: `${{Redis.REDISHOST}}`
   - `SPRING_DATA_REDIS_PORT`: `${{Redis.REDISPORT}}`
   - `SPRING_DATA_REDIS_PASSWORD`: `${{Redis.REDISPASSWORD}}`
   - `SPRING_MAIL_USERNAME`: `<your-email>`
   - `SPRING_MAIL_PASSWORD`: `<your-app-password>`

### Frontend Deployment (Vercel)
1. Import this repository into Vercel.
2. Set the **Root Directory** to `finance-dashboard`. Vercel will automatically detect the Vite framework.
3. Add an Environment Variable:
   - `VITE_API_URL`: `<Your-Railway-Backend-URL>/api`
4. Click Deploy! A `vercel.json` is already included to handle React Router navigation automatically.

---

## 📄 License
This project is licensed under the MIT License.
