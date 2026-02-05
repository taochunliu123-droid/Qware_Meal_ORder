// 員工資料
export interface Employee {
  id: string;
  name: string;
  createdAt: string;
}

// 點餐活動
export interface MealActivity {
  id: string;
  name: string;
  date: string;
  status: 'active' | 'closed';
  meals: MealOption[];
  drinks: DrinkOption[];
  createdAt: string;
  updatedAt: string;
}

// 餐點選項
export interface MealOption {
  id: string;
  name: string;
}

// 飲料選項
export interface DrinkOption {
  id: string;
  name: string;
}

// 訂單
export interface Order {
  id: string;
  activityId: string;
  employeeId: string;
  employeeName: string;
  mealId: string;
  mealName: string;
  drinkId: string;
  drinkName: string;
  createdAt: string;
}

// 統計報表
export interface OrderReport {
  activityId: string;
  activityName: string;
  activityDate: string;
  totalOrders: number;
  mealStats: {
    [mealName: string]: {
      count: number;
      employees: string[];
    };
  };
  drinkStats: {
    [drinkName: string]: {
      count: number;
      employees: string[];
    };
  };
  orders: Order[];
}
