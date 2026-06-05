FROM node:22-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip

RUN pip install --no-cache-dir rembg onnxruntime pillow

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 4000

RUN npx prisma generate

CMD ["npm", "run", "dev"]
