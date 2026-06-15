let db = null;
let currentUser = null;

function byId(id) {
  return document.getElementById(id);
}

function money(value) {
  return `${Number(value || 0).toLocaleString("zh-CN")} 元`;
}

function formValue(data, key) {
  const value = data.get(key);
  const input = document.querySelector(`[name="${key}"]`);
  if (input?.dataset.quickFile) {
    const name = input.dataset.quickFile;
    delete input.dataset.quickFile;
    return name;
  }
  if (value instanceof File) return value.name || "";
  return value || "";
}

function yuan(value) {
  return `${Math.round(Number(value || 0) / 10000)} 万`;
}

function nextId(prefix, list) {
  const max = list.reduce((value, item) => {
    const num = Number(String(item.id || "").split("-")[1]);
    return Number.isFinite(num) ? Math.max(value, num) : value;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function paymentReminder(item) {
  const unpaid = Number(item.amount) - Number(item.paid);
  if (unpaid <= 0) return "已回款完成，做好发票和验收资料归档。";
  const status = item.overdueStatus || item.status;
  const prefix = status.includes("逾期") ? "该笔款项已逾期，建议今天联系客户财务。" : "该笔款项尚未结清，建议提前确认付款流程。";
  return `${prefix} 项目“${item.project}”未回款 ${yuan(unpaid)}，付款节点为${item.node}，请确认发票状态“${item.invoiceStatus}”及客户内部审批进度。`;
}

function labelTables() {
  document.querySelectorAll("table").forEach((table) => {
    const headers = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    table.querySelectorAll("tbody tr").forEach((row) => {
      [...row.children].forEach((cell, index) => {
        if (headers[index]) cell.dataset.label = headers[index];
      });
    });
  });
}

function afterRender() {
  labelTables();
}

async function persistDB() {
  await window.DKSY_DB.saveDB(db);
}

function getCustomerFilters() {
  const keyword = (byId("customerSearch")?.value || "").trim().toLowerCase();
  const category = byId("customerFilter")?.value || "";
  return { keyword, category };
}

function filteredCustomers() {
  const { keyword, category } = getCustomerFilters();
  return db.customers.filter((item) => {
    const text = [item.name, item.category, item.contact, item.phone, item.need, item.status, item.nextVisit].join(" ").toLowerCase();
    return (!keyword || text.includes(keyword)) && (!category || item.category === category);
  });
}

function renderDashboard() {
  const totalContract = db.contracts.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalPaid = db.contracts.reduce((sum, item) => sum + Number(item.paid), 0);
  const overdue = db.contracts.filter((item) => (item.overdueStatus || item.status).includes("逾期")).length;
  const avgProgress = db.projects.length
    ? Math.round(db.projects.reduce((sum, item) => sum + Number(item.progress), 0) / db.projects.length)
    : 0;

  byId("kpiCustomers").textContent = db.customers.length;
  byId("kpiProjects").textContent = db.projects.length;
  byId("kpiContracts").textContent = yuan(totalContract);
  byId("kpiUnpaid").textContent = yuan(totalContract - totalPaid);
  byId("dashboardHint").textContent = `当前数据源：${window.DKSY_DB.getSource()}。当前有 ${overdue} 个回款预警，项目平均进度 ${avgProgress}%。`;
  if (byId("todayAbnormal")) {
    byId("todayAbnormal").textContent = db.attendanceRecords.filter((item) => item.isAbnormal === "是" || item.status === "异常").length;
    byId("todayConstruction").textContent = db.constructionLogs.length;
    byId("pendingReimbursements").textContent = db.reimbursements.filter((item) => item.status === "待审批").length;
    byId("pendingOvertime").textContent = db.overtimeRecords.filter((item) => item.status === "待审批").length;
    byId("overduePayments").textContent = overdue;
  }

  byId("dashboardProjects").innerHTML = db.projects.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.customer}</td>
      <td>${item.stage}</td>
      <td><div class="progress"><span style="--p:${item.progress}%"></span></div></td>
      <td>${item.progress}%</td>
    </tr>
  `).join("");
  afterRender();
}

function pageFromHref(href) {
  if (href.includes("dashboard")) return "dashboard";
  if (href.includes("customers") || href.includes("customer-detail")) return "customers";
  if (href.includes("projects")) return "projects";
  if (href.includes("contracts")) return "contracts";
  if (href.includes("finance")) return "finance";
  if (href.includes("attendance")) return "attendance";
  if (href.includes("construction-logs")) return "construction-logs";
  if (href.includes("work-logs")) return "work-logs";
  if (href.includes("reimbursements")) return "reimbursements";
  if (href.includes("overtime")) return "overtime";
  if (href.includes("ai-assistant")) return "ai";
  return "";
}

function applyRoleUI(user) {
  document.querySelectorAll(".menu a").forEach((link) => {
    const page = pageFromHref(link.getAttribute("href") || "");
    link.classList.toggle("active", page === document.body.dataset.page);
    if (page && !window.DKSY_DB.hasPermission(user.role, page)) {
      link.hidden = true;
    }
  });

  const actions = document.querySelector(".topbar .actions");
  if (actions) {
    const userBadge = document.createElement("span");
    userBadge.className = "user-badge";
    userBadge.textContent = `${user.name || user.email} · ${user.role}`;
    actions.prepend(userBadge);
  }

  document.querySelectorAll('a[href="./login.html"]').forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      await window.DKSY_DB.logout();
      window.location.href = "./login.html";
    });
  });
}

function visibleByRole(list, nameField = "employeeName") {
  if (currentUser?.role !== "sales") return list;
  return list.filter((item) => item[nameField] === currentUser.name);
}

function renderCustomers() {
  const rows = filteredCustomers().map((item) => `
    <tr>
      <td><a href="./customer-detail.html?id=${encodeURIComponent(item.id)}">${item.name}</a></td>
      <td><span class="tag">${item.category}</span></td>
      <td>${item.contact}</td>
      <td>${item.phone}</td>
      <td>${item.need}</td>
      <td><span class="status">${item.status}</span></td>
      <td>${item.nextVisit}</td>
      <td>
        <div class="row-actions">
          <a class="btn" href="./customer-detail.html?id=${encodeURIComponent(item.id)}">详情</a>
          <button class="btn" data-edit-customer="${item.id}">编辑</button>
          <button class="btn danger" data-delete-customer="${item.id}">删除</button>
        </div>
      </td>
    </tr>
  `).join("");
  byId("customerRows").innerHTML = rows || `<tr><td colspan="8">没有找到客户。</td></tr>`;
  afterRender();
}

function renderProjects() {
  byId("projectRows").innerHTML = db.projects.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.customer}</td>
      <td>${item.manager}</td>
      <td><span class="status">${item.stage}</span></td>
      <td>${yuan(item.amount)}</td>
      <td><div class="progress"><span style="--p:${item.progress}%"></span></div>${item.progress}%</td>
      <td>${item.risk}</td>
      <td>${item.deadline}</td>
      <td>
        <div class="row-actions">
          <button class="btn" data-edit-project="${item.id}">编辑</button>
          <button class="btn danger" data-delete-project="${item.id}">删除</button>
        </div>
      </td>
    </tr>
  `).join("");
  afterRender();
}

function renderContracts() {
  byId("contractRows").innerHTML = db.contracts.map((item) => {
    const unpaid = Number(item.amount) - Number(item.paid);
    const danger = (item.overdueStatus || "").includes("逾期") ? " danger" : "";
    return `
      <tr>
        <td>${item.number}</td>
        <td>${item.project}</td>
        <td>${item.customer}</td>
        <td>${yuan(item.amount)}</td>
        <td>${yuan(item.paid)}</td>
        <td class="${unpaid > 0 ? "money-alert" : ""}">${yuan(unpaid)}</td>
        <td>${item.node}</td>
        <td>${item.invoiceStatus}</td>
        <td><span class="status${danger}">${item.overdueStatus}</span></td>
        <td>${paymentReminder(item)}</td>
        <td>
          <div class="row-actions">
            <button class="btn" data-edit-contract="${item.id}">编辑</button>
            <button class="btn danger" data-delete-contract="${item.id}">删除</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
  afterRender();
}

function renderFinance() {
  const expenseTotal = db.expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const contractTotal = db.contracts.reduce((sum, item) => sum + Number(item.amount), 0);
  const paidTotal = db.contracts.reduce((sum, item) => sum + Number(item.paid), 0);

  byId("financePaid").textContent = yuan(paidTotal);
  byId("financeUnpaid").textContent = yuan(contractTotal - paidTotal);
  byId("financeCost").textContent = yuan(expenseTotal);

  byId("financeRows").innerHTML = db.contracts.map((item) => {
    const unpaid = Number(item.amount) - Number(item.paid);
    return `
      <tr>
        <td>${item.project}</td>
        <td>${yuan(item.amount)}</td>
        <td>${yuan(item.paid)}</td>
        <td class="money-alert">${yuan(unpaid)}</td>
        <td>${item.node}</td>
        <td>${item.overdueStatus}</td>
      </tr>
    `;
  }).join("");

  byId("expenseRows").innerHTML = db.expenses.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${money(item.amount)}</td>
      <td>
        <div class="row-actions">
          <button class="btn" data-edit-expense="${item.id}">编辑</button>
          <button class="btn danger" data-delete-expense="${item.id}">删除</button>
        </div>
      </td>
    </tr>
  `).join("");
  afterRender();
}

function renderAttendance() {
  const rows = visibleByRole(db.attendanceRecords).map((item) => `
    <tr><td>${item.type}</td><td>${item.employeeName}</td><td>${item.checkTime}</td><td>${item.location}</td><td>${item.projectName || "-"}</td><td>${item.isLate}</td><td>${item.isAbnormal}</td><td>${item.photo || "-"}</td><td>${item.remark || ""}</td><td><div class="row-actions"><button class="btn" data-edit-attendance="${item.id}">编辑</button><button class="btn danger" data-delete-attendance="${item.id}">删除</button></div></td></tr>
  `).join("");
  byId("attendanceRows").innerHTML = rows || `<tr><td colspan="10">暂无考勤记录。</td></tr>`;
  afterRender();
}

function renderConstructionLogs() {
  byId("constructionLogRows").innerHTML = db.constructionLogs.map((item) => `
    <tr><td>${item.projectName}</td><td>${item.writer}</td><td>${item.logDate}</td><td>${item.workerCount}</td><td>${item.content}</td><td>${item.progress}%</td><td>${item.issues || ""}</td><td>${item.feedback || ""}</td><td>${item.tomorrowPlan || ""}</td><td>${item.photo || "-"}</td><td><div class="row-actions"><button class="btn" data-edit-construction-log="${item.id}">编辑</button><button class="btn danger" data-delete-construction-log="${item.id}">删除</button></div></td></tr>
  `).join("");
  afterRender();
}

function renderWorkLogs() {
  const rows = visibleByRole(db.workLogs).map((item) => `
    <tr><td>${item.employeeName}</td><td>${item.logDate}</td><td>${item.content}</td><td>${item.customerName || ""}</td><td>${item.projectProgress || ""}</td><td>${item.issues || ""}</td><td>${item.tomorrowPlan || ""}</td><td><div class="row-actions"><button class="btn" data-edit-work-log="${item.id}">编辑</button><button class="btn danger" data-delete-work-log="${item.id}">删除</button></div></td></tr>
  `).join("");
  byId("workLogRows").innerHTML = rows || `<tr><td colspan="8">暂无工作日志。</td></tr>`;
  afterRender();
}

function renderReimbursements() {
  byId("reimbursementRows").innerHTML = db.reimbursements.map((item) => `
    <tr><td>${item.employeeName}</td><td>${item.type}</td><td>${money(item.amount)}</td><td>${item.projectName || ""}</td><td>${item.invoicePhoto || "-"}</td><td><span class="status">${item.status}</span></td><td>${item.approver || ""}</td><td>${item.remark || ""}</td><td><div class="row-actions"><button class="btn" data-edit-reimbursement="${item.id}">编辑</button><button class="btn danger" data-delete-reimbursement="${item.id}">删除</button></div></td></tr>
  `).join("");
  afterRender();
}

function renderOvertime() {
  byId("overtimeRows").innerHTML = db.overtimeRecords.map((item) => `
    <tr><td>${item.employeeName}</td><td>${item.projectName || ""}</td><td>${item.overtimeDate}</td><td>${item.startTime}</td><td>${item.endTime}</td><td>${item.hours} 小时</td><td>${item.reason}</td><td><span class="status">${item.status}</span></td><td><div class="row-actions"><button class="btn" data-edit-overtime="${item.id}">编辑</button><button class="btn danger" data-delete-overtime="${item.id}">删除</button></div></td></tr>
  `).join("");
  afterRender();
}

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = (eh * 60 + em) - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

function setupGenericOps(config) {
  const form = byId(config.formId);
  const tbody = byId(config.rowsId);
  if (!form || !tbody) return;

  byId(config.cancelId).addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
    byId(config.submitId).textContent = config.addText;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const id = data.get("id");
    const item = config.build(data, id || nextId(config.prefix, db[config.listKey]));
    const index = db[config.listKey].findIndex((row) => row.id === id);
    if (index >= 0) db[config.listKey][index] = item;
    else db[config.listKey].unshift(item);
    await window.DKSY_DB.upsertOperational(config.table, item);
    await persistDB();
    form.reset();
    form.elements.id.value = "";
    byId(config.submitId).textContent = config.addText;
    config.render();
  });

  tbody.addEventListener("click", async (event) => {
    const editId = event.target.dataset[config.editDataset];
    const deleteId = event.target.dataset[config.deleteDataset];
    if (editId) {
      const item = db[config.listKey].find((row) => row.id === editId);
      if (!item) return;
      Object.entries(config.fill(item)).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value ?? "";
      });
      form.elements.id.value = item.id;
      byId(config.submitId).textContent = "保存修改";
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (deleteId) {
      const item = db[config.listKey].find((row) => row.id === deleteId);
      if (!item || !confirm(`确认删除这条记录？`)) return;
      db[config.listKey] = db[config.listKey].filter((row) => row.id !== deleteId);
      await window.DKSY_DB.deleteOperational(config.table, deleteId);
      await persistDB();
      config.render();
    }
  });
}

