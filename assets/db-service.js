const DKSY_STORAGE_KEY = "dksy-crm-db-v8";
const DKSY_AUTH_KEY = "dksy-crm-auth-v6";

const DKSY_DEMO_USERS = [
  { id: "demo-boss", email: "boss@dksy.cn", password: "123456", name: "老板账号", role: "boss" },
  { id: "demo-admin", email: "admin@dksy.cn", password: "123456", name: "管理员", role: "admin" },
  { id: "demo-sales", email: "sales@dksy.cn", password: "123456", name: "销售账号", role: "sales" },
  { id: "demo-project", email: "project@dksy.cn", password: "123456", name: "项目经理", role: "project" },
  { id: "demo-finance", email: "finance@dksy.cn", password: "123456", name: "财务账号", role: "finance" }
];

const DKSY_ROLE_PERMISSIONS = {
  boss: ["dashboard", "customers", "customer-detail", "projects", "contracts", "finance", "attendance", "construction-logs", "work-logs", "reimbursements", "overtime", "ai"],
  admin: ["dashboard", "customers", "customer-detail", "projects", "contracts", "finance", "attendance", "construction-logs", "work-logs", "reimbursements", "overtime", "ai"],
  sales: ["dashboard", "customers", "customer-detail", "projects", "attendance", "work-logs", "ai"],
  project: ["dashboard", "customers", "customer-detail", "projects", "contracts", "attendance", "construction-logs", "work-logs"],
  finance: ["dashboard", "contracts", "finance", "reimbursements", "overtime"]
};

