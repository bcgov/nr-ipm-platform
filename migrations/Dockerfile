FROM node:22-slim

# Create a non-root user to run prisma commands
RUN groupadd --gid 1001 nonroot \
    && useradd --uid 1001 --gid nonroot --shell /bin/bash --create-home nonroot

WORKDIR /app

# Install a small set of deps and the prisma CLI globally
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Install Prisma CLI
RUN npm install -g prisma@^6

# Copy only prisma schema/migrations
COPY backend/prisma ./prisma
RUN chown -R nonroot:nonroot /app /home/nonroot

USER appuser
ENV HOME=/home/nonroot

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=5 \
    CMD prisma migrate status --schema=./prisma/schema.prisma || exit 1

# Run migrations and then exit
ENTRYPOINT ["prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]