-- 插入现有活动数据到 public.activities 表
-- 在 Supabase SQL 编辑器中执行以下语句

-- 1. 周末剧本杀碰头 (正在进行 - 投票中)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants, 
  recommended_locations, rsvp_deadline, initiator_name
) VALUES (
  '1', '周末剧本杀碰头', '2025-08-10 19:00', '投票中', 
  '一起玩剧本杀，地点待定，大家投票决定！', '¥100-200',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "张三"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "李四"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "王五"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "赵六"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "钱七"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "当前用户"}
  ]'::jsonb,
  '[
    {"id": "loc1", "name": "剧本杀A馆", "address": "上海市徐汇区天钥桥路1号", "votes": 3},
    {"id": "loc2", "name": "剧本杀B馆", "address": "上海市黄浦区南京东路2号", "votes": 5},
    {"id": "loc3", "name": "剧本杀C馆", "address": "上海市静安区愚园路3号", "votes": 2}
  ]'::jsonb,
  '2025-08-09 18:00', '张三'
);

-- 2. 公司团建烧烤 (正在进行 - 需要你响应)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants, 
  rsvp_deadline, initiator_name
) VALUES (
  '2', '公司团建烧烤', '2025-08-15 18:30', '需要你响应',
  '部门团建烧烤，请大家尽快响应是否参加。', '¥200-300',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "孙八"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "周九"}
  ]'::jsonb,
  '2025-08-14 12:00', '孙八'
);

-- 3. 老同学聚餐 (历史记录 - 结果已出)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants,
  final_location, recommended_locations, rsvp_deadline, initiator_name,
  confirmed_participants
) VALUES (
  '3', '老同学聚餐', '2025-07-20 12:00', '结果已出',
  '毕业十年聚餐，地点已定，期待相聚！', '¥150-250',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "吴十"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "郑一"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "冯二"}
  ]'::jsonb,
  '{"id": "loc4", "name": "小南国（陆家嘴店）", "address": "上海市浦东新区陆家嘴环路1000号"}'::jsonb,
  '[
    {"id": "loc4", "name": "小南国（陆家嘴店）", "address": "上海市浦东新区陆家嘴环路1000号", "votes": 7},
    {"id": "loc_old_2", "name": "老盛昌", "address": "上海市黄浦区", "votes": 2}
  ]'::jsonb,
  '2025-07-19 10:00', '吴十',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "吴十"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "郑一"}
  ]'::jsonb
);

-- 4. 部门下午茶 (历史记录 - 已结束)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants,
  final_location, recommended_locations, rsvp_deadline, initiator_name
) VALUES (
  '4', '部门下午茶', '2025-07-18 15:00', '已结束',
  '轻松一下，聊聊最近的工作和生活。', '¥50-100',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "陈三"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "褚四"}
  ]'::jsonb,
  '{"id": "loc5", "name": "星巴克（静安寺店）", "address": "上海市静安区南京西路1700号"}'::jsonb,
  '[
    {"id": "loc5", "name": "星巴克（静安寺店）", "address": "上海市静安区南京西路1700号", "votes": 4},
    {"id": "loc_old_3", "name": "瑞幸咖啡", "address": "上海市静安区", "votes": 1}
  ]'::jsonb,
  '2025-07-17 14:00', '陈三'
);

-- 5. 生日派对 (历史记录 - 已结束)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants,
  final_location, recommended_locations, rsvp_deadline, initiator_name
) VALUES (
  '5', '生日派对', '2025-06-05 20:00', '已结束',
  '庆祝小明的生日，欢迎大家来玩！', '¥300+',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "卫五"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "蒋六"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "沈七"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "韩八"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "杨九"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "朱十"}
  ]'::jsonb,
  '{"id": "loc6", "name": "KTV（人民广场店）", "address": "上海市黄浦区人民大道1号"}'::jsonb,
  '[
    {"id": "loc6", "name": "KTV（人民广场店）", "address": "上海市黄浦区人民大道1号", "votes": 10},
    {"id": "loc_old_4", "name": "酒吧A", "address": "上海市黄浦区", "votes": 3}
  ]'::jsonb,
  '2025-06-04 18:00', '卫五'
);

-- 6. 所有地点都被否决的聚会 (正在进行 - 所有选项均被否决)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants,
  recommended_locations, all_vetoed, rsvp_deadline, initiator_name
) VALUES (
  '6', '所有地点都被否决的聚会', '2025-09-01 14:00', '所有选项均被否决',
  '一个测试所有地点都被否决的场景。', '¥50-100',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试用户A"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试用户B"}
  ]'::jsonb,
  '[
    {"id": "loc7", "name": "咖啡馆X", "address": "测试地址1", "vetoedBy": ["测试用户A"], "votes": 0},
    {"id": "loc8", "name": "茶馆Y", "address": "测试地址2", "vetoedBy": ["测试用户B"], "votes": 0}
  ]'::jsonb,
  true, '2025-08-30 23:59', '测试用户A'
);

-- 7. 测试：地点全部否决 (自己发起) (正在进行 - 所有选项均被否决)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants,
  recommended_locations, all_vetoed, rsvp_deadline, initiator_name
) VALUES (
  '7', '测试：地点全部否决 (自己发起)', '2025-08-20 10:00', '所有选项均被否决',
  '这是一个测试所有地点都被否决的活动，由当前用户发起。', '不限',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "当前用户"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试否决者A"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "测试否决者B"}
  ]'::jsonb,
  '[
    {"id": "loc9", "name": "测试地点X", "address": "测试地址X", "vetoedBy": ["当前用户", "测试否决者A"], "votes": 0},
    {"id": "loc10", "name": "测试地点Y", "address": "测试地址Y", "vetoedBy": ["当前用户", "测试否决者B"], "votes": 0}
  ]'::jsonb,
  true, '2025-08-19 23:59', '当前用户'
);

-- 8. 测试：确认参与人员 (自己发起) (正在进行 - 结果已出)
INSERT INTO public.activities (
  id, name, date, status, description, budget_range, participants,
  final_location, recommended_locations, rsvp_deadline, initiator_name,
  confirmed_participants, reconfirmation_deadline
) VALUES (
  '8', '测试：确认参与人员 (自己发起)', '2025-08-25 14:00', '结果已出',
  '这是一个测试最终地点已确定，需要发起人确认参与人员的活动。', '¥100-200',
  '[
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "当前用户"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "参与者甲"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "参与者乙"},
    {"avatar": "/placeholder.svg?height=32&width=32", "name": "参与者丙"}
  ]'::jsonb,
  '{"id": "loc11", "name": "最终咖啡馆", "address": "上海市某区某路123号"}'::jsonb,
  '[
    {"id": "loc11", "name": "最终咖啡馆", "address": "上海市某区某路123号", "votes": 5},
    {"id": "loc12", "name": "备选茶馆", "address": "上海市某区某路456号", "votes": 2}
  ]'::jsonb,
  '2025-08-24 12:00', '当前用户',
  '[]'::jsonb, '2025-08-24 18:00'
); 