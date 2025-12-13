# ============================
# STAGE 1: BUILD
# ============================
FROM maven:3.9.8-amazoncorretto-21 AS build
WORKDIR /app

# 1. Copy và cài đặt thư viện common (Bắt buộc để các service khác dùng được)
COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN mvn -f common/pom.xml clean install -DskipTests

# 2. Copy và build service chính (Ví dụ: identity-service)
# LƯU Ý: Thay 'identity-service' bằng tên thư mục của service bạn đang sửa (vd: wallet-service)
COPY otp-service/pom.xml otp-service/pom.xml
COPY otp-service/src otp-service/src

# Build service
RUN mvn -f otp-service/pom.xml clean package -DskipTests


# ============================
# STAGE 2: RUNTIME
# ============================
FROM amazoncorretto:21-alpine

WORKDIR /app

# COPY đúng đường dẫn JAR vào runtime
COPY --from=build /app/otp-service/target/*.jar app.jar

# expose để dễ quản lý (không bắt buộc)
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