function setupCustomerForm() {
  const form = byId("customerForm");
  if (!form) return;

  byId("customerSearch").addEventListener("input", renderCustomers);
  byId("customerFilter").addEventListener("change", renderCustomers);
  byId("customerCancel").addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
    byId("customerSubmit").textContent = "新增客户";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const id = data.get("id");
    const payload = {
      id: id || nextId("C", db.customers),
      name: data.get("name"),
      category: data.get("category"),
      contact: data.get("contact"),
      phone: data.get("phone"),
      need: data.get("need"),
      status: data.get("status"),
      nextVisit: data.get("nextVisit"),
      address: data.get("address") || "待补充",
      contacts: [{ name: data.get("contact"), role: "主要联系人", phone: data.get("phone") }],
      visits: [],
      quotes: [],
      contracts: [],
      reminder: data.get("reminder") || `${data.get("nextVisit")} 前完成跟进。`
    };

    const index = db.customers.findIndex((item) => item.id === id);
    if (index >= 0) db.customers[index] = { ...db.customers[index], ...payload };
    else db.customers.unshift(payload);

    await window.DKSY_DB.upsertCustomer(payload);
    await persistDB();
    form.reset();
    form.elements.id.value = "";
    byId("customerSubmit").textContent = "新增客户";
    renderCustomers();
  });

  byId("customerRows").addEventListener("click", async (event) => {
    const editId = event.target.dataset.editCustomer;
    const deleteId = event.target.dataset.deleteCustomer;

    if (editId) {
      const item = db.customers.find((customer) => customer.id === editId);
      if (!item) return;
      form.elements.id.value = item.id;
      form.elements.name.value = item.name;
      form.elements.category.value = item.category;
      form.elements.contact.value = item.contact;
      form.elements.phone.value = item.phone;
      form.elements.need.value = item.need;
      form.elements.status.value = item.status;
      form.elements.nextVisit.value = item.nextVisit;
      form.elements.address.value = item.address || "";
      form.elements.reminder.value = item.reminder || "";
      byId("customerSubmit").textContent = "保存修改";
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (deleteId) {
      const item = db.customers.find((customer) => customer.id === deleteId);
      if (!item || !confirm(`确认删除客户“${item.name}”？`)) return;
      db.customers = db.customers.filter((customer) => customer.id !== deleteId);
      await window.DKSY_DB.deleteCustomer(deleteId);
      await persistDB();
      renderCustomers();
    }
  });
}

