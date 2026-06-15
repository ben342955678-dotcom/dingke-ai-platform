create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  auth_user_id uuid unique,
  name text not null,
  phone text,
  role text not null default '员工',
  department text,
  status text not null default '在职'
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('boss', 'sales', 'project', 'finance', 'admin')),
  department text,
  phone text,
  status text not null default 'active'
);

create table if not exists public.customers (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  name text not null,
  category text not null check (category in ('学校', '医院', '政府', '企业园区', '总包单位', '合作伙伴')),
  primary_contact text,
  primary_phone text,
  need text,
  status text not null default '初步沟通',
  next_visit_at text,
  address text,
  reminder text,
  remark text
);

create table if not exists public.contacts (
  id text primary key default ('CT-' || substr(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  customer_id text not null references public.customers(id) on delete cascade,
  name text not null,
  role text,
  phone text,
  email text,
  is_primary boolean not null default false,
  remark text
);

create table if not exists public.visits (
  id text primary key default ('V-' || substr(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  customer_id text not null references public.customers(id) on delete cascade,
  visit_date date not null,
  visitor text,
  content text not null,
  next_action text
);

create table if not exists public.quotes (
  id text primary key default ('Q-' || substr(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  customer_id text not null references public.customers(id) on delete cascade,
  quote_date date not null,
  name text not null,
  amount numeric(14,2) not null default 0,
  status text not null default '草案',
  file_url text,
  remark text
);

create table if not exists public.projects (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  customer_id text references public.customers(id) on delete set null,
  customer_name text not null,
  name text not null,
  project_type text not null,
  manager text not null,
  stage text not null check (stage in ('线索', '方案', '报价', '合同', '施工', '验收', '回款', '完成')),
  amount numeric(14,2) not null default 0,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  risk text,
  deadline date,
  remark text
);

create table if not exists public.contracts (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  contract_no text not null unique,
  customer_id text references public.customers(id) on delete set null,
  customer_name text not null,
  project_id text references public.projects(id) on delete set null,
  project_name text not null,
  amount numeric(14,2) not null default 0,
  payment_node text not null,
  invoice_status text not null default '未开票',
  due_date date,
  overdue_status text not null default '未逾期',
  remark text
);

create table if not exists public.payments (
  id text primary key default ('PAY-' || substr(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  contract_id text not null references public.contracts(id) on delete cascade,
  customer_name text,
  amount numeric(14,2) not null default 0,
  payment_node text,
  payment_date date,
  payment_method text,
  note text
);

create table if not exists public.expenses (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  name text not null,
  category text not null check (category in ('员工工资', '房租', '车辆费用', '办公费用', '供应商欠款', '项目支出')),
  amount numeric(14,2) not null default 0,
  expense_date date default current_date,
  related_project_id text references public.projects(id) on delete set null,
  vendor text,
  status text not null default '待处理',
  remark text
);

create table if not exists public.attendance_records (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  project_id text references public.projects(id) on delete set null,
  project_name text,
  status text not null default '正常',
  remark text,
  record_type text not null check (record_type in ('办公室打卡', '外勤打卡')),
  employee_name text not null,
  check_time text not null,
  location text not null,
  is_late boolean not null default false,
  is_abnormal boolean not null default false,
  photo_url text
);

create table if not exists public.construction_logs (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  project_id text references public.projects(id) on delete set null,
  project_name text not null,
  status text not null default '已提交',
  remark text,
  writer text not null,
  log_date date not null,
  worker_count integer not null default 0,
  content text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  issues text,
  feedback text,
  tomorrow_plan text,
  photo_url text
);

create table if not exists public.work_logs (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  project_id text references public.projects(id) on delete set null,
  project_name text,
  status text not null default '已提交',
  remark text,
  employee_name text not null,
  log_date date not null,
  content text not null,
  customer_name text,
  project_progress text,
  issues text,
  tomorrow_plan text
);

create table if not exists public.reimbursements (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  project_id text references public.projects(id) on delete set null,
  project_name text,
  status text not null default '待审批' check (status in ('待审批', '已通过', '已驳回')),
  remark text,
  employee_name text not null,
  reimbursement_type text not null check (reimbursement_type in ('油费', '停车费', '材料费', '餐费', '住宿费', '工具费', '其他')),
  amount numeric(14,2) not null default 0,
  invoice_photo_url text,
  approver text
);

create table if not exists public.overtime_records (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null default coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  project_id text references public.projects(id) on delete set null,
  project_name text,
  status text not null default '待审批' check (status in ('待审批', '已通过', '已驳回')),
  remark text,
  employee_name text not null,
  overtime_date date not null,
  start_time time not null,
  end_time time not null,
  reason text not null,
  hours numeric(6,2) not null default 0
);

drop trigger if exists set_users_updated_at on public.users;
drop trigger if exists set_profiles_updated_at on public.profiles;
drop trigger if exists set_customers_updated_at on public.customers;
drop trigger if exists set_contacts_updated_at on public.contacts;
drop trigger if exists set_visits_updated_at on public.visits;
drop trigger if exists set_quotes_updated_at on public.quotes;
drop trigger if exists set_projects_updated_at on public.projects;
drop trigger if exists set_contracts_updated_at on public.contracts;
drop trigger if exists set_payments_updated_at on public.payments;
drop trigger if exists set_expenses_updated_at on public.expenses;
drop trigger if exists set_attendance_records_updated_at on public.attendance_records;
drop trigger if exists set_construction_logs_updated_at on public.construction_logs;
drop trigger if exists set_work_logs_updated_at on public.work_logs;
drop trigger if exists set_reimbursements_updated_at on public.reimbursements;
drop trigger if exists set_overtime_records_updated_at on public.overtime_records;

create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();
create trigger set_visits_updated_at before update on public.visits for each row execute function public.set_updated_at();
create trigger set_quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger set_contracts_updated_at before update on public.contracts for each row execute function public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger set_expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();
create trigger set_attendance_records_updated_at before update on public.attendance_records for each row execute function public.set_updated_at();
create trigger set_construction_logs_updated_at before update on public.construction_logs for each row execute function public.set_updated_at();
create trigger set_work_logs_updated_at before update on public.work_logs for each row execute function public.set_updated_at();
create trigger set_reimbursements_updated_at before update on public.reimbursements for each row execute function public.set_updated_at();
create trigger set_overtime_records_updated_at before update on public.overtime_records for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.contacts enable row level security;
alter table public.visits enable row level security;
alter table public.quotes enable row level security;
alter table public.projects enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.attendance_records enable row level security;
alter table public.construction_logs enable row level security;
alter table public.work_logs enable row level security;
alter table public.reimbursements enable row level security;
alter table public.overtime_records enable row level security;

drop policy if exists "users_owner_access" on public.users;
drop policy if exists "profiles_owner_access" on public.profiles;
drop policy if exists "customers_owner_access" on public.customers;
drop policy if exists "contacts_owner_access" on public.contacts;
drop policy if exists "visits_owner_access" on public.visits;
drop policy if exists "quotes_owner_access" on public.quotes;
drop policy if exists "projects_owner_access" on public.projects;
drop policy if exists "contracts_owner_access" on public.contracts;
drop policy if exists "payments_owner_access" on public.payments;
drop policy if exists "expenses_owner_access" on public.expenses;
drop policy if exists "attendance_records_owner_access" on public.attendance_records;
drop policy if exists "construction_logs_owner_access" on public.construction_logs;
drop policy if exists "work_logs_owner_access" on public.work_logs;
drop policy if exists "reimbursements_owner_access" on public.reimbursements;
drop policy if exists "overtime_records_owner_access" on public.overtime_records;

create policy "users_owner_access" on public.users for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "profiles_owner_access" on public.profiles for all using (auth_user_id = auth.uid() or owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (auth_user_id = auth.uid() or owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "customers_owner_access" on public.customers for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "contacts_owner_access" on public.contacts for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "visits_owner_access" on public.visits for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "quotes_owner_access" on public.quotes for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "projects_owner_access" on public.projects for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "contracts_owner_access" on public.contracts for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "payments_owner_access" on public.payments for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "expenses_owner_access" on public.expenses for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "attendance_records_owner_access" on public.attendance_records for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "construction_logs_owner_access" on public.construction_logs for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "work_logs_owner_access" on public.work_logs for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "reimbursements_owner_access" on public.reimbursements for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);
create policy "overtime_records_owner_access" on public.overtime_records for all using (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid) with check (owner_id = auth.uid() or owner_id = '00000000-0000-0000-0000-000000000000'::uuid);

create index if not exists idx_customers_owner on public.customers(owner_id);
create index if not exists idx_profiles_auth_user on public.profiles(auth_user_id);
create index if not exists idx_contacts_customer on public.contacts(customer_id);
create index if not exists idx_visits_customer on public.visits(customer_id);
create index if not exists idx_quotes_customer on public.quotes(customer_id);
create index if not exists idx_projects_customer on public.projects(customer_id);
create index if not exists idx_contracts_customer on public.contracts(customer_id);
create index if not exists idx_payments_contract on public.payments(contract_id);
create index if not exists idx_expenses_category on public.expenses(category);
create index if not exists idx_attendance_records_project on public.attendance_records(project_id);
create index if not exists idx_construction_logs_project on public.construction_logs(project_id);
create index if not exists idx_work_logs_project on public.work_logs(project_id);
create index if not exists idx_reimbursements_project on public.reimbursements(project_id);
create index if not exists idx_overtime_records_project on public.overtime_records(project_id);
