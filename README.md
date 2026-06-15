# 鼎科盛业 AI 销售作战平台

这是北京鼎科盛业智能化工程有限公司的 CRM 系统骨架，用于管理客户、项目、合同、回款、费用和 AI 销售助手入口。

当前版本定位为上线部署前的静态前端系统：

- 不接 OpenAI
- 默认使用 localStorage 演示数据
- 可切换到 Supabase Auth + Supabase Database
- 保持多页面结构，便于后期继续扩展

## 文件结构

```text
dingke-ai-platform/
├── index.html
├── login.html
├── dashboard.html
├── customers.html
├── customer-detail.html
├── projects.html
├── contracts.html
├── finance.html
├── attendance.html
├── construction-logs.html
├── work-logs.html
├── reimbursements.html
├── overtime.html
├── ai-assistant.html
├── supabase.sql
├── DEPLOY.md
├── README.md
├── assets/
│   ├── crm.css
│   ├── crm.js
│   ├── db-service.js
│   ├── login.js
│   └── supabase-config.js
└── data/
    └── mock-db.json
```

## 本地打开方式

直接打开：

```text
login.html
```

也可以打开：

```text
index.html
```

`index.html` 会自动跳转到登录页。

## 测试账号

本地演示模式下，密码统一为：

```text
123456
```

账号：

```text
boss@dksy.cn      老板，查看全部模块
admin@dksy.cn     管理员，查看全部模块
sales@dksy.cn     销售，客户、项目、AI助手
project@dksy.cn   项目经理，客户、项目、合同
finance@dksy.cn   财务，合同、回款财务
```

## 主要功能

- 登录、退出
- 按角色隐藏左侧菜单
- 未登录自动跳转登录页
- 客户新增、编辑、删除、搜索、筛选
- 客户详情：基本信息、联系人、拜访记录、报价记录、合同记录、下次跟进
- 项目新增、编辑、删除
- 合同新增、编辑、删除，自动计算未回款
- 费用新增、编辑、删除
- 外勤考勤：办公室打卡、外勤打卡、迟到/异常、现场照片
- 施工日志：项目日报、进度、现场问题、甲方反馈、明日计划
- 工作日志：员工日报、客户拜访、项目进展、问题和计划
- 报销管理：油费、停车费、材料费、餐费、住宿费、工具费、其他
- 加班管理：自动计算加班时长，支持审批状态
- AI助手保留三个本地入口：拜访计划、项目方案、催款话术

## Supabase 配置方法

1. 在 Supabase 创建新项目。
2. 打开 SQL Editor。
3. 执行 `supabase.sql`。
4. 在 Supabase Auth 中创建登录用户。
5. 在 `profiles` 表中给用户补充角色：

```text
boss
admin
sales
project
finance
```

6. 修改 `assets/supabase-config.js`：

```js
window.DKSY_SUPABASE_CONFIG = {
  mode: "supabase",
  url: "你的 Supabase Project URL",
  anonKey: "你的 Supabase anon key"
};
```

不要填写 service_role key。

## 部署建议

- 静态部署推荐 Vercel。
- 正式上线建议使用 Supabase Auth 管理账号。
- `supabase-config.js` 中只放 anon key，不放服务端密钥。
- 域名建议使用 `crm.dingkeshengye.com`。
- 正式业务数据上线前，建议先清空浏览器 localStorage，避免演示数据干扰。
