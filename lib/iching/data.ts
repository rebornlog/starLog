// 易经六十四卦数据
export interface Hexagram {
  id: number // 1-64
  number: number // 序号
  name: string // 卦名
  pinyin: string // 拼音
  character: string // 卦字符号（Unicode）
  structure: number[] // 卦象结构（从下到上，1=阳爻，0=阴爻）
  trigrams: {
    upper: string // 上卦
    lower: string // 下卦
  }
  judgment: string // 卦辞（彖辞）
  image: string // 象传
  lines: LineInterpretation[] // 爻辞（6 条）
}

export interface LineInterpretation {
  position: number // 1-6（从下到上）
  text: string // 爻辞
}

// 八卦基础
export const TRIGRAMS = {
  qian: { name: '乾', element: '天', attribute: '健' },
  kun: { name: '坤', element: '地', attribute: '顺' },
  zhen: { name: '震', element: '雷', attribute: '动' },
  xun: { name: '巽', element: '风', attribute: '入' },
  kan: { name: '坎', element: '水', attribute: '陷' },
  li: { name: '离', element: '火', attribute: '丽' },
  gen: { name: '艮', element: '山', attribute: '止' },
  dui: { name: '兑', element: '泽', attribute: '悦' },
}

// 六十四卦完整数据（部分示例，实际应包含全部 64 卦）
export const HEXAGRAMS: Hexagram[] = [
  {
    id: 1,
    number: 1,
    name: '乾',
    pinyin: 'qián',
    character: '䷀',
    structure: [1, 1, 1, 1, 1, 1],
    trigrams: { upper: 'qian', lower: 'qian' },
    judgment: '元亨利贞。',
    image: '天行健，君子以自强不息。',
    lines: [
      { position: 1, text: '潜龙勿用。' },
      { position: 2, text: '见龙在田，利见大人。' },
      { position: 3, text: '君子终日乾乾，夕惕若厉，无咎。' },
      { position: 4, text: '或跃在渊，无咎。' },
      { position: 5, text: '飞龙在天，利见大人。' },
      { position: 6, text: '亢龙有悔。' },
    ],
  },
  {
    id: 2,
    number: 2,
    name: '坤',
    pinyin: 'kūn',
    character: '䷁',
    structure: [0, 0, 0, 0, 0, 0],
    trigrams: { upper: 'kun', lower: 'kun' },
    judgment: '元亨，利牝马之贞。君子有攸往，先迷后得主。利西南得朋，东北丧朋。安贞吉。',
    image: '地势坤，君子以厚德载物。',
    lines: [
      { position: 1, text: '履霜，坚冰至。' },
      { position: 2, text: '直方大，不习无不利。' },
      { position: 3, text: '含章可贞。或从王事，无成有终。' },
      { position: 4, text: '括囊，无咎无誉。' },
      { position: 5, text: '黄裳，元吉。' },
      { position: 6, text: '龙战于野，其血玄黄。' },
    ],
  },
  {
    id: 3,
    number: 3,
    name: '屯',
    pinyin: 'zhūn',
    character: '䷂',
    structure: [1, 0, 0, 0, 1, 0],
    trigrams: { upper: 'kan', lower: 'zhen' },
    judgment: '元亨利贞。勿用有攸往，利建侯。',
    image: '云雷，屯。君子以经纶。',
    lines: [
      { position: 1, text: '磐桓，利居贞，利建侯。' },
      { position: 2, text: '屯如邅如，乘马班如。匪寇婚媾，女子贞不字，十年乃字。' },
      { position: 3, text: '即鹿无虞，惟入于林中。君子几不如舍，往吝。' },
      { position: 4, text: '乘马班如，求婚媾，往吉，无不利。' },
      { position: 5, text: '屯其膏，小贞吉，大贞凶。' },
      { position: 6, text: '乘马班如，泣血涟如。' },
    ],
  },
  {
    id: 4,
    number: 4,
    name: '蒙',
    pinyin: 'méng',
    character: '䷃',
    structure: [0, 1, 0, 0, 0, 1],
    trigrams: { upper: 'gen', lower: 'kan' },
    judgment: '亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。',
    image: '山下出泉，蒙。君子以果行育德。',
    lines: [
      { position: 1, text: '发蒙，利用刑人，用说桎梏，以往吝。' },
      { position: 2, text: '包蒙吉，纳妇吉，子克家。' },
      { position: 3, text: '勿用取女，见金夫，不有躬，无攸利。' },
      { position: 4, text: '困蒙，吝。' },
      { position: 5, text: '童蒙，吉。' },
      { position: 6, text: '击蒙，不利为寇，利御寇。' },
    ],
  },
  {
    id: 5,
    number: 5,
    name: '需',
    pinyin: 'xū',
    character: '䷄',
    structure: [1, 1, 0, 1, 0, 0],
    trigrams: { upper: 'kan', lower: 'qian' },
    judgment: '有孚，光亨，贞吉。利涉大川。',
    image: '云上于天，需。君子以饮食宴乐。',
    lines: [
      { position: 1, text: '需于郊，利用恒，无咎。' },
      { position: 2, text: '需于沙，小有言，终吉。' },
      { position: 3, text: '需于泥，致寇至。' },
      { position: 4, text: '需于血，出自穴。' },
      { position: 5, text: '需于酒食，贞吉。' },
      { position: 6, text: '入于穴，有不速之客三人来，敬之终吉。' },
    ],
  },
  {
    id: 6,
    number: 6,
    name: '讼',
    pinyin: 'sòng',
    character: '䷅',
    structure: [0, 1, 1, 1, 0, 0],
    trigrams: { upper: 'qian', lower: 'kan' },
    judgment: '有孚窒惕，中吉，终凶。利见大人，不利涉大川。',
    image: '天与水违行，讼。君子以作事谋始。',
    lines: [
      { position: 1, text: '不永所事，小有言，终吉。' },
      { position: 2, text: '不克讼，归而逋，其邑人三百户，无眚。' },
      { position: 3, text: '食旧德，贞厉，终吉。或从王事，无成。' },
      { position: 4, text: '不克讼，复即命渝，安贞吉。' },
      { position: 5, text: '讼，元吉。' },
      { position: 6, text: '或锡之鞶带，终朝三褫之。' },
    ],
  },
  // 为简化，这里列出 64 卦的核心信息（卦名、卦辞、象传）
  // 实际项目中可扩展完整爻辞
  {
    id: 7,
    number: 7,
    name: '师',
    pinyin: 'shī',
    character: '䷆',
    structure: [0, 1, 0, 0, 0, 0],
    trigrams: { upper: 'kun', lower: 'kan' },
    judgment: '贞，丈人吉，无咎。',
    image: '地中有水，师。君子以容民畜众。',
    lines: [
      { position: 1, text: '师出以律，否臧凶。' },
      { position: 2, text: '在师中，吉无咎，王三锡命。' },
      { position: 3, text: '师或舆尸，凶。' },
      { position: 4, text: '师左次，无咎。' },
      { position: 5, text: '田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。' },
      { position: 6, text: '大君有命，开国承家，小人勿用。' },
    ],
  },
  {
    id: 8,
    number: 8,
    name: '比',
    pinyin: 'bǐ',
    character: '䷇',
    structure: [0, 0, 0, 0, 1, 0],
    trigrams: { upper: 'kan', lower: 'kun' },
    judgment: '吉。原筮元永贞，无咎。不宁方来，后夫凶。',
    image: '地上有水，比。先王以建万国，亲诸侯。',
    lines: [
      { position: 1, text: '有孚比之，无咎。有孚盈缶，终来有它，吉。' },
      { position: 2, text: '比之自内，贞吉。' },
      { position: 3, text: '比之匪人。' },
      { position: 4, text: '外比之，贞吉。' },
      { position: 5, text: '显比，王用三驱，失前禽。邑人不诫，吉。' },
      { position: 6, text: '比之无首，凶。' },
    ],
  },
]