function setupProjectForm() {
  const form = byId("projectForm");
  if (!form) return;

  byId("projectCancel").addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
    byId("projectSubmit").textContent = "新增项目";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const id = data.get("id");
    const item = {
      id: id || nextId("P", db.projects),
      name: data.get("name"),
      customer: data.get("customer"),
      type: data.get("type"),
      manager: data.get("manager"),
      stage: data.get("stage"),
      amount: Number(data.get("amount")),
      progress: Number(data.get("progress")),
      deadline: data.get("deadline"),
      risk: data.get("risk")
    };

    const index = db.projects.findIndex((project) => project.id === id);
    if (index >= 0) {
      db.projects[index] = item;
      await window.DKSY_DB.updateProject(item);
    }
    else {
      db.projects.unshift(item);
      await window.DKSY_DB.insertProject(item);
    }

    await persistDB();
    form.reset();
    form.elements.id.value = "";
    byId("projectSubmit").textContent = "新增项目";
    renderProjects();
  });

  byId("projectRows").addEventListener("click", async (event) => {
    const editId = event.target.dataset.editProject;
    const deleteId = event.target.dataset.deleteProject;

    if (editId) {
      const item = db.projects.find((project) => project.id === editId);
      if (!item) return;
      form.elements.id.value = item.id;
      form.elements.name.value = item.name;
      form.elements.customer.value = item.customer;
      form.elements.type.value = item.type;
      form.elements.manager.value = item.manager;
      form.elements.stage.value = item.stage;
      form.elements.amount.value = item.amount;
      form.elements.progress.value = item.progress;
      form.elements.deadline.value = item.deadline;
      form.elements.risk.value = item.risk;
      byId("projectSubmit").textContent = "保存修改";
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (deleteId) {
      const item = db.projects.find((project) => project.id === deleteId);
      if (!item || !confirm(`确认删除项目“${item.name}”？`)) return;
      db.projects = db.projects.filter((project) => project.id !== deleteId);
      await window.DKSY_DB.deleteProject(deleteId);
      await persistDB();
      renderProjects();
    }
  });
}

