# 玄武工厂 - 部署指南

## 前置要求

1. Node.js 18+ 和 npm
2. Supabase 账号和项目

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

#### 2.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目或使用现有项目
3. 获取项目URL和anon key

#### 2.2 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的Supabase配置：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

你可以在 Supabase 项目的 **Settings > API** 页面找到这些信息。

#### 2.3 初始化数据库

1. 登录 Supabase Dashboard
2. 打开 **SQL Editor**
3. 复制 `supabase-schema.sql` 文件的全部内容
4. 粘贴到 SQL Editor 并执行

这将创建以下表：
- `projects` - 项目表
- `applications` - 应用表
- `gitlab_config` - GitLab配置表
- `deployments` - 部署记录表
- `build_templates` - 构建模板表

并插入默认的构建模板（Java 17/21、Python、Node.js）。

### 3. 启动开发服务器

```bash
npm run dev
```

默认服务运行在 `http://localhost:5173`

## 功能使用

### 1. 项目管理

1. 访问 **项目管理** 页面
2. 点击 **新建项目**
3. 填写项目信息：
   - 项目名称：例如 "电商平台"
   - Kubernetes命名空间：例如 "ecommerce-platform" (只能包含小写字母、数字和连字符)
   - 描述（可选）
4. 点击 **创建**

**复制项目**：
- 点击项目卡片上的复制按钮
- 输入新项目名称和命名空间
- 系统会自动复制所有应用配置

### 2. GitLab 集成

1. 访问 **GitLab 集成** 页面
2. 点击 **添加 GitLab 配置**
3. 填写配置信息：
   - 配置名称：例如 "公司 GitLab"
   - GitLab URL：例如 "https://gitlab.com" 或自托管实例的 URL
   - Access Token：需要 `api` 和 `read_repository` 权限
4. 点击 **测试连接** 验证配置
5. 测试成功后点击 **保存**

**获取 GitLab Access Token**：
1. 登录 GitLab
2. 访问 **Settings > Access Tokens**
3. 创建新的 Personal Access Token
4. 勾选 `api` 和 `read_repository` 权限
5. 复制生成的 token

### 3. 创建应用

1. 在 **项目管理** 页面选择一个项目
2. 点击 **管理应用**
3. 点击 **新建应用**
4. 填写应用信息：
   - 应用名称：例如 "用户服务"
   - GitLab 仓库：例如 `git@gitlab.com:group/project.git`
   - 分支：例如 `main` 或 `develop`
   - 构建方式：
     - **自定义 Dockerfile**：使用仓库中的 Dockerfile
     - **Java 17/21 模板**：自动构建 Spring Boot 应用
     - **Python 模板**：自动构建 FastAPI 应用
     - **Node.js 模板**：自动构建 Node.js 应用
5. 点击 **创建**

### 4. 部署应用

1. 在应用列表中找到要部署的应用
2. 点击 **部署** 按钮
3. 填写版本号，例如 `v1.0.0`
4. 点击 **开始部署**
5. 查看实时构建和部署日志
6. 等待部署完成

部署状态说明：
- **等待中**：部署任务已创建，等待开始
- **构建中**：正在构建 Docker 镜像
- **部署中**：正在部署到 Kubernetes
- **已部署**：部署成功，应用可以访问
- **失败**：部署失败，查看日志了解原因

## 构建模板说明

### Java 17/21 Spring Boot

自动构建基于 Maven 的 Spring Boot 应用。

**默认配置**：
- PORT: 8080
- JAVA_OPTS: "-Xmx512m -Xms256m"

**要求**：
- 仓库根目录包含 `pom.xml`
- src 目录包含源代码

### Python FastAPI

自动构建基于 Python 的 FastAPI 应用。

**默认配置**：
- PORT: 8000
- MAIN_MODULE: "main:app"

**要求**：
- 仓库根目录包含 `requirements.txt`
- 包含主应用文件（默认 `main.py`）

### Node.js

自动构建 Node.js 应用。

**默认配置**：
- PORT: 3000
- BUILD_COMMAND: "RUN npm run build"
- START_COMMAND: "node dist/index.js"

**要求**：
- 仓库根目录包含 `package.json`
- 定义了构建和启动脚本

## 生产部署

### 构建生产版本

```bash
npm run build
```

生成的文件在 `dist/` 目录。

### 部署到服务器

可以使用任何静态文件服务器部署，例如：

**使用 Nginx**：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**使用 Vercel**：
```bash
npm install -g vercel
vercel --prod
```

## 故障排除

### 构建失败

**问题**：`npm run build` 失败

**解决**：
1. 确保 Node.js 版本 >= 18
2. 删除 `node_modules` 和 `package-lock.json`，重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Supabase 连接失败

**问题**：应用无法连接到 Supabase

**解决**：
1. 检查 `.env` 文件是否存在且配置正确
2. 确认 Supabase URL 和 Key 正确
3. 检查 Supabase 项目是否暂停（免费版会自动暂停）

### 数据库表不存在

**问题**：应用提示表不存在

**解决**：
1. 确认已在 Supabase SQL Editor 中执行 `supabase-schema.sql`
2. 检查 Supabase Dashboard 的 **Table Editor** 确认表已创建
3. 如果表存在但仍报错，检查 RLS 策略是否启用

### GitLab 连接测试失败

**问题**：测试 GitLab 连接失败

**解决**：
1. 确认 Access Token 有正确的权限（`api` 和 `read_repository`）
2. 检查 GitLab URL 是否正确（包括协议 https://）
3. 如果是自托管 GitLab，确认网络可以访问该地址
4. Token 可能已过期，重新生成

## 更多帮助

- [Supabase 文档](https://supabase.com/docs)
- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [GitLab API 文档](https://docs.gitlab.com/ee/api/)
