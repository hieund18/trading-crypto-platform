# ============================
# STAGE 1: BUILD
# ============================
FROM maven:3.9.8-amazoncorretto-21 AS build

WORKDIR /app

# Copy toàn bộ source code vào Docker
COPY . .

# Build module identity-service + tự build common trước (-am)
RUN mvn -pl identity-service -am clean package -DskipTests


# ============================
# STAGE 2: RUNTIME
# ============================
FROM amazoncorretto:21-alpine

WORKDIR /app

# COPY đúng đường dẫn JAR vào runtime
COPY --from=build /app/identity-service/target/*.jar app.jar

# expose để dễ quản lý (không bắt buộc)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
