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
INSERT INTO public.users (username, password) 
VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3') -- admin 的 MD5 值
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

-- 8. 现有活动数据（关联到 admin 用户）

-- 1. 周末剧本杀碰头 (正在进行 - 投票中)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, recommended_locations,
  rsvp_deadline, initiator_name, user_id
) VALUES (
  '周末剧本杀碰头',
  '2025-08-10 19:00'::timestamp,
  '投票中',
  '一起玩剧本杀，地点待定，大家投票决定！',
  '¥100-200',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "张三"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "李四"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "王五"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "赵六"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "钱七"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "当前用户"}
  ]
  $$::jsonb,
  $$
  [
    {"id": "loc1", "name": "剧本杀A馆", "address": "上海市徐汇区天钥桥路1号", "votes": 3},
    {"id": "loc2", "name": "剧本杀B馆", "address": "上海市黄浦区南京东路2号", "votes": 5},
    {"id": "loc3", "name": "剧本杀C馆", "address": "上海市静安区愚园路3号", "votes": 2}
  ]
  $$::jsonb,
  '2025-08-09 18:00'::timestamp,
  '张三',
  (SELECT id FROM public.users WHERE username = 'admin')
);

-- 2. 公司团建烧烤 (正在进行 - 需要你响应)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, rsvp_deadline, initiator_name, user_id
) VALUES (
  '公司团建烧烤',
  '2025-08-15 18:30'::timestamp,
  '需要你响应',
  '部门团建烧烤，请大家尽快响应是否参加。',
  '¥200-300',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "孙八"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "周九"}
  ]
  $$::jsonb,
  '2025-08-14 12:00'::timestamp,
  '孙八',
  (SELECT id FROM public.users WHERE username = 'admin')
);

-- 3. 老同学聚餐 (历史记录 - 结果已出)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, final_location, recommended_locations,
  rsvp_deadline, initiator_name, confirmed_participants, user_id
) VALUES (
  '老同学聚餐',
  '2025-07-20 12:00'::timestamp,
  '结果已出',
  '毕业十年聚餐，地点已定，期待相聚！',
  '¥150-250',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "吴十"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "郑一"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "冯二"}
  ]
  $$::jsonb,
  $$
  {"id": "loc4", "name": "小南国（陆家嘴店）", "address": "上海市浦东新区陆家嘴环路1000号"}
  $$::jsonb,
  $$
  [
    {"id": "loc4", "name": "小南国（陆家嘴店）", "address": "上海市浦东新区陆家嘴环路1000号", "votes": 7},
    {"id": "loc_old_2", "name": "老盛昌", "address": "上海市黄浦区", "votes": 2}
  ]
  $$::jsonb,
  '2025-07-19 10:00'::timestamp,
  '吴十',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "吴十"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "郑一"}
  ]
  $$::jsonb,
  (SELECT id FROM public.users WHERE username = 'admin')
);

-- 4. 部门下午茶 (历史记录 - 已结束)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, final_location, recommended_locations,
  rsvp_deadline, initiator_name, user_id
) VALUES (
  '部门下午茶',
  '2025-07-18 15:00'::timestamp,
  '已结束',
  '轻松一下，聊聊最近的工作和生活。',
  '¥50-100',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "陈三"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "褚四"}
  ]
  $$::jsonb,
  $$
  {"id": "loc5", "name": "星巴克（静安寺店）", "address": "上海市静安区南京西路1700号"}
  $$::jsonb,
  $$
  [
    {"id": "loc5", "name": "星巴克（静安寺店）", "address": "上海市静安区南京西路1700号", "votes": 4},
    {"id": "loc_old_3", "name": "瑞幸咖啡", "address": "上海市静安区", "votes": 1}
  ]
  $$::jsonb,
  '2025-07-17 14:00'::timestamp,
  '陈三',
  (SELECT id FROM public.users WHERE username = 'admin')
);

