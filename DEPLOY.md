# 部署说明

## 部署到 Vercel

1. 准备一个 Git 仓库，把 `dingke-ai-platform` 目录提交进去。
2. 登录 Vercel。
3. 点击 `Add New Project`。
4. 选择该 Git 仓库。
5. Framework Preset 选择 `Other`。
6. Build Command 留空。
7. Output Directory 指向当前静态目录；如果仓库根目录就是本项目，留空即可。
8. 点击 Deploy。

部署完成后，Vercel 会生成一个临时访问域名。

## 绑定 crm.dingkeshengye.com

1. 在 Vercel 项目中进入 `Settings`。
2. 打开 `Domains`。
3. 添加：

```text
crm.dingkeshengye.com
```

4. 到域名 DNS 服务商后台添加 Vercel 要求的 DNS 记录。
5. 常见方式是添加 CNAME：

```text
主机记录：crm
记录类型：CNAME
记录值：cname.vercel-dns.com
```

6. 回到 Vercel 等待域名校验通过。
7. 校验通过后，访问：

```text
https://crm.dingkeshengye.com
```

## 切换到 Supabase 正式模式

1. 在 Supabase 创建项目。
2. 进入 SQL Editor。
3. 执行项目根目录下的：

```text
supabase.sql
```

4. 在 Supabase Auth 中创建用户。
5. 在 `profiles` 表中为每个用户写入：

```text
auth_user_id
email
name
role
```

角色可选：

```text
boss
admin
sales
project
finance
```

6. 修改：

```text
assets/supabase-config.js
```

配置为：

```js
window.DKSY_SUPABASE_CONFIG = {
  mode: "supabase",
  url: "你的 Supabase Project URL",
  anonKey: "你的 Supabase anon key"
};
```

7. 重新部署到 Vercel。

## 上线前检查

- 确认 `supabase-config.js` 没有 service_role key。
- 确认 Supabase Auth 用户能登录。
- 确认 `profiles` 表里每个用户都有角色。
- 确认老板和管理员能看到全部菜单。
- 确认销售、项目经理、财务只能看到对应菜单。
- 确认新增、编辑、删除在正式数据源下符合预期。

## 回退方案

如果 Supabase 配置暂时不可用，把 `assets/supabase-config.js` 改回：

```js
window.DKSY_SUPABASE_CONFIG = {
  mode: "local",
  url: "",
  anonKey: ""
};
```

系统会继续使用 localStorage 演示模式。