const DKSY_FALLBACK_DB = {
  customers: [
    {
      id: "C-001",
      name: "海淀区某中学",
      category: "学校",
      contact: "李主任",
      phone: "138****2601",
      need: "校园安防、智慧体育",
      status: "现场勘查",
      nextVisit: "2026-06-18 10:00",
      address: "北京市海淀区",
      contacts: [{ id: "CT-001", name: "李主任", role: "总务主任", phone: "138****2601" }],
      visits: [{ id: "V-001", date: "2026-06-10", content: "复核校门、操场、食堂监控点位。" }],
      quotes: [{ id: "Q-001", date: "2026-06-12", name: "校园安防初步报价", amount: 1180000 }],
      contracts: ["HT-004"],
      reminder: "2026-06-18 前确认操场和食堂点位数量。"
    },
    {
      id: "C-002",
      name: "朝阳区某医院",
      category: "医院",
      contact: "王科长",
      phone: "139****7718",
      need: "视频监控、门禁系统",
      status: "方案报价",
      nextVisit: "2026-06-19 14:30",
      address: "北京市朝阳区",
      contacts: [{ id: "CT-002", name: "王科长", role: "保卫科", phone: "139****7718" }],
      visits: [{ id: "V-002", date: "2026-06-08", content: "门急诊、药房、后勤通道需要补充高清摄像机。" }],
      quotes: [{ id: "Q-002", date: "2026-06-11", name: "医院监控扩容报价", amount: 1280000 }],
      contracts: ["HT-002"],
      reminder: "补齐病区门禁清单后再次报价。"
    },
    {
      id: "C-003",
      name: "丰台某政府单位",
      category: "政府",
      contact: "赵工",
      phone: "136****0928",
      need: "综合布线、机房建设",
      status: "初步沟通",
      nextVisit: "2026-06-20 09:30",
      address: "北京市丰台区",
      contacts: [{ id: "CT-003", name: "赵工", role: "信息中心", phone: "136****0928" }],
      visits: [],
      quotes: [],
      contracts: [],
      reminder: "预约信息中心确认弱电井和机房现状。"
    },
    {
      id: "C-004",
      name: "亦庄企业园区",
      category: "企业园区",
      contact: "陈经理",
      phone: "135****6832",
      need: "网络工程、弱电集成",
      status: "合同审批",
      nextVisit: "2026-06-21 15:00",
      address: "北京经济技术开发区",
      contacts: [{ id: "CT-004", name: "陈经理", role: "园区工程部", phone: "135****6832" }],
      visits: [{ id: "V-003", date: "2026-06-06", content: "确认机房供电、网络主干和楼宇综合布线范围。" }],
      quotes: [{ id: "Q-003", date: "2026-06-09", name: "园区机房建设报价", amount: 960000 }],
      contracts: ["HT-003"],
      reminder: "跟进合同盖章和首付款节点。"
    }
  ],
  projects: [
    { id: "P-001", name: "海淀中学校园安防改造", customer: "海淀区某中学", type: "校园安防", manager: "张工", stage: "施工", amount: 1180000, progress: 72, risk: "暑期施工窗口短，需提前确认进场手续。", deadline: "2026-07-15" },
    { id: "P-002", name: "朝阳医院监控扩容", customer: "朝阳区某医院", type: "视频监控", manager: "刘工", stage: "报价", amount: 1280000, progress: 46, risk: "病区施工需避开门诊高峰，夜间施工成本可能增加。", deadline: "2026-07-28" },
    { id: "P-003", name: "亦庄园区机房建设", customer: "亦庄企业园区", type: "机房建设", manager: "王工", stage: "验收", amount: 960000, progress: 88, risk: "需补齐设备标签照片和竣工测试记录。", deadline: "2026-06-30" }
  ],
  contracts: [
    { id: "HT-001", number: "DK-2026-0601", project: "昌平学校门禁系统", customer: "昌平区某学校", amount: 860000, paid: 520000, node: "进度款", invoiceStatus: "已开票", dueDate: "2026-06-02", overdueStatus: "逾期", status: "逾期" },
    { id: "HT-002", number: "DK-2026-0602", project: "医院视频监控扩容", customer: "朝阳区某医院", amount: 1280000, paid: 640000, node: "验收款", invoiceStatus: "待开票", dueDate: "2026-06-25", overdueStatus: "未逾期", status: "资料待补" },
    { id: "HT-003", number: "DK-2026-0603", project: "亦庄园区机房建设", customer: "亦庄企业园区", amount: 960000, paid: 780000, node: "尾款", invoiceStatus: "已开票", dueDate: "2026-06-19", overdueStatus: "未逾期", status: "本周到期" },
    { id: "HT-004", number: "DK-2026-0604", project: "海淀中学校园安防改造", customer: "海淀区某中学", amount: 1180000, paid: 360000, node: "进度款", invoiceStatus: "部分开票", dueDate: "2026-06-28", overdueStatus: "未逾期", status: "正常" }
  ],
  employees: [
    { id: "E-001", name: "张三", role: "销售经理", salary: 18000 },
    { id: "E-002", name: "李四", role: "项目经理", salary: 22000 },
    { id: "E-003", name: "王五", role: "弱电工程师", salary: 16000 }
  ],
  expenses: [
    { id: "F-001", name: "员工工资", category: "员工工资", amount: 238000 },
    { id: "F-002", name: "办公室房租", category: "房租", amount: 46000 },
    { id: "F-003", name: "车辆油费及停车", category: "车辆费用", amount: 8500 },
    { id: "F-004", name: "办公用品及网络", category: "办公费用", amount: 6200 },
    { id: "F-005", name: "摄像机供应商欠款", category: "供应商欠款", amount: 126000 },
    { id: "F-006", name: "医院项目施工支出", category: "项目支出", amount: 78000 }
  ],
  attendanceRecords: [
    { id: "A-001", type: "办公室打卡", employeeName: "张三", checkTime: "2026-06-14 08:55", location: "公司办公室", projectName: "", isLate: "否", isAbnormal: "否", photo: "", status: "正常", remark: "正常到岗" },
    { id: "A-002", type: "外勤打卡", employeeName: "项目经理", checkTime: "2026-06-14 09:20", location: "海淀中学项目现场", projectName: "海淀中学校园安防改造", isLate: "否", isAbnormal: "否", photo: "site-a.jpg", status: "正常", remark: "现场协调进场" },
    { id: "A-003", type: "外勤打卡", employeeName: "销售账号", checkTime: "2026-06-14 10:00", location: "朝阳医院", projectName: "朝阳医院监控扩容", isLate: "否", isAbnormal: "否", photo: "visit.jpg", status: "正常", remark: "客户拜访" }
  ],
  constructionLogs: [
    { id: "CL-001", projectName: "海淀中学校园安防改造", writer: "项目经理", logDate: "2026-06-14", workerCount: 6, content: "完成教学楼一层桥架和部分摄像机安装。", progress: 72, issues: "暑期施工窗口较紧。", feedback: "甲方要求注意施工安全。", tomorrowPlan: "继续安装操场周边点位。", photo: "construction.jpg", status: "已提交", remark: "" }
  ],
  workLogs: [
    { id: "WL-001", employeeName: "销售账号", logDate: "2026-06-14", content: "拜访朝阳医院，沟通监控扩容清单。", customerName: "朝阳区某医院", projectProgress: "报价清单待确认", issues: "病区施工时间需协调", tomorrowPlan: "补充报价明细", status: "已提交", remark: "" },
    { id: "WL-002", employeeName: "项目经理", logDate: "2026-06-14", content: "协调海淀中学现场施工。", customerName: "海淀区某中学", projectProgress: "施工 72%", issues: "进场手续需提前申请", tomorrowPlan: "继续安装前端设备", status: "已提交", remark: "" }
  ],
  reimbursements: [
    { id: "R-001", employeeName: "项目经理", type: "材料费", amount: 1200, projectName: "海淀中学校园安防改造", invoicePhoto: "invoice-001.jpg", status: "待审批", approver: "财务账号", remark: "现场辅材采购" }
  ],
  overtimeRecords: [
    { id: "OT-001", employeeName: "项目经理", projectName: "海淀中学校园安防改造", overtimeDate: "2026-06-14", startTime: "18:30", endTime: "21:00", reason: "配合学校夜间施工窗口", hours: 2.5, status: "待审批", remark: "" }
  ]
};

