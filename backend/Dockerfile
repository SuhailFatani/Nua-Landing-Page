FROM python:3.12-slim

WORKDIR /app

# System dependencies for neomodel, argon2, Pillow
RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    libssl-dev \
    libjpeg-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create non-root user for production
RUN groupadd -r django && useradd -r -g django django \
    && mkdir -p /app/uploads && chown -R django:django /app/uploads

EXPOSE 8000