function setupContractForm() {
  const form = byId("contractForm");
  if (!form) return;

  byId("contractCancel").addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
    byId("contractSubmit").textContent = "新增合同";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const id = data.get("id");
    const overdueStatus = data.get("overdueStatus");
    const item = {
      id: id || nextId("HT", db.contracts),
      number: data.get("number"),
      project: data.get("project"),
      customer: data.get("customer"),
      amount: Number(data.get("amount")),
      paid: Number(data.get("paid")),
      node: data.get("node"),
      invoiceStatus: data.get("invoiceStatus"),
      dueDate: data.get("dueDate"),
      overdueStatus,
      status: overdueStatus
    };

    const index = db.contracts.findIndex((contract) => contract.id === id);
    if (index >= 0) {
      db.contracts[index] = item;
      await window.DKSY_DB.updateContract(item);
    }
    else {
      db.contracts.unshift(item);
      await window.DKSY_DB.insertContract(item);
    }

    await persistDB();
    form.reset();
    form.elements.id.value = "";
    byId("contractSubmit").textContent = "新增合同";
    renderContracts();
  });

  byId("contractRows").addEventListener("click", async (event) => {
    const editId = event.target.dataset.editContract;
    const deleteId = event.target.dataset.deleteContract;

    if (editId) {
      const item = db.contracts.find((contract) => contract.id === editId);
      if (!item) return;
      form.elements.id.value = item.id;
      form.elements.number.value = item.number;
      form.elements.project.value = item.project;
      form.elements.customer.value = item.customer;
      form.elements.amount.value = item.amount;
      form.elements.paid.value = item.paid;
      form.elements.node.value = item.node;
      form.elements.invoiceStatus.value = item.invoiceStatus;
      form.elements.dueDate.value = item.dueDate;
      form.elements.overdueStatus.value = item.overdueStatus;
      byId("contractSubmit").textContent = "保存修改";
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (deleteId) {
      const item = db.contracts.find((contract) => contract.id === deleteId);
      if (!item || !confirm(`确认删除合同“${item.number}”？`)) return;
      db.contracts = db.contracts.filter((contract) => contract.id !== deleteId);
      await window.DKSY_DB.deleteContract(deleteId);
      await persistDB();
      renderContracts();
    }
  });
}

