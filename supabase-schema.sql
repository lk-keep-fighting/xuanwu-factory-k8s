-- 玄武工厂 Supabase Database Schema

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  namespace TEXT NOT NULL UNIQUE, -- 对应k8s命名空间
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- 应用表
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gitlab_repo TEXT NOT NULL,
  gitlab_branch TEXT NOT NULL DEFAULT 'main',
  build_type TEXT NOT NULL CHECK (build_type IN ('dockerfile', 'java17', 'java21', 'python', 'nodejs')),
  dockerfile_path TEXT,
  build_config JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deployed', 'failed', 'stopped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitLab配置表
CREATE TABLE IF NOT EXISTS gitlab_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gitlab_url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 部署记录表
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'deployed', 'failed', 'rolled_back')),
  build_logs TEXT,
  deploy_logs TEXT,
  image_url TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 构建模板表
CREATE TABLE IF NOT EXISTS build_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('java17', 'java21', 'python', 'nodejs')),
  description TEXT,
  dockerfile_template TEXT NOT NULL,
  default_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_application_id ON deployments(application_id);
CREATE INDEX IF NOT EXISTS idx_projects_namespace ON projects(namespace);

-- 插入默认构建模板
INSERT INTO build_templates (name, type, description, dockerfile_template, default_config) VALUES
('Java 17 Spring Boot', 'java17', 'Java 17 with Maven and Spring Boot', 
'FROM maven:3.8.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE {{PORT}}
ENV JAVA_OPTS="{{JAVA_OPTS}}"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]',
'{"PORT": "8080", "JAVA_OPTS": "-Xmx512m -Xms256m"}'),

('Java 21 Spring Boot', 'java21', 'Java 21 with Maven and Spring Boot',
'FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE {{PORT}}
ENV JAVA_OPTS="{{JAVA_OPTS}}"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]',
'{"PORT": "8080", "JAVA_OPTS": "-Xmx512m -Xms256m"}'),

('Python FastAPI', 'python', 'Python 3.11 with FastAPI and uvicorn',
'FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE {{PORT}}
CMD ["uvicorn", "{{MAIN_MODULE}}", "--host", "0.0.0.0", "--port", "{{PORT}}"]',
'{"PORT": "8000", "MAIN_MODULE": "main:app"}'),

('Node.js', 'nodejs', 'Node.js 20 with npm',
'FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
{{BUILD_COMMAND}}

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE {{PORT}}
CMD ["{{START_COMMAND}}"]',
'{"PORT": "3000", "BUILD_COMMAND": "RUN npm run build", "START_COMMAND": "node dist/index.js"}')
ON CONFLICT DO NOTHING;

-- 启用Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gitlab_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_templates ENABLE ROW LEVEL SECURITY;

-- 创建策略（暂时允许所有操作，实际生产环境需要根据认证配置）
CREATE POLICY "Enable all for projects" ON projects FOR ALL USING (true);
CREATE POLICY "Enable all for applications" ON applications FOR ALL USING (true);
CREATE POLICY "Enable all for gitlab_config" ON gitlab_config FOR ALL USING (true);
CREATE POLICY "Enable all for deployments" ON deployments FOR ALL USING (true);
CREATE POLICY "Enable read for build_templates" ON build_templates FOR SELECT USING (true);
CREATE POLICY "Enable insert for build_templates" ON build_templates FOR INSERT WITH CHECK (true);