let dksySupabaseClient = null;
let dksyLastSource = "local";

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeDBShape(db) {
  db.customers ||= [];
  db.projects ||= [];
  db.contracts ||= [];
  db.employees ||= [];
  db.expenses ||= [];
  db.attendanceRecords ||= [];
  db.constructionLogs ||= [];
  db.workLogs ||= [];
  db.reimbursements ||= [];
  db.overtimeRecords ||= [];

  db.customers.forEach((item) => {
    item.contacts ||= [{ name: item.contact || "待确认", role: "联系人", phone: item.phone || "待录入" }];
    item.visits ||= [];
    item.quotes ||= [];
    item.contracts ||= [];
    item.reminder ||= item.nextVisit ? `${item.nextVisit} 前完成跟进。` : "暂无提醒";
    item.address ||= "待补充";
  });

  db.projects.forEach((item) => {
    item.amount = Number(item.amount || 0);
    item.progress = Number(item.progress || 0);
    item.risk ||= "暂无风险提醒";
  });

  db.contracts.forEach((item) => {
    item.number ||= item.id;
    item.amount = Number(item.amount || 0);
    item.paid = Number(item.paid || 0);
    item.invoiceStatus ||= "未开票";
    item.overdueStatus ||= item.status || "未逾期";
    item.status ||= item.overdueStatus;
  });

  return db;
}

function localLoad() {
  const saved = localStorage.getItem(DKSY_STORAGE_KEY);
  if (saved) return normalizeDBShape(JSON.parse(saved));
  const initial = normalizeDBShape(cloneData(DKSY_FALLBACK_DB));
  localStorage.setItem(DKSY_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function localSave(db) {
  localStorage.setItem(DKSY_STORAGE_KEY, JSON.stringify(normalizeDBShape(db)));
}

function configReady() {
  const config = window.DKSY_SUPABASE_CONFIG || {};
  return config.mode === "supabase" && Boolean(config.url) && Boolean(config.anonKey);
}

function getLocalSession() {
  const saved = localStorage.getItem(DKSY_AUTH_KEY);
  return saved ? JSON.parse(saved) : null;
}

function setLocalSession(user) {
  localStorage.setItem(DKSY_AUTH_KEY, JSON.stringify(user));
}

function clearLocalSession() {
  localStorage.removeItem(DKSY_AUTH_KEY);
}

function loadSupabaseScript() {
  if (window.supabase) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-dksy-supabase]");
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.dataset.dksySupabase = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function getSupabaseClient() {
  if (!configReady()) return null;
  if (dksySupabaseClient) return dksySupabaseClient;

  await loadSupabaseScript();
  const config = window.DKSY_SUPABASE_CONFIG;
  dksySupabaseClient = window.supabase.createClient(config.url, config.anonKey);
  return dksySupabaseClient;
}

async function login(email, password) {
  if (configReady()) {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error("登录失败，请检查邮箱和密码。");
    return data.user;
  }

  const user = DKSY_DEMO_USERS.find((item) => item.email === email && item.password === password);
  if (!user) throw new Error("登录失败。演示账号请使用 boss/admin/sales/project/finance@dksy.cn，密码 123456。");
  const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  setLocalSession(sessionUser);
  return sessionUser;
}

async function logout() {
  clearLocalSession();
  if (configReady()) {
    const client = await getSupabaseClient();
    await client.auth.signOut();
  }
}

async function getCurrentUser() {
  if (configReady()) {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    const profile = await getProfile(data.user.id);
    return {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || data.user.email,
      role: profile?.role || "sales"
    };
  }

  return getLocalSession();
}

async function getProfile(userId) {
  const client = await getSupabaseClient();
  const { data, error } = await client.from("profiles").select("*").eq("auth_user_id", userId).maybeSingle();
  if (error) return null;
  return data;
}

async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role || null;
}

function hasPermission(role, page) {
  if (!role || !page) return false;
  return (DKSY_ROLE_PERMISSIONS[role] || []).includes(page);
}

async function requireAuth(page) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "./login.html";
    return null;
  }

  if (page && !hasPermission(user.role, page)) {
    window.location.href = "./dashboard.html";
    return null;
  }

  return user;
}

function toCamelCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    contact: row.primary_contact || "",
    phone: row.primary_phone || "",
    need: row.need || "",
    status: row.status || "",
    nextVisit: row.next_visit_at || "",
    address: row.address || "",
    reminder: row.reminder || "",
    contacts: [],
    visits: [],
    quotes: [],
    contracts: []
  };
}

function toCustomerRow(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    primary_contact: item.contact,
    primary_phone: item.phone,
    need: item.need,
    status: item.status,
    next_visit_at: item.nextVisit,
    address: item.address,
    reminder: item.reminder
  };
}

function toCamelContract(row, payments) {
  const paid = payments
    .filter((payment) => payment.contract_id === row.id)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  return {
    id: row.id,
    number: row.contract_no,
    project: row.project_name,
    customer: row.customer_name,
    amount: Number(row.amount || 0),
    paid,
    node: row.payment_node,
    invoiceStatus: row.invoice_status,
    dueDate: row.due_date,
    overdueStatus: row.overdue_status,
    status: row.overdue_status
  };
}

function toContractRow(item) {
  return {
    id: item.id,
    contract_no: item.number,
    project_name: item.project,
    customer_name: item.customer,
    amount: Number(item.amount || 0),
    payment_node: item.node,
    invoice_status: item.invoiceStatus,
    due_date: item.dueDate,
    overdue_status: item.overdueStatus || item.status
  };
}