function setupExpenseForm() {
  const form = byId("expenseForm");
  if (!form) return;

  byId("expenseCancel").addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
    byId("expenseSubmit").textContent = "新增费用";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const id = data.get("id");
    const item = {
      id: id || nextId("F", db.expenses),
      name: data.get("name"),
      category: data.get("category"),
      amount: Number(data.get("amount"))
    };

    const index = db.expenses.findIndex((expense) => expense.id === id);
    if (index >= 0) db.expenses[index] = item;
    else db.expenses.unshift(item);

    await window.DKSY_DB.upsertExpense(item);
    await persistDB();
    form.reset();
    form.elements.id.value = "";
    byId("expenseSubmit").textContent = "新增费用";
    renderFinance();
  });

  byId("expenseRows").addEventListener("click", async (event) => {
    const editId = event.target.dataset.editExpense;
    const deleteId = event.target.dataset.deleteExpense;

    if (editId) {
      const item = db.expenses.find((expense) => expense.id === editId);
      if (!item) return;
      form.elements.id.value = item.id;
      form.elements.name.value = item.name;
      form.elements.category.value = item.category;
      form.elements.amount.value = item.amount;
      byId("expenseSubmit").textContent = "保存修改";
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (deleteId) {
      const item = db.expenses.find((expense) => expense.id === deleteId);
      if (!item || !confirm(`确认删除费用“${item.name}”？`)) return;
      db.expenses = db.expenses.filter((expense) => expense.id !== deleteId);
      await window.DKSY_DB.deleteExpense(deleteId);
      await persistDB();
      renderFinance();
    }
  });
}

function renderCustomerDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  const customer = db.customers.find((item) => item.id === id) || db.customers[0];
  if (!customer) return;

  byId("detailTitle").textContent = customer.name;
  byId("detailBasic").innerHTML = `
    <dt>客户类型</dt><dd>${customer.category}</dd>
    <dt>联系人</dt><dd>${customer.contact}</dd>
    <dt>电话</dt><dd>${customer.phone}</dd>
    <dt>项目需求</dt><dd>${customer.need}</dd>
    <dt>跟进状态</dt><dd>${customer.status}</dd>
    <dt>客户地址</dt><dd>${customer.address || "待补充"}</dd>
    <dt>下次拜访</dt><dd>${customer.nextVisit}</dd>
  `;
  byId("detailReminder").textContent = customer.reminder || "暂无提醒。";
  byId("detailContacts").innerHTML = (customer.contacts || []).map((item) => `<article><strong>${item.name}</strong><br><span class="muted">${item.role} · ${item.phone}</span></article>`).join("") || "<p class='muted'>暂无联系人。</p>";
  byId("detailVisits").innerHTML = (customer.visits || []).map((item) => `<article><strong>${item.date}</strong><br>${item.content}</article>`).join("") || "<p class='muted'>暂无拜访记录。</p>";
  byId("detailQuotes").innerHTML = (customer.quotes || []).map((item) => `<article><strong>${item.name}</strong><br><span class="muted">${item.date} · ${yuan(item.amount)}</span></article>`).join("") || "<p class='muted'>暂无报价记录。</p>";

  const relatedContracts = db.contracts.filter((item) => item.customer === customer.name || (customer.contracts || []).includes(item.id));
  byId("detailContracts").innerHTML = relatedContracts.map((item) => {
    const unpaid = Number(item.amount) - Number(item.paid);
    return `<article><strong>${item.number} · ${item.project}</strong><br><span class="muted">合同 ${yuan(item.amount)}，未回款 ${yuan(unpaid)}，${item.overdueStatus}</span></article>`;
  }).join("") || "<p class='muted'>暂无合同记录。</p>";
}

