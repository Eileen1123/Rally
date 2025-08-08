# Rally app

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/lingyizhu-thoughtworks-projects/v0-rally-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/EscvLAIZ9qb)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/lingyizhu-thoughtworks-projects/v0-rally-app](https://vercel.com/lingyizhu-thoughtworks-projects/v0-rally-app)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/EscvLAIZ9qb](https://v0.dev/chat/projects/EscvLAIZ9qb)**

## Supabase 集成（使用 activities 表）

### 1) 环境变量配置

在项目根目录创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
```

### 2) 创建 activities 表并关闭 RLS（Demo）

在 Supabase SQL 编辑器中执行：

```sql
create extension if not exists pgcrypto;

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date timestamp not null,
  status text not null,
  description text,
  budget_range text,
  participants jsonb not null default '[]'::jsonb,
  recommended_locations jsonb,
  final_location jsonb,
  all_vetoed boolean,
  rsvp_deadline timestamp,
  user_rsvp_status text,
  initiator_name text,
  confirmed_participants jsonb,
  user_reconfirmation_status text,
  reconfirmation_deadline timestamp
);

-- Demo 用途，关闭 RLS（生产环境请开启并编写策略）
alter table public.activities disable row level security;
```

### 3) 初始化示例数据

在 Supabase SQL 编辑器中执行 `activities_data.sql` 文件中的内容。


### 4) 使用方式

- **首页** (`/`) 将直接从 `activities` 读取并渲染活动列表
- **连接状态显示**：成功/失败都有明确提示
- **支持按状态筛选**：正在进行、历史记录、由自己发起
- **自动刷新**：页面获得焦点时自动刷新数据
- **手动刷新**：点击右上角刷新按钮
- **创建活动**：点击右下角 + 号，填写表单后直接写入 Supabase

### 5) 创建活动功能

- 访问 `/create-event` 页面
- 填写活动信息（名称、日期、时间必填）
- 可选择填写：预算范围、描述、响应截止时间、最终确认截止时间
- 提交后直接写入 `activities` 表
- 创建成功后自动跳转到首页，新活动会立即显示

### 6) 开发启动

```bash
pnpm install
pnpm dev
```

### 7) 调试

- 访问 `/debug` 可测试环境变量与 `activities` 连接

### 8) 数据说明

示例数据包含以下类型的活动：

**正在进行：**
- 周末剧本杀碰头（投票中）
- 公司团建烧烤（需要你响应）
- 所有地点都被否决的聚会（所有选项均被否决）
- 测试：地点全部否决（自己发起）
- 测试：确认参与人员（自己发起）

**历史记录：**
- 老同学聚餐（结果已出）
- 部门下午茶（已结束）
- 生日派对（已结束）

这些数据会正确显示在对应的标签页中，并支持所有现有功能。

### 9) 数据同步

- 新创建的活动会立即显示在首页
- 页面获得焦点时会自动刷新数据
- 支持手动刷新按钮
- 所有数据操作都直接与 Supabase 同步
