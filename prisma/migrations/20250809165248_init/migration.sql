-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeatherQuery" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "queryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeatherData" (
    "id" SERIAL NOT NULL,
    "weatherQueryId" INTEGER NOT NULL,
    "main" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "feelsLike" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "tempMax" DOUBLE PRECISION NOT NULL,
    "tempMin" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherData_pkey" PRIMARY KEY ("id")
);

-- CreateUser
INSERT INTO "public"."User" ("email", "username", "password", "role", "createdAt", "updatedAt") VALUES
('admin@example.com', 'admin', '$2a$12$UBNzG20rtpkTNhGG1rLXYOE1Gax3duhHeP9CcekBszI0gRY6Da/Ja', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "WeatherQuery_userId_idx" ON "public"."WeatherQuery"("userId");

-- CreateIndex
CREATE INDEX "WeatherQuery_userId_queryTime_idx" ON "public"."WeatherQuery"("userId", "queryTime");

-- CreateIndex
CREATE INDEX "WeatherQuery_city_queryTime_idx" ON "public"."WeatherQuery"("city", "queryTime");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherData_weatherQueryId_key" ON "public"."WeatherData"("weatherQueryId");

-- CreateIndex
CREATE INDEX "WeatherData_weatherQueryId_idx" ON "public"."WeatherData"("weatherQueryId");

-- AddForeignKey
ALTER TABLE "public"."WeatherQuery" ADD CONSTRAINT "WeatherQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeatherData" ADD CONSTRAINT "WeatherData_weatherQueryId_fkey" FOREIGN KEY ("weatherQueryId") REFERENCES "public"."WeatherQuery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