function setupAI() {
  const output = byId("aiOutput");
  if (!output) return;

  document.querySelectorAll("[data-ai]").forEach((button) => {
    button.addEventListener("click", () => {
      const customer = byId("aiCustomer").value || "目标客户";
      const scenario = byId("aiScenario").value;
      const type = button.dataset.ai;
      if (type === "visit") output.textContent = `《${customer}${scenario}拜访计划》\n\n1. 拜访目的：确认客户现有系统问题、预算周期、审批流程和项目启动时间。\n2. 沟通对象：总务、保卫、信息中心、后勤或园区工程负责人。\n3. 现场重点：点位数量、弱电井、机房条件、网络链路、施工窗口。\n4. 拜访后输出：现场纪要、初步清单、风险问题、下一步报价资料。`;
      else if (type === "solution") output.textContent = `《${customer}${scenario}项目方案》\n\n建议按前端设备、传输网络、中心平台、机房配套、施工服务、验收资料六部分拆分。先做现场勘查和点位复核，再形成设备清单、施工边界、工期计划和报价口径。`;
      else output.textContent = `《${customer}${scenario}催款话术》\n\n您好，项目已到合同约定付款节点。我们想和您确认一下贵单位付款流程当前进度，如需补充发票、验收单、设备清单或竣工资料，我们今天安排同事配合补齐，方便后续维保和资料归档。`;
    });
  });
}

function setupAttendance() {
  const currentTime = byId("currentTime");
  const quickLocation = byId("quickLocation");
  const quickProject = byId("quickProject");
  const quickPunch = byId("quickPunch");
  const form = byId("attendanceForm");

  const updateTime = () => {
    if (!currentTime) return;
    const now = new Date();
    currentTime.textContent = now.toLocaleString("zh-CN", { hour12: false });
  };
  updateTime();
  setInterval(updateTime, 30000);

  if (navigator.geolocation && quickLocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        quickLocation.value = `经度 ${position.coords.longitude.toFixed(6)}，纬度 ${position.coords.latitude.toFixed(6)}`;
      },
      () => {
        quickLocation.placeholder = "定位未授权，请手动填写地点";
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  quickPunch?.addEventListener("click", () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    form.elements.type.value = "外勤打卡";
    form.elements.employeeName.value = currentUser?.role === "sales" ? currentUser.name : (form.elements.employeeName.value || currentUser?.name || "");
    form.elements.checkTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    form.elements.location.value = quickLocation.value || "现场位置待补充";
    form.elements.projectName.value = quickProject.value || form.elements.projectName.value;
    const photo = byId("quickPhoto");
    if (photo?.files?.[0]) form.elements.photo.dataset.quickFile = photo.files[0].name;
    form.requestSubmit();
  });

  setupGenericOps({
    formId: "attendanceForm", rowsId: "attendanceRows", cancelId: "attendanceCancel", submitId: "attendanceSubmit",
    addText: "新增记录", listKey: "attendanceRecords", prefix: "A", table: "attendance_records",
    editDataset: "editAttendance", deleteDataset: "deleteAttendance", render: renderAttendance,
    build: (data, id) => ({ id, type: data.get("type"), employeeName: currentUser?.role === "sales" ? currentUser.name : data.get("employeeName"), checkTime: data.get("checkTime"), location: data.get("location"), projectName: data.get("projectName"), isLate: data.get("isLate"), isAbnormal: data.get("isAbnormal"), photo: formValue(data, "photo"), status: data.get("isAbnormal") === "是" ? "异常" : "正常", remark: data.get("remark") }),
    fill: (item) => item
  });
}

function setupConstructionLogs() {
  setupGenericOps({
    formId: "constructionLogForm", rowsId: "constructionLogRows", cancelId: "constructionLogCancel", submitId: "constructionLogSubmit",
    addText: "新增日志", listKey: "constructionLogs", prefix: "CL", table: "construction_logs",
    editDataset: "editConstructionLog", deleteDataset: "deleteConstructionLog", render: renderConstructionLogs,
    build: (data, id) => ({ id, projectName: data.get("projectName"), writer: data.get("writer"), logDate: data.get("logDate"), workerCount: Number(data.get("workerCount")), content: data.get("content"), progress: Number(data.get("progress")), issues: data.get("issues"), feedback: data.get("feedback"), tomorrowPlan: data.get("tomorrowPlan"), photo: formValue(data, "photo"), status: "已提交", remark: "" }),
    fill: (item) => item
  });
}