async function supabaseLoad() {
  const client = await getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const [
    customersResult,
    contactsResult,
    visitsResult,
    quotesResult,
    projectsResult,
    contractsResult,
    paymentsResult,
    expensesResult,
    attendanceResult,
    constructionLogsResult,
    workLogsResult,
    reimbursementsResult,
    overtimeResult
  ] = await Promise.all([
    client.from("customers").select("*").order("created_at", { ascending: false }),
    client.from("contacts").select("*").order("created_at", { ascending: false }),
    client.from("visits").select("*").order("visit_date", { ascending: false }),
    client.from("quotes").select("*").order("quote_date", { ascending: false }),
    client.from("projects").select("*").order("created_at", { ascending: false }),
    client.from("contracts").select("*").order("created_at", { ascending: false }),
    client.from("payments").select("*").order("payment_date", { ascending: false }),
    client.from("expenses").select("*").order("created_at", { ascending: false }),
    client.from("attendance_records").select("*").order("created_at", { ascending: false }),
    client.from("construction_logs").select("*").order("log_date", { ascending: false }),
    client.from("work_logs").select("*").order("log_date", { ascending: false }),
    client.from("reimbursements").select("*").order("created_at", { ascending: false }),
    client.from("overtime_records").select("*").order("overtime_date", { ascending: false })
  ]);

  const result = [customersResult, contactsResult, visitsResult, quotesResult, projectsResult, contractsResult, paymentsResult, expensesResult, attendanceResult, constructionLogsResult, workLogsResult, reimbursementsResult, overtimeResult].find((item) => item.error);
  if (result?.error) throw result.error;

  const customers = customersResult.data.map(toCamelCustomer);
  const customerById = new Map(customers.map((item) => [item.id, item]));
  contactsResult.data.forEach((row) => customerById.get(row.customer_id)?.contacts.push({ id: row.id, name: row.name, role: row.role, phone: row.phone }));
  visitsResult.data.forEach((row) => customerById.get(row.customer_id)?.visits.push({ id: row.id, date: row.visit_date, content: row.content }));
  quotesResult.data.forEach((row) => customerById.get(row.customer_id)?.quotes.push({ id: row.id, date: row.quote_date, name: row.name, amount: Number(row.amount || 0) }));

  const projects = projectsResult.data.map((row) => ({
    id: row.id,
    name: row.name,
    customer: row.customer_name,
    type: row.project_type,
    manager: row.manager,
    stage: row.stage,
    amount: Number(row.amount || 0),
    progress: Number(row.progress || 0),
    risk: row.risk,
    deadline: row.deadline
  }));

  const contracts = contractsResult.data.map((row) => toCamelContract(row, paymentsResult.data));
  contracts.forEach((contract) => {
    const customer = customers.find((item) => item.name === contract.customer);
    if (customer) customer.contracts.push(contract.id);
  });

  const expenses = expensesResult.data.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    amount: Number(row.amount || 0)
  }));

  const attendanceRecords = attendanceResult.data.map((row) => ({
    id: row.id, type: row.record_type, employeeName: row.employee_name, checkTime: row.check_time, location: row.location,
    projectName: row.project_name, isLate: row.is_late ? "是" : "否", isAbnormal: row.is_abnormal ? "是" : "否",
    photo: row.photo_url, status: row.status, remark: row.remark
  }));
  const constructionLogs = constructionLogsResult.data.map((row) => ({
    id: row.id, projectName: row.project_name, writer: row.writer, logDate: row.log_date, workerCount: row.worker_count,
    content: row.content, progress: Number(row.progress || 0), issues: row.issues, feedback: row.feedback,
    tomorrowPlan: row.tomorrow_plan, photo: row.photo_url, status: row.status, remark: row.remark
  }));
  const workLogs = workLogsResult.data.map((row) => ({
    id: row.id, employeeName: row.employee_name, logDate: row.log_date, content: row.content, customerName: row.customer_name,
    projectProgress: row.project_progress, issues: row.issues, tomorrowPlan: row.tomorrow_plan, status: row.status, remark: row.remark
  }));
  const reimbursements = reimbursementsResult.data.map((row) => ({
    id: row.id, employeeName: row.employee_name, type: row.reimbursement_type, amount: Number(row.amount || 0),
    projectName: row.project_name, invoicePhoto: row.invoice_photo_url, status: row.status, approver: row.approver, remark: row.remark
  }));
  const overtimeRecords = overtimeResult.data.map((row) => ({
    id: row.id, employeeName: row.employee_name, projectName: row.project_name, overtimeDate: row.overtime_date,
    startTime: row.start_time, endTime: row.end_time, reason: row.reason, hours: Number(row.hours || 0), status: row.status, remark: row.remark
  }));

  return normalizeDBShape({ customers, projects, contracts, employees: [], expenses, attendanceRecords, constructionLogs, workLogs, reimbursements, overtimeRecords });
}

async function loadDB() {
  if (configReady()) {
    try {
      const db = await supabaseLoad();
      dksyLastSource = "supabase";
      localSave(db);
      return db;
    } catch (error) {
      console.warn("Supabase load failed, using localStorage fallback.", error);
    }
  }

  dksyLastSource = "local";
  return localLoad();
}

async function saveDB(db) {
  localSave(db);
}

async function upsertCustomer(item) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("customers").upsert(toCustomerRow(item));
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase customer upsert failed, localStorage fallback remains active.", error);
    }
  }
}

async function deleteCustomer(id) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("customers").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase customer delete failed, localStorage fallback remains active.", error);
    }
  }
}

async function insertProject(item) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("projects").insert({
        id: item.id,
        name: item.name,
        customer_name: item.customer,
        project_type: item.type,
        manager: item.manager,
        stage: item.stage,
        amount: Number(item.amount || 0),
        progress: Number(item.progress || 0),
        risk: item.risk,
        deadline: item.deadline
      });
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase project insert failed, localStorage fallback remains active.", error);
    }
  }
}