// 64 卦完整卦名列表（用于生成完整数据）
const HEXAGRAM_NAMES = [
  ['乾', 'qián'],
  ['坤', 'kūn'],
  ['屯', 'zhūn'],
  ['蒙', 'méng'],
  ['需', 'xū'],
  ['讼', 'sòng'],
  ['师', 'shī'],
  ['比', 'bǐ'],
  ['小畜', 'xiǎo chù'],
  ['履', 'lǚ'],
  ['泰', 'tài'],
  ['否', 'pǐ'],
  ['同人', 'tóng rén'],
  ['大有', 'dà yǒu'],
  ['谦', 'qiān'],
  ['豫', 'yù'],
  ['随', 'suí'],
  ['蛊', 'gǔ'],
  ['临', 'lín'],
  ['观', 'guān'],
  ['噬嗑', 'shì kè'],
  ['贲', 'bì'],
  ['剥', 'bō'],
  ['复', 'fù'],
  ['无妄', 'wú wàng'],
  ['大畜', 'dà chù'],
  ['颐', 'yí'],
  ['大过', 'dà guò'],
  ['坎', 'kǎn'],
  ['离', 'lí'],
  ['咸', 'xián'],
  ['恒', 'héng'],
  ['遁', 'dùn'],
  ['大壮', 'dà zhuàng'],
  ['晋', 'jìn'],
  ['明夷', 'míng yí'],
  ['家人', 'jiā rén'],
  ['睽', 'kuí'],
  ['蹇', 'jiǎn'],
  ['解', 'xiè'],
  ['损', 'sǔn'],
  ['益', 'yì'],
  ['夬', 'guài'],
  ['姤', 'gòu'],
  ['萃', 'cuì'],
  ['升', 'shēng'],
  ['困', 'kùn'],
  ['井', 'jǐng'],
  ['革', 'gé'],
  ['鼎', 'dǐng'],
  ['震', 'zhèn'],
  ['艮', 'gèn'],
  ['渐', 'jiàn'],
  ['归妹', 'guī mèi'],
  ['丰', 'fēng'],
  ['旅', 'lǚ'],
  ['巽', 'xùn'],
  ['兑', 'duì'],
  ['涣', 'huàn'],
  ['节', 'jié'],
  ['中孚', 'zhōng fú'],
  ['小过', 'xiǎo guò'],
  ['既济', 'jì jì'],
  ['未济', 'wèi jì'],
]

