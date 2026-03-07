// 食材五行属性数据库

export interface FoodItem {
  name: string
  element: string // 五行属性
  nature: '寒' | '微寒' | '凉' | '平' | '温' | '热' | '微温' // 四性
  flavor: string[] // 五味
  effects: string[] // 功效
  category: string // 分类
}

// 食材数据库（按五行分类）
export const FOOD_DATABASE: FoodItem[] = [
  // 金属性食材（补肺、大肠）
  {
    name: '白萝卜',
    element: '金',
    nature: '凉',
    flavor: ['辛', '甘'],
    effects: ['清热化痰', '消食化积'],
    category: '蔬菜',
  },
  {
    name: '白菜',
    element: '金',
    nature: '平',
    flavor: ['甘'],
    effects: ['养胃生津', '清热除烦'],
    category: '蔬菜',
  },
  {
    name: '白木耳',
    element: '金',
    nature: '平',
    flavor: ['甘', '淡'],
    effects: ['滋阴润肺', '养胃生津'],
    category: '菌菇',
  },
  {
    name: '百合',
    element: '金',
    nature: '微寒',
    flavor: ['甘'],
    effects: ['润肺止咳', '清心安神'],
    category: '药食',
  },
  {
    name: '梨',
    element: '金',
    nature: '凉',
    flavor: ['甘', '微酸'],
    effects: ['润肺止咳', '清热化痰'],
    category: '水果',
  },
  {
    name: '苹果',
    element: '金',
    nature: '平',
    flavor: ['甘', '酸'],
    effects: ['生津止渴', '健脾益胃'],
    category: '水果',
  },
  {
    name: '鸡肉',
    element: '金',
    nature: '温',
    flavor: ['甘'],
    effects: ['温中益气', '补精填髓'],
    category: '肉类',
  },
  {
    name: '鱼肉',
    element: '金',
    nature: '平',
    flavor: ['甘'],
    effects: ['健脾利湿', '和中开胃'],
    category: '肉类',
  },
  {
    name: '大米',
    element: '金',
    nature: '平',
    flavor: ['甘'],
    effects: ['补中益气', '健脾和胃'],
    category: '谷物',
  },
  {
    name: '燕麦',
    element: '金',
    nature: '平',
    flavor: ['甘'],
    effects: ['健脾养心', '润肠通便'],
    category: '谷物',
  },

  // 木属性食材（补肝、胆）
  {
    name: '菠菜',
    element: '木',
    nature: '凉',
    flavor: ['甘'],
    effects: ['养血止血', '滋阴润燥'],
    category: '蔬菜',
  },
  {
    name: '芹菜',
    element: '木',
    nature: '凉',
    flavor: ['甘', '苦'],
    effects: ['平肝清热', '祛风利湿'],
    category: '蔬菜',
  },
  {
    name: '韭菜',
    element: '木',
    nature: '温',
    flavor: ['辛'],
    effects: ['温中行气', '散血解毒'],
    category: '蔬菜',
  },
  {
    name: '西兰花',
    element: '木',
    nature: '平',
    flavor: ['甘'],
    effects: ['补肾填精', '健脾和胃'],
    category: '蔬菜',
  },
  {
    name: '猕猴桃',
    element: '木',
    nature: '寒',
    flavor: ['酸', '甘'],
    effects: ['清热生津', '健脾止泻'],
    category: '水果',
  },
  {
    name: '柠檬',
    element: '木',
    nature: '平',
    flavor: ['酸', '甘'],
    effects: ['生津止渴', '和胃安胎'],
    category: '水果',
  },
  {
    name: '猪肝',
    element: '木',
    nature: '温',
    flavor: ['甘', '苦'],
    effects: ['补肝明目', '养血健脾'],
    category: '肉类',
  },
  {
    name: '鸡蛋',
    element: '木',
    nature: '平',
    flavor: ['甘'],
    effects: ['滋阴润燥', '养血安胎'],
    category: '蛋类',
  },
  {
    name: '绿豆',
    element: '木',
    nature: '寒',
    flavor: ['甘'],
    effects: ['清热解毒', '消暑利水'],
    category: '豆类',
  },
  {
    name: '黄豆',
    element: '木',
    nature: '平',
    flavor: ['甘'],
    effects: ['健脾宽中', '润燥消水'],
    category: '豆类',
  },

  // 水属性食材（补肾、膀胱）
  {
    name: '黑豆',
    element: '水',
    nature: '平',
    flavor: ['甘'],
    effects: ['补肾益阴', '健脾利湿'],
    category: '豆类',
  },
  {
    name: '黑芝麻',
    element: '水',
    nature: '平',
    flavor: ['甘'],
    effects: ['补肝肾', '益精血', '润肠燥'],
    category: '坚果',
  },
  {
    name: '海带',
    element: '水',
    nature: '寒',
    flavor: ['咸'],
    effects: ['软坚散结', '消痰利水'],
    category: '海产',
  },
  {
    name: '紫菜',
    element: '水',
    nature: '寒',
    flavor: ['甘', '咸'],
    effects: ['化痰软坚', '清热利尿'],
    category: '海产',
  },
  {
    name: '虾',
    element: '水',
    nature: '温',
    flavor: ['甘', '咸'],
    effects: ['补肾壮阳', '通乳托毒'],
    category: '海产',
  },
  {
    name: '海参',
    element: '水',
    nature: '平',
    flavor: ['甘', '咸'],
    effects: ['补肾益精', '养血润燥'],
    category: '海产',
  },
  {
    name: '黑米',
    element: '水',
    nature: '平',
    flavor: ['甘'],
    effects: ['滋阴补肾', '健脾暖肝'],
    category: '谷物',
  },
  {
    name: '桑葚',
    element: '水',
    nature: '寒',
    flavor: ['甘', '酸'],
    effects: ['滋阴补血', '生津润肠'],
    category: '水果',
  },
  {
    name: '黑木耳',
    element: '水',
    nature: '平',
    flavor: ['甘'],
    effects: ['补气养血', '润肺止咳'],
    category: '菌菇',
  },
  {
    name: '冬瓜',
    element: '水',
    nature: '微寒',
    flavor: ['甘', '淡'],
    effects: ['利尿消肿', '清热解暑'],
    category: '蔬菜',
  },

  // 火属性食材（补心、小肠）
  {
    name: '红枣',
    element: '火',
    nature: '温',
    flavor: ['甘'],
    effects: ['补中益气', '养血安神'],
    category: '果干',
  },
  {
    name: '桂圆',
    element: '火',
    nature: '温',
    flavor: ['甘'],
    effects: ['补心脾', '益气血', '安神'],
    category: '果干',
  },
  {
    name: '枸杞',
    element: '火',
    nature: '平',
    flavor: ['甘'],
    effects: ['滋补肝肾', '益精明目'],
    category: '药食',
  },
  {
    name: '胡萝卜',
    element: '火',
    nature: '平',
    flavor: ['甘'],
    effects: ['健脾消食', '润肠通便'],
    category: '蔬菜',
  },
  {
    name: '西红柿',
    element: '火',
    nature: '微寒',
    flavor: ['酸', '甘'],
    effects: ['生津止渴', '健胃消食'],
    category: '蔬菜',
  },
  {
    name: '辣椒',
    element: '火',
    nature: '热',
    flavor: ['辛'],
    effects: ['温中散寒', '开胃消食'],
    category: '调味',
  },
  {
    name: '羊肉',
    element: '火',
    nature: '温',
    flavor: ['甘'],
    effects: ['温中健脾', '补肾壮阳'],
    category: '肉类',
  },
  {
    name: '牛肉',
    element: '火',
    nature: '平',
    flavor: ['甘'],
    effects: ['补脾胃', '益气血', '强筋骨'],
    category: '肉类',
  },
  {
    name: '红豆',
    element: '火',
    nature: '平',
    flavor: ['甘', '酸'],
    effects: ['利水消肿', '解毒排脓'],
    category: '豆类',
  },
  {
    name: '草莓',
    element: '火',
    nature: '凉',
    flavor: ['甘', '酸'],
    effects: ['润肺生津', '健脾和胃'],
    category: '水果',
  },

  // 土属性食材（补脾、胃）
  {
    name: '山药',
    element: '土',
    nature: '平',
    flavor: ['甘'],
    effects: ['补脾养胃', '生津益肺', '补肾涩精'],
    category: '蔬菜',
  },
  {
    name: '土豆',
    element: '土',
    nature: '平',
    flavor: ['甘'],
    effects: ['和胃调中', '健脾利湿'],
    category: '蔬菜',
  },
  {
    name: '南瓜',
    element: '土',
    nature: '温',
    flavor: ['甘'],
    effects: ['补中益气', '消炎止痛'],
    category: '蔬菜',
  },
  {
    name: '红薯',
    element: '土',
    nature: '平',
    flavor: ['甘'],
    effects: ['补脾益胃', '生津止渴'],
    category: '蔬菜',
  },
  {
    name: '小米',
    element: '土',
    nature: '凉',
    flavor: ['甘', '咸'],
    effects: ['健脾和胃', '补益虚损'],
    category: '谷物',
  },
  {
    name: '玉米',
    element: '土',
    nature: '平',
    flavor: ['甘'],
    effects: ['健脾开胃', '利水通淋'],
    category: '谷物',
  },
  {
    name: '蜂蜜',
    element: '土',
    nature: '平',
    flavor: ['甘'],
    effects: ['补中润燥', '止痛解毒'],
    category: '调味',
  },
  {
    name: '花生',
    element: '土',
    nature: '平',
    flavor: ['甘'],
    effects: ['健脾养胃', '润肺化痰'],
    category: '坚果',
  },
  {
    name: '莲子',
    element: '土',
    nature: '平',
    flavor: ['甘', '涩'],
    effects: ['补脾止泻', '益肾固精', '养心安神'],
    category: '药食',
  },
  {
    name: '黄豆',
    element: '土',
    nature: '平',
    flavor: ['甘'],
    effects: ['健脾宽中', '润燥消水'],
    category: '豆类',
  },
]

