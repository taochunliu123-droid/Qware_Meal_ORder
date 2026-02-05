import Redis from 'ioredis';
import { Employee, MealActivity, Order, OrderReport } from '@/types';

// 初始化 Redis 客戶端
const redis = new Redis(process.env.REDIS_URL || '');

// ============ 員工管理 ============
export async function getEmployees(): Promise<Employee[]> {
  const data = await redis.get('employees');
  return data ? JSON.parse(data) : [];
}

export async function addEmployee(name: string): Promise<Employee> {
  const employees = await getEmployees();
  const newEmployee: Employee = {
    id: `emp_${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
  };
  employees.push(newEmployee);
  await redis.set('employees', JSON.stringify(employees));
  return newEmployee;
}

export async function updateEmployee(id: string, name: string): Promise<Employee | null> {
  const employees = await getEmployees();
  const index = employees.findIndex(emp => emp.id === id);
  if (index === -1) return null;
  
  employees[index].name = name;
  await redis.set('employees', JSON.stringify(employees));
  return employees[index];
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  if (filtered.length === employees.length) return false;
  
  await redis.set('employees', JSON.stringify(filtered));
  return true;
}

// ============ 活動管理 ============
export async function getActivities(): Promise<MealActivity[]> {
  const data = await redis.get('activities');
  return data ? JSON.parse(data) : [];
}

export async function getActivity(id: string): Promise<MealActivity | null> {
  const activities = await getActivities();
  return activities.find(act => act.id === id) || null;
}

export async function createActivity(data: {
  name: string;
  date: string;
  meals: string[];
  drinks: string[];
}): Promise<MealActivity> {
  const activities = await getActivities();
  
  const newActivity: MealActivity = {
    id: `act_${Date.now()}`,
    name: data.name,
    date: data.date,
    status: 'active',
    meals: data.meals.map((name, index) => ({
      id: `meal_${Date.now()}_${index}`,
      name,
    })),
    drinks: data.drinks.map((name, index) => ({
      id: `drink_${Date.now()}_${index}`,
      name,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  activities.push(newActivity);
  await redis.set('activities', JSON.stringify(activities));
  return newActivity;
}

export async function updateActivityStatus(
  id: string,
  status: 'active' | 'closed'
): Promise<MealActivity | null> {
  const activities = await getActivities();
  const index = activities.findIndex(act => act.id === id);
  if (index === -1) return null;
  
  activities[index].status = status;
  activities[index].updatedAt = new Date().toISOString();
  await redis.set('activities', JSON.stringify(activities));
  return activities[index];
}

export async function deleteActivity(id: string): Promise<boolean> {
  const activities = await getActivities();
  const filtered = activities.filter(act => act.id !== id);
  if (filtered.length === activities.length) return false;
  
  // 同時刪除該活動的所有訂單
  await redis.del(`orders:${id}`);
  await redis.set('activities', JSON.stringify(filtered));
  return true;
}

// ============ 訂單管理 ============
export async function createOrder(data: {
  activityId: string;
  employeeId: string;
  employeeName: string;
  mealId: string;
  mealName: string;
  drinkId: string;
  drinkName: string;
}): Promise<Order> {
  const orders = await getOrdersByActivity(data.activityId);
  
  const newOrder: Order = {
    id: `order_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  
  orders.push(newOrder);
  await redis.set(`orders:${data.activityId}`, JSON.stringify(orders));
  return newOrder;
}

export async function getOrdersByActivity(activityId: string): Promise<Order[]> {
  const data = await redis.get(`orders:${activityId}`);
  return data ? JSON.parse(data) : [];
}

export async function updateOrder(
  activityId: string,
  orderId: string,
  data: {
    mealId: string;
    mealName: string;
    drinkId: string;
    drinkName: string;
  }
): Promise<Order | null> {
  const orders = await getOrdersByActivity(activityId);
  const index = orders.findIndex(order => order.id === orderId);
  if (index === -1) return null;
  
  orders[index] = {
    ...orders[index],
    ...data,
  };
  
  await redis.set(`orders:${activityId}`, JSON.stringify(orders));
  return orders[index];
}

export async function deleteOrder(activityId: string, orderId: string): Promise<boolean> {
  const orders = await getOrdersByActivity(activityId);
  const filtered = orders.filter(order => order.id !== orderId);
  if (filtered.length === orders.length) return false;
  
  await redis.set(`orders:${activityId}`, JSON.stringify(filtered));
  return true;
}

// ============ 報表生成 ============
export async function generateReport(activityId: string): Promise<OrderReport | null> {
  const activity = await getActivity(activityId);
  if (!activity) return null;
  
  const orders = await getOrdersByActivity(activityId);
  
  // 統計餐點
  const mealStats: OrderReport['mealStats'] = {};
  // 統計飲料
  const drinkStats: OrderReport['drinkStats'] = {};
  
  orders.forEach(order => {
    // 餐點統計
    if (!mealStats[order.mealName]) {
      mealStats[order.mealName] = { count: 0, employees: [] };
    }
    mealStats[order.mealName].count++;
    mealStats[order.mealName].employees.push(order.employeeName);
    
    // 飲料統計
    if (!drinkStats[order.drinkName]) {
      drinkStats[order.drinkName] = { count: 0, employees: [] };
    }
    drinkStats[order.drinkName].count++;
    drinkStats[order.drinkName].employees.push(order.employeeName);
  });
  
  return {
    activityId: activity.id,
    activityName: activity.name,
    activityDate: activity.date,
    totalOrders: orders.length,
    mealStats,
    drinkStats,
    orders,
  };
}

// ============ 初始化預設員工 ============
export async function initializeDefaultEmployees(): Promise<void> {
  const employees = await getEmployees();
  if (employees.length > 0) return; // 已經有員工資料就不初始化
  
  const defaultEmployees = [
    '高念平', '游國楷', '謝楷評', '陳春惠', '薛仁奇', '劉道鈞', 
    '李佳馨', '吳文凱', '吳柔潔', '楊仲文', '蔡恩傑', '陳利和',
    '吳政憲', '黃明正', '蕭智鴻', '陳俊良', '陳詩恬', '彭俊濠',
    '廖崇智', '林怡君', '謝正軒', '張宏偉', '張家菁', '鄒易恆',
    '黃陸堃', '黃晏瑜', '林家銘', '李聿芸', '黃士哲', '李國源', '謝昀達'
  ];
  
  const newEmployees: Employee[] = defaultEmployees.map((name, index) => ({
    id: `emp_${Date.now()}_${index}`,
    name,
    createdAt: new Date().toISOString(),
  }));
  
  await redis.set('employees', JSON.stringify(newEmployees));
}
