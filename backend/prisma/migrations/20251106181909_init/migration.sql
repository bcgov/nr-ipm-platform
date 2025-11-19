-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ipm";

-- CreateTable
CREATE TABLE "ipm"."applications" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_username_key" ON "ipm"."applications"("username");

-- CreateIndex
CREATE UNIQUE INDEX "applications_email_key" ON "ipm"."applications"("email");