// 根据五行获取推荐食材
export function getFoodsByElement(element: string): FoodItem[] {
  return FOOD_DATABASE.filter((food) => food.element === element)
}

// 根据弱五行生成饮食建议
export function generateDietAdvice(
  weakElements: string[],
  strongElements: string[]
): {
  recommend: FoodItem[]
  avoid: FoodItem[]
  dailyPlan: { meal: string; foods: string[] }[]
} {
  const recommend: FoodItem[] = []
  const avoid: FoodItem[] = []

  // 推荐补充弱五行的食材
  for (const element of weakElements) {
    const foods = getFoodsByElement(element)
    recommend.push(...foods.slice(0, 5))
  }

  // 避免强化强五行的食材
  for (const element of strongElements) {
    const foods = getFoodsByElement(element)
    avoid.push(...foods.slice(0, 3))
  }

  // 生成一日三餐建议
  const dailyPlan = [
    {
      meal: '早餐',
      foods: recommend.slice(0, 3).map((f) => f.name),
    },
    {
      meal: '午餐',
      foods: recommend.slice(3, 6).map((f) => f.name),
    },
    {
      meal: '晚餐',
      foods: recommend.slice(6, 9).map((f) => f.name),
    },
  ]

  return { recommend, avoid, dailyPlan }
}

// 获取五行对应的味道
export function getElementFlavors(element: string): string[] {
  const flavorMap: { [key: string]: string[] } = {
    金: ['辛'],
    木: ['酸'],
    水: ['咸'],
    火: ['苦'],
    土: ['甘'],
  }
  return flavorMap[element] || []
}