async function updateProject(item) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("projects").update({
        name: item.name,
        customer_name: item.customer,
        project_type: item.type,
        manager: item.manager,
        stage: item.stage,
        amount: Number(item.amount || 0),
        progress: Number(item.progress || 0),
        risk: item.risk,
        deadline: item.deadline
      }).eq("id", item.id);
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase project update failed, localStorage fallback remains active.", error);
    }
  }
}

async function deleteProject(id) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("projects").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase project delete failed, localStorage fallback remains active.", error);
    }
  }
}

async function insertContract(item) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("contracts").insert(toContractRow(item));
      if (error) throw error;
      if (Number(item.paid) > 0) {
        const paymentResult = await client.from("payments").insert({
          contract_id: item.id,
          customer_name: item.customer,
          amount: Number(item.paid),
          payment_node: item.node,
          payment_date: item.dueDate,
          note: "合同创建时录入的已回款金额"
        });
        if (paymentResult.error) throw paymentResult.error;
      }
    } catch (error) {
      console.warn("Supabase contract insert failed, localStorage fallback remains active.", error);
    }
  }
}

async function updateContract(item) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("contracts").update(toContractRow(item)).eq("id", item.id);
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase contract update failed, localStorage fallback remains active.", error);
    }
  }
}

async function deleteContract(id) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("contracts").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase contract delete failed, localStorage fallback remains active.", error);
    }
  }
}

async function upsertExpense(item) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("expenses").upsert({
        id: item.id,
        name: item.name,
        category: item.category,
        amount: Number(item.amount || 0)
      });
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase expense upsert failed, localStorage fallback remains active.", error);
    }
  }
}

async function deleteExpense(id) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from("expenses").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase expense delete failed, localStorage fallback remains active.", error);
    }
  }
}

async function upsertOperational(table, item) {
  const map = {
    attendance_records: { id: item.id, record_type: item.type, employee_name: item.employeeName, check_time: item.checkTime, location: item.location, project_name: item.projectName, is_late: item.isLate === "是", is_abnormal: item.isAbnormal === "是", photo_url: item.photo, status: item.status || "正常", remark: item.remark },
    construction_logs: { id: item.id, project_name: item.projectName, writer: item.writer, log_date: item.logDate, worker_count: Number(item.workerCount || 0), content: item.content, progress: Number(item.progress || 0), issues: item.issues, feedback: item.feedback, tomorrow_plan: item.tomorrowPlan, photo_url: item.photo, status: item.status || "已提交", remark: item.remark },
    work_logs: { id: item.id, employee_name: item.employeeName, log_date: item.logDate, content: item.content, customer_name: item.customerName, project_progress: item.projectProgress, issues: item.issues, tomorrow_plan: item.tomorrowPlan, status: item.status || "已提交", remark: item.remark },
    reimbursements: { id: item.id, employee_name: item.employeeName, reimbursement_type: item.type, amount: Number(item.amount || 0), project_name: item.projectName, invoice_photo_url: item.invoicePhoto, status: item.status, approver: item.approver, remark: item.remark },
    overtime_records: { id: item.id, employee_name: item.employeeName, project_name: item.projectName, overtime_date: item.overtimeDate, start_time: item.startTime, end_time: item.endTime, reason: item.reason, hours: Number(item.hours || 0), status: item.status, remark: item.remark }
  };
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from(table).upsert(map[table]);
      if (error) throw error;
    } catch (error) {
      console.warn(`Supabase ${table} upsert failed, localStorage fallback remains active.`, error);
    }
  }
}

async function deleteOperational(table, id) {
  if (dksyLastSource === "supabase") {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.warn(`Supabase ${table} delete failed, localStorage fallback remains active.`, error);
    }
  }
}

window.DKSY_DB = {
  login,
  logout,
  getCurrentUser,
  getUserRole,
  requireAuth,
  hasPermission,
  rolePermissions: DKSY_ROLE_PERMISSIONS,
  loadDB,
  saveDB,
  upsertCustomer,
  deleteCustomer,
  insertProject,
  updateProject,
  deleteProject,
  insertContract,
  updateContract,
  deleteContract,
  upsertExpense,
  deleteExpense,
  upsertOperational,
  deleteOperational,
  getSource: () => dksyLastSource,
  fallbackDB: DKSY_FALLBACK_DB
};
