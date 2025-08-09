-- 在 Supabase SQL 编辑器中执行以下语句

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL, -- MD5 加密的密码
  avatar text DEFAULT '/placeholder.svg?height=32&width=32',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 2. 更新活动表，添加用户关联
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id);

-- 3. 创建 admin 用户（密码：admin）
-- admin 的 MD5 值是：21232f297a57a5a743894a0e4a801fc3
INSERT INTO public.users (username, password) 
VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3')
ON CONFLICT (username) DO NOTHING;

-- 4. 更新现有活动，关联到 admin 用户
UPDATE public.activities 
SET user_id = (SELECT id FROM public.users WHERE username = 'admin')
WHERE user_id IS NULL;

-- 5. 设置 user_id 为 NOT NULL
ALTER TABLE public.activities ALTER COLUMN user_id SET NOT NULL;

-- 6. 关闭 RLS（Demo 用途）
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;

-- 7. 创建索引
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username); 