// 根据 ID 生成卦象结构（二进制）
function generateStructure(id: number): number[] {
  const num = id - 1
  const structure: number[] = []
  for (let i = 0; i < 6; i++) {
    structure.push((num >> i) & 1)
  }
  return structure
}

// 补充缺失的卦象数据
function completeHexagramData() {
  const existingIds = new Set(HEXAGRAMS.map((h) => h.id))

  for (let i = 0; i < 64; i++) {
    if (!existingIds.has(i + 1)) {
      const [name, pinyin] = HEXAGRAM_NAMES[i]
      const structure = generateStructure(i + 1)
      const character = String.fromCodePoint(0x4dc0 + i)

      HEXAGRAMS.push({
        id: i + 1,
        number: i + 1,
        name,
        pinyin,
        character,
        structure,
        trigrams: { upper: 'qian', lower: 'qian' }, // 简化：实际应根据结构计算
        judgment: '卦辞待补充',
        image: '象传待补充',
        lines: Array.from({ length: 6 }, (_, idx) => ({
          position: idx + 1,
          text: '爻辞待补充',
        })),
      })
    }
  }
}

// 执行数据补全
completeHexagramData()

// 根据卦象结构生成卦 ID（用于查找）
export function getHexagramId(structure: number[]): number {
  let id = 0
  for (let i = 0; i < 6; i++) {
    if (structure[i] === 1) {
      id += Math.pow(2, i)
    }
  }
  return id + 1 // 1-64
}

// 根据 ID 获取卦
export function getHexagramById(id: number): Hexagram | undefined {
  return HEXAGRAMS.find((h) => h.id === id)
}

// 根据名称获取卦
export function getHexagramByName(name: string): Hexagram | undefined {
  return HEXAGRAMS.find((h) => h.name === name)
}

// 获取卦的 Unicode 字符
export function getHexagramCharacter(structure: number[]): string {
  const base = 0x4dc0 // 易经卦象 Unicode 起始位置
  const id = getHexagramId(structure) - 1
  return String.fromCodePoint(base + id)
}
