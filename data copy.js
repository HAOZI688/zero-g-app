// Food database: { name, kcal, protein, carbs, fat } per 100g
const FOODS = [
  { name: '鸡胸肉', kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: '鸡腿肉', kcal: 209, protein: 26, carbs: 0, fat: 11 },
  { name: '牛肉（瘦）', kcal: 250, protein: 26, carbs: 0, fat: 15 },
  { name: '猪里脊', kcal: 155, protein: 22, carbs: 0, fat: 7 },
  { name: '三文鱼', kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: '鸡蛋', kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: '蛋白粉（乳清）', kcal: 380, protein: 75, carbs: 8, fat: 5 },
  { name: '牛奶（全脂）', kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: '希腊酸奶', kcal: 97, protein: 9, carbs: 6, fat: 5 },
  { name: '豆腐', kcal: 76, protein: 8, carbs: 2, fat: 4.5 },
  { name: '米饭（熟）', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: '燕麦', kcal: 389, protein: 17, carbs: 66, fat: 7 },
  { name: '全麦面包', kcal: 247, protein: 9, carbs: 41, fat: 4 },
  { name: '红薯', kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: '土豆', kcal: 77, protein: 2, carbs: 17, fat: 0.1 },
  { name: '香蕉', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: '苹果', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: '蓝莓', kcal: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { name: '西兰花', kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: '菠菜', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: '胡萝卜', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: '花生', kcal: 567, protein: 26, carbs: 16, fat: 49 },
  { name: '杏仁', kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { name: '橄榄油', kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { name: '牛油果', kcal: 160, protein: 2, carbs: 9, fat: 15 },
  { name: '玉米', kcal: 86, protein: 3.3, carbs: 19, fat: 1.4 },
  { name: '黑豆', kcal: 341, protein: 22, carbs: 62, fat: 1.4 },
  { name: '虾', kcal: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { name: '金枪鱼（罐头）', kcal: 116, protein: 26, carbs: 0, fat: 1 },
  { name: '奶酪', kcal: 402, protein: 25, carbs: 1.3, fat: 33 },
];

// Workout plans
const PLANS = {
  muscle: {
    name: '增肌计划',
    days: [
      {
        title: '第1天 — 胸 + 三头',
        exercises: ['bench-press', 'incline-db-press', 'cable-fly', 'tricep-pushdown', 'skull-crusher']
      },
      {
        title: '第2天 — 背 + 二头',
        exercises: ['deadlift', 'pull-up', 'seated-row', 'bicep-curl']
      },
      {
        title: '第3天 — 休息 / 有氧',
        exercises: []
      },
      {
        title: '第4天 — 腿',
        exercises: ['squat', 'leg-press', 'romanian-deadlift', 'calf-raise']
      },
      {
        title: '第5天 — 肩',
        exercises: ['ohp', 'lateral-raise', 'face-pull']
      },
    ]
  },
  fat: {
    name: '减脂计划',
    days: [
      {
        title: '第1天 — 全身力量',
        exercises: ['squat', 'bench-press', 'pull-up', 'ohp']
      },
      {
        title: '第2天 — HIIT 有氧',
        exercises: ['burpee', 'mountain-climber', 'jump-squat']
      },
      {
        title: '第3天 — 休息',
        exercises: []
      },
      {
        title: '第4天 — 全身力量',
        exercises: ['deadlift', 'incline-db-press', 'seated-row', 'lateral-raise']
      },
      {
        title: '第5天 — 有氧 + 核心',
        exercises: ['plank', 'mountain-climber', 'bicycle-crunch']
      },
    ]
  },
  shape: {
    name: '塑形计划',
    days: [
      {
        title: '第1天 — 上肢',
        exercises: ['incline-db-press', 'cable-fly', 'seated-row', 'lateral-raise', 'bicep-curl']
      },
      {
        title: '第2天 — 下肢',
        exercises: ['squat', 'romanian-deadlift', 'leg-press', 'calf-raise']
      },
      {
        title: '第3天 — 核心 + 有氧',
        exercises: ['plank', 'bicycle-crunch', 'mountain-climber']
      },
    ]
  }
};

const EXERCISES = {
  'squat': { name: '深蹲', sets: '4组 × 8-12次', muscle: '股四头肌、臀大肌、腘绳肌', tip: '脚与肩同宽，脚尖略外展；下蹲时膝盖追脚尖方向，背部保持中立位；下蹲至大腿平行地面后发力站起。' },
  'bench-press': { name: '卧推', sets: '4组 × 8-10次', muscle: '胸大肌、三角肌前束、三头肌', tip: '肩胛骨收紧下沉，背部微拱；握距略宽于肩；杠铃下落至乳头位置，呼气推起。' },
  'deadlift': { name: '硬拉', sets: '3组 × 6-8次', muscle: '竖脊肌、臀大肌、腘绳肌、斜方肌', tip: '杠铃贴腿，髋关节主导发力；起身时髋膝同步伸展；全程保持腰背中立，不要弓腰。' },
  'pull-up': { name: '引体向上', sets: '3组 × 力竭', muscle: '背阔肌、二头肌、菱形肌', tip: '正握或反握均可；肩胛骨先下沉，再发力将胸口拉向横杆；下放时充分伸展背阔肌。' },
  'ohp': { name: '站姿推举', sets: '3组 × 10次', muscle: '三角肌中束/前束、三头肌', tip: '核心收紧，避免腰部过度后仰；杠铃从锁骨前方推至头顶正上方；下放时控制速度。' },
  'incline-db-press': { name: '上斜哑铃卧推', sets: '3组 × 10-12次', muscle: '胸大肌上束、三角肌前束', tip: '椅背倾斜30-45°；哑铃下落时肘部略低于肩；顶峰收缩时双手内旋夹胸。' },
  'cable-fly': { name: '绳索夹胸', sets: '3组 × 12-15次', muscle: '胸大肌（内侧）', tip: '身体前倾，双臂微弯；以胸部发力将绳索向中间汇聚；顶峰时双手交叉停顿1秒。' },
  'seated-row': { name: '坐姿划船', sets: '3组 × 10-12次', muscle: '背阔肌、菱形肌、后束', tip: '背部挺直，不要借助身体摆动；将把手拉向腹部，肘部贴近身体；充分感受背部收缩。' },
  'lateral-raise': { name: '侧平举', sets: '3组 × 15次', muscle: '三角肌中束', tip: '哑铃重量宜轻；手臂微弯，以肘部领先向两侧抬起至肩高；下放时控制速度，不要借力。' },
  'bicep-curl': { name: '哑铃弯举', sets: '3组 × 12次', muscle: '肱二头肌', tip: '上臂固定不动，以肘关节为轴；旋转前臂（小指朝外）以充分收缩二头肌；顶峰停顿。' },
  'tricep-pushdown': { name: '绳索下压', sets: '3组 × 12-15次', muscle: '肱三头肌', tip: '上臂夹紧身体，仅前臂运动；将绳索向下压至完全伸直；缓慢回放感受拉伸。' },
  'skull-crusher': { name: '颅骨破碎者', sets: '3组 × 10次', muscle: '肱三头肌长头', tip: '躺在平凳上，哑铃/杠铃从额头上方下落至额头；上臂保持垂直地面，仅肘关节弯曲。' },
  'romanian-deadlift': { name: '罗马尼亚硬拉', sets: '3组 × 10-12次', muscle: '腘绳肌、臀大肌', tip: '膝盖微弯，以髋关节为轴向前折叠；杠铃贴腿下滑至小腿中部；感受腘绳肌拉伸后发力。' },
  'leg-press': { name: '腿举', sets: '4组 × 12次', muscle: '股四头肌、臀大肌', tip: '脚放在踏板中上部；下放时膝盖不要超过脚尖太多；不要锁死膝关节。' },
  'calf-raise': { name: '提踵', sets: '4组 × 20次', muscle: '腓肠肌、比目鱼肌', tip: '脚尖踩在台阶边缘；充分下沉拉伸后发力踮起；顶峰停顿1秒。' },
  'plank': { name: '平板支撑', sets: '3组 × 60秒', muscle: '核心、腹横肌', tip: '肘部在肩正下方；身体从头到脚保持一条直线；收紧腹部和臀部，不要塌腰或撅臀。' },
  'bicycle-crunch': { name: '自行车卷腹', sets: '3组 × 20次/侧', muscle: '腹直肌、腹斜肌', tip: '下背部贴地；转体时肘部触碰对侧膝盖；腿部做踩自行车动作，控制速度。' },
  'mountain-climber': { name: '登山者', sets: '3组 × 30秒', muscle: '核心、髋屈肌、心肺', tip: '保持俯卧撑姿势，核心收紧；交替将膝盖快速拉向胸口；保持臀部不要抬高。' },
  'burpee': { name: '波比跳', sets: '4组 × 10次', muscle: '全身、心肺', tip: '站立→俯身撑地→跳脚至俯卧撑位→做一个俯卧撑→跳脚收回→跳起击掌；全程保持节奏。' },
  'jump-squat': { name: '跳蹲', sets: '4组 × 12次', muscle: '股四头肌、臀大肌、心肺', tip: '下蹲至大腿平行地面，然后爆发性跳起；落地时用前脚掌缓冲，立即进入下一次。' },
  'face-pull': { name: '绳索面拉', sets: '3组 × 15次', muscle: '三角肌后束、外旋肌群', tip: '绳索高于头部；将绳索拉向面部，肘部向外展开；有助于改善圆肩，建议每次训练都做。' },
};
