# ============================
# STAGE 1: BUILD
# ============================
FROM maven:3.9.8-amazoncorretto-21 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:resolve -DskipTests
COPY src ./src

RUN mvn clean package -DskipTests


# ============================
# STAGE 2: RUNTIME
# ============================
FROM amazoncorretto:21-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# expose để dễ quản lý (không bắt buộc)
EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