-- 5. 生日派对 (历史记录 - 已结束)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, final_location, recommended_locations,
  rsvp_deadline, initiator_name, user_id
) VALUES (
  '生日派对',
  '2025-06-05 20:00'::timestamp,
  '已结束',
  '庆祝小明的生日，欢迎大家来玩！',
  '¥300+',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "卫五"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "蒋六"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "沈七"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "韩八"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "杨九"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "朱十"}
  ]
  $$::jsonb,
  $$
  {"id": "loc6", "name": "KTV（人民广场店）", "address": "上海市黄浦区人民大道1号"}
  $$::jsonb,
  $$
  [
    {"id": "loc6", "name": "KTV（人民广场店）", "address": "上海市黄浦区人民大道1号", "votes": 10},
    {"id": "loc_old_4", "name": "酒吧A", "address": "上海市黄浦区", "votes": 3}
  ]
  $$::jsonb,
  '2025-06-04 18:00'::timestamp,
  '卫五',
  (SELECT id FROM public.users WHERE username = 'admin')
);

-- 6. 所有地点都被否决的聚会 (正在进行 - 所有选项均被否决)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, recommended_locations, all_vetoed,
  rsvp_deadline, initiator_name, user_id
) VALUES (
  '所有地点都被否决的聚会',
  '2025-09-01 14:00'::timestamp,
  '所有选项均被否决',
  '一个测试所有地点都被否决的场景。',
  '¥50-100',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试用户A"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试用户B"}
  ]
  $$::jsonb,
  $$
  [
    {"id": "loc7", "name": "咖啡馆X", "address": "测试地址1", "vetoedBy": ["测试用户A"], "votes": 0},
    {"id": "loc8", "name": "茶馆Y", "address": "测试地址2", "vetoedBy": ["测试用户B"], "votes": 0}
  ]
  $$::jsonb,
  true,
  '2025-08-30 23:59'::timestamp,
  '测试用户A',
  (SELECT id FROM public.users WHERE username = 'admin')
);

-- 7. 测试：地点全部否决 (自己发起) (正在进行 - 所有选项均被否决)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, recommended_locations, all_vetoed,
  rsvp_deadline, initiator_name, user_id
) VALUES (
  '测试：地点全部否决 (自己发起)',
  '2025-08-20 10:00'::timestamp,
  '所有选项均被否决',
  '这是一个测试所有地点都被否决的活动，由当前用户发起。',
  '不限',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "当前用户"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试否决者A"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试否决者B"}
  ]
  $$::jsonb,
  $$
  [
    {"id": "loc9", "name": "测试地点X", "address": "测试地址X", "vetoedBy": ["当前用户", "测试否决者A"], "votes": 0},
    {"id": "loc10", "name": "测试地点Y", "address": "测试地址Y", "vetoedBy": ["当前用户", "测试否决者B"], "votes": 0}
  ]
  $$::jsonb,
  true,
  '2025-08-19 23:59'::timestamp,
  '当前用户',
  (SELECT id FROM public.users WHERE username = 'admin')
);

-- 8. 测试：确认参与人员 (自己发起) (正在进行 - 结果已出)
INSERT INTO public.activities (
  name, date, status, description, budget_range,
  participants, final_location, recommended_locations,
  rsvp_deadline, initiator_name, confirmed_participants, reconfirmation_deadline, user_id
) VALUES (
  '测试：确认参与人员 (自己发起)',
  '2025-08-25 14:00'::timestamp,
  '结果已出',
  '这是一个测试最终地点已确定，需要发起人确认参与人员的活动。',
  '¥100-200',
  $$
  [
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "当前用户"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "参与者甲"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "参与者乙"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "参与者丙"}
  ]
  $$::jsonb,
  $$
  {"id": "loc11", "name": "最终咖啡馆", "address": "上海市某区某路123号"}
  $$::jsonb,
  $$
  [
    {"id": "loc11", "name": "最终咖啡馆", "address": "上海市某区某路123号", "votes": 5},
    {"id": "loc12", "name": "备选茶馆", "address": "上海市某区某路456号", "votes": 2}
  ]
  $$::jsonb,
  '2025-08-24 12:00'::timestamp,
  '当前用户',
  $$
  []
  $$::jsonb,
  '2025-08-24 18:00'::timestamp,
  (SELECT id FROM public.users WHERE username = 'admin')
);