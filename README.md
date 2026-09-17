# ⚡ Image Processing & Transformation API

[![CI Backend Tests](https://github.com/sanjeevirajanramajayam/ImageProcessingAPI/actions/workflows/ci.yml/badge.svg)](https://github.com/sanjeevirajanramajayam/ImageProcessingAPI/actions/workflows/ci.yml)
[![CodeQL Security Scan](https://github.com/sanjeevirajanramajayam/ImageProcessingAPI/actions/workflows/codeql.yml/badge.svg)](https://github.com/sanjeevirajanramajayam/ImageProcessingAPI/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Sharp](https://img.shields.io/badge/Sharp-libvips-99CC00?style=for-the-badge&logo=sharp&logoColor=white)](https://sharp.pixelplumbing.com/)
[![AWS S3 / MinIO](https://img.shields.io/badge/Storage-S3_%2F_MinIO-orange?style=for-the-badge&logo=amazon-s3&logoColor=white)](https://min.io/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A high-performance, scalable image processing and delivery service inspired by **Cloudinary**. This platform delivers on-the-fly image transformations, AI-powered background removal, multi-tier deterministic caching (Redis + S3/MinIO), and a modern React web dashboard for interactive editing and asset management.

---

## 🌟 Highlights & Features

- **⚡ On-The-Fly Transformations**: Resize, crop with coordinate bounds, rotate, and convert formats (JPEG, PNG, WebP) dynamically via URL query parameters.
- **🎨 Visual Effects & Filters**: Grayscale conversion, vintage sepia tone tinting, and smart quality optimization.
- **🧠 AI Background Removal**: Automated neural-network background extraction powered by `rembg`.
- **🚀 Multi-Tier Caching Architecture**:
  - **Tier 1 (Redis)**: Sub-millisecond pre-signed URL redirects for previously requested transformation parameters.
  - **Tier 2 (S3/MinIO Object Storage)**: Transformed image assets are persisted under deterministic SHA-256 parameter hashes to eliminate redundant processing.
  - **Tier 3 (Sharp / libvips Pipeline)**: Ultra-fast native image manipulation pipeline when generating new variations.
- **🔄 Smart Cache Invalidation**: Automatic gallery cache versioning (`userImagesVersion:{userId}`) to ensure instantaneous synchronization on uploads and deletions.
- **🔐 Secure Authentication**: JWT Access Tokens with HTTP-only Refresh Token rotation, bcrypt password hashing, and role/user-scoped asset authorization.
- **🖼️ Interactive Web Dashboard**: Built with React 19, Tailwind CSS v4, and interactive crop selectors (`react-easy-crop`) for real-time visual transformation previews.
- **🐳 1-Command Docker Orchestration**: Full-stack multi-container setup including MariaDB, Redis, MinIO S3-compatible storage, Backend, and Frontend.

---

## 📐 System Architecture

```mermaid
flowchart TD
    Client(["🌐 Client / Browser / App"])

    subgraph AppServer ["Express 5 Backend (:4000)"]
        Router["API Router & Rate Limiter"]
        AuthMiddleware["JWT Authentication"]
        Controller["File & Transformation Controller"]
        SharpEngine["Sharp Processing Engine"]
        AIEngine["rembg Python Worker"]
    end

    subgraph CachingAndDB ["Data & Cache Layer"]
        Redis[("⚡ Redis Cache (:6379)\n- Signed URL Cache\n- Gallery Versioning\n- Rate Limit Store")]
        DB[("🗄️ MariaDB / MySQL (:3306)\nPrisma ORM")]
    end

    subgraph ObjectStorage ["Object Storage (:9000)"]
        S3Storage[("📦 AWS S3 / MinIO\n- Original Images\n- SHA-256 Cached Variants")]
    end

    Client -->|"1. GET /api/file/:id/transform?w=800&format=webp"| Router
    Router --> Controller
    
    Controller -->|"2. Check Redis URL Cache"| Redis
    Redis -- "Hit: Return cached 302 Redirect" --> Client

    Controller -->|"3. Miss: Check S3 for Hash Key"| S3Storage
    S3Storage -- "Hit: Generate Signed URL & Cache in Redis" --> Controller

    Controller -->|"4. Miss: Fetch Original Buffer"| S3Storage
    Controller -->|"5. Apply Sharp Ops / AI rembg"| SharpEngine
    SharpEngine -.->|"If remove_bg=true"| AIEngine
    SharpEngine -->|"6. Store Processed Image"| S3Storage
    Controller -->|"7. Cache URL in Redis"| Redis
    Controller -->|"8. 302 Redirect to Pre-signed S3 URL"| Client
```

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js with TypeScript & `tsx`
- **Framework**: Express 5
- **Image Processing**: Sharp (libvips), Python 3 (`rembg` for background removal)
- **Database & ORM**: MariaDB / MySQL / PostgreSQL with Prisma ORM
- **Object Storage**: AWS S3 SDK (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) / MinIO
- **Cache & Performance**: Redis (`redis` v5 client)
- **Security & Validation**: JSON Web Tokens (`jsonwebtoken`), `bcrypt`, `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `multer`
- **Testing**: Vitest, Supertest

### **Frontend**
- **Framework**: React 19
- **Bundler**: Parcel
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v6
- **UI Components**: `react-easy-crop`, Axios, Lucide-style interactive controls

---

## 🚀 Quick Start (Docker Compose)

The easiest way to get the entire ecosystem up and running with database, cache, MinIO S3, frontend, and backend is using Docker Compose.

### 1. Clone the repository
```bash
git clone https://github.com/sanjeevirajanramajayam/ImageProcessingAPI.git
cd ImageProcessingAPI
```

### 2. Configure Environment Files
Copy the example environment files:
```bash
cp .env-example .env
cp backend/.env-example backend/.env
```

### 3. Launch with Docker Compose
```bash
docker compose up --build
```

### 4. Access Services
- 🌐 **Web Dashboard**: [http://localhost:1234](http://localhost:1234)
- ⚙️ **Backend API**: [http://localhost:4000](http://localhost:4000)
- 🗄️ **MinIO Console**: [http://localhost:9001](http://localhost:9001) *(User: `admin`, Password: `password`)*
- 📦 **MinIO S3 API**: [http://localhost:9000](http://localhost:9000)
- ⚡ **Redis**: `localhost:6379`
- 🗃️ **MariaDB**: `localhost:3307`

---

## 💻 Manual Local Development Setup

If you prefer running services natively outside Docker:

### Prerequisites
- **Node.js**: v18+
- **Python**: 3.9+ (with `pip install rembg onnxruntime pillow` for background removal)
- **Redis Server** running on `localhost:6379`
- **MySQL / MariaDB** running on `localhost:3306`
- **MinIO** or an **AWS S3** bucket

### 1. Backend Setup
```bash
cd backend
npm install

# Push database schema & generate Prisma client
npx prisma db push
npx prisma generate

# Run backend development server
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Start Parcel dev server
npm run dev
```
Open [http://localhost:1234](http://localhost:1234) in your browser.

---

## 📖 API Documentation

### 🔐 Authentication Endpoints (`/api/user`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/user/register` | Register a new user (`name`, `email`, `password`) | No |
| `POST` | `/api/user/login` | Authenticate user & issue JWT + Refresh cookie | No |
| `GET` | `/api/user/logout` | Clear refresh token cookie & session | No |
| `GET` | `/api/user/users` | List registered users | Yes (JWT) |
| `GET` | `/api/refresh` | Issue a new access token via refresh token | No (Cookie) |

---

### 🖼️ Image Management & Transformations (`/api/file`)

#### 1. Upload Images
- **`POST /api/file/upload`** (Multipart Form-Data)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**: `file`: `[File, File, ...]` (Multi-file upload supported)
- **Response**:
```json
{
  "uploadedFiles": [
    {
      "id": 1,
      "image_id": "image/4a2b9f8e12c...",
      "user_id": 1
    }
  ],
  "message": "Successfully uploaded 1 image(s)"
}
```

#### 2. Get User Images (Paginated)
- **`GET /api/file/get-user-images?page=1&limit=12`**
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response**:
```json
{
  "userImages": [
    {
      "id": 1,
      "image_id": "image/4a2b9f8e12c...",
      "user_id": 1,
      "url": "http://localhost:9000/my-bucket/image/4a2b9f8e12c...?X-Amz-Signature=..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalImages": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### 3. Transform Image (On-the-Fly)
- **`GET /api/file/:id/transform?[query_params]`**
- **Behavior**: Returns a `302 Found` redirecting directly to the cached pre-signed S3/MinIO URL.

#### Query Parameters:

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `w` | `number` | `w=800` | Target width in pixels (aspect ratio maintained if `h` omitted) |
| `h` | `number` | `h=600` | Target height in pixels |
| `crop_w` | `number` | `crop_w=400` | Crop region width |
| `crop_h` | `number` | `crop_h=400` | Crop region height |
| `crop_x` | `number` | `crop_x=50` | Crop coordinate X (left offset) |
| `crop_y` | `number` | `crop_y=50` | Crop coordinate Y (top offset) |
| `rotate` | `number` | `rotate=90` | Rotation angle in degrees (e.g. 90, 180, 270) |
| `format` | `string` | `format=webp` | Output format: `jpeg`, `jpg`, `png`, or `webp` |
| `gray` | `boolean` | `gray=true` | Convert image to grayscale |
| `sepia` | `boolean` | `sepia=true` | Apply vintage sepia tone tint |
| `remove_bg` | `boolean` | `remove_bg=true` | Remove background using AI model (`rembg`) |

#### Example Transformation URL:
```http
GET /api/file/42/transform?w=600&h=600&crop_w=400&crop_h=400&crop_x=100&crop_y=100&rotate=90&format=webp&sepia=true
```

#### 4. Get Single Image
- **`GET /api/file/:id`**
- Returns the pre-signed URL and metadata for a specific image.

#### 5. Delete Image
- **`DELETE /api/file/:id`**
- Deletes the original image from S3, clears database references, and invalidates the user's gallery cache version in Redis.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=mysql://root:1234@localhost:3307/imageprocessing

# Redis Cache
REDIS_URL=redis://localhost:6379

# Object Storage (AWS S3 / MinIO)
BUCKET_NAME=imageprocessing
BUCKET_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
PUBLIC_S3_ENDPOINT=http://localhost:9000
ACCESS_KEY_ID=admin
SECRET_ACCESS_KEY=password

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
```

---

## 🧪 Testing

The backend includes test coverage using **Vitest** and **Supertest** with containerized testing services.

```bash
cd backend
npm test
```
This automated command:
1. Spins up an isolated testing Docker Compose stack (`testingDocker.yaml`) on separate ports.
2. Waits for TCP readiness on database and Redis.
3. Applies Prisma migrations to the test database.
4. Executes the Vitest test suite.
5. Tears down the test containers cleanly upon completion.

---

## 🗺️ Roadmap & Future Goals

- [x] On-the-fly Image Transformations (Resize, Crop, Rotate, Format)
- [x] AI Background Removal integration
- [x] Multi-tier Redis + S3 SHA-256 Cache Architecture
- [x] Pagination with Redis version-based invalidation
- [x] S3 & Database Object Deletion workflow
- [ ] Job-based Asynchronous Processing Queue (BullMQ / Celery) for massive batch workloads
- [ ] CloudFront / CDN distribution layer with Edge Caching
- [ ] NGINX Reverse Proxy and SSL termination configuration
- [ ] Dynamic Webhook notifications upon completion of heavy processing tasks

---

## 📄 License

This project is licensed under the ISC License.