function setupWorkLogs() {
  setupGenericOps({
    formId: "workLogForm", rowsId: "workLogRows", cancelId: "workLogCancel", submitId: "workLogSubmit",
    addText: "新增日志", listKey: "workLogs", prefix: "WL", table: "work_logs",
    editDataset: "editWorkLog", deleteDataset: "deleteWorkLog", render: renderWorkLogs,
    build: (data, id) => ({ id, employeeName: currentUser?.role === "sales" ? currentUser.name : data.get("employeeName"), logDate: data.get("logDate"), content: data.get("content"), customerName: data.get("customerName"), projectProgress: data.get("projectProgress"), issues: data.get("issues"), tomorrowPlan: data.get("tomorrowPlan"), status: "已提交", remark: "" }),
    fill: (item) => item
  });
}

function setupReimbursements() {
  setupGenericOps({
    formId: "reimbursementForm", rowsId: "reimbursementRows", cancelId: "reimbursementCancel", submitId: "reimbursementSubmit",
    addText: "新增报销", listKey: "reimbursements", prefix: "R", table: "reimbursements",
    editDataset: "editReimbursement", deleteDataset: "deleteReimbursement", render: renderReimbursements,
    build: (data, id) => ({ id, employeeName: data.get("employeeName"), type: data.get("type"), amount: Number(data.get("amount")), projectName: data.get("projectName"), invoicePhoto: formValue(data, "invoicePhoto"), status: data.get("status"), approver: data.get("approver"), remark: data.get("remark") }),
    fill: (item) => item
  });
}

function setupOvertime() {
  setupGenericOps({
    formId: "overtimeForm", rowsId: "overtimeRows", cancelId: "overtimeCancel", submitId: "overtimeSubmit",
    addText: "新增加班", listKey: "overtimeRecords", prefix: "OT", table: "overtime_records",
    editDataset: "editOvertime", deleteDataset: "deleteOvertime", render: renderOvertime,
    build: (data, id) => ({ id, employeeName: data.get("employeeName"), projectName: data.get("projectName"), overtimeDate: data.get("overtimeDate"), startTime: data.get("startTime"), endTime: data.get("endTime"), reason: data.get("reason"), hours: calcHours(data.get("startTime"), data.get("endTime")), status: data.get("status"), remark: "" }),
    fill: (item) => item
  });
}

function applySalesDefaults(page) {
  if (currentUser?.role !== "sales") return;
  if (page === "attendance" && byId("attendanceForm")) byId("attendanceForm").elements.employeeName.value = currentUser.name;
  if (page === "work-logs" && byId("workLogForm")) byId("workLogForm").elements.employeeName.value = currentUser.name;
}

async function boot() {
  const page = document.body.dataset.page;
  currentUser = await window.DKSY_DB.requireAuth(page);
  if (!currentUser) return;
  applyRoleUI(currentUser);

  db = await window.DKSY_DB.loadDB();
  applySalesDefaults(page);

  if (page === "dashboard") renderDashboard();
  if (page === "customers") {
    renderCustomers();
    setupCustomerForm();
  }
  if (page === "customer-detail") renderCustomerDetail();
  if (page === "projects") {
    renderProjects();
    setupProjectForm();
  }
  if (page === "contracts") {
    renderContracts();
    setupContractForm();
  }
  if (page === "finance") {
    renderFinance();
    setupExpenseForm();
  }
  if (page === "attendance") {
    renderAttendance();
    setupAttendance();
  }
  if (page === "construction-logs") {
    renderConstructionLogs();
    setupConstructionLogs();
  }
  if (page === "work-logs") {
    renderWorkLogs();
    setupWorkLogs();
  }
  if (page === "reimbursements") {
    renderReimbursements();
    setupReimbursements();
  }
  if (page === "overtime") {
    renderOvertime();
    setupOvertime();
  }
  if (page === "ai") setupAI();
}

boot();
