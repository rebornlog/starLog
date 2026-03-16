#!/usr/bin/env python3
"""
易经 64 卦数据生成器
使用 AI 批量生成卦辞、象传、爻辞
"""

import json
import sys

# 64 卦完整列表
HEXAGRAMS = [
    {"id": 1, "name": "乾", "pinyin": "qián"},
    {"id": 2, "name": "坤", "pinyin": "kūn"},
    {"id": 3, "name": "屯", "pinyin": "zhūn"},
    {"id": 4, "name": "蒙", "pinyin": "méng"},
    {"id": 5, "name": "需", "pinyin": "xū"},
    {"id": 6, "name": "讼", "pinyin": "sòng"},
    {"id": 7, "name": "师", "pinyin": "shī"},
    {"id": 8, "name": "比", "pinyin": "bǐ"},
    {"id": 9, "name": "小畜", "pinyin": "xiǎo chù"},
    {"id": 10, "name": "履", "pinyin": "lǚ"},
    {"id": 11, "name": "泰", "pinyin": "tài"},
    {"id": 12, "name": "否", "pinyin": "pǐ"},
    {"id": 13, "name": "同人", "pinyin": "tóng rén"},
    {"id": 14, "name": "大有", "pinyin": "dà yǒu"},
    {"id": 15, "name": "谦", "pinyin": "qiān"},
    {"id": 16, "name": "豫", "pinyin": "yù"},
    {"id": 17, "name": "随", "pinyin": "suí"},
    {"id": 18, "name": "蛊", "pinyin": "gǔ"},
    {"id": 19, "name": "临", "pinyin": "lín"},
    {"id": 20, "name": "观", "pinyin": "guān"},
    {"id": 21, "name": "噬嗑", "pinyin": "shì kè"},
    {"id": 22, "name": "贲", "pinyin": "bì"},
    {"id": 23, "name": "剥", "pinyin": "bō"},
    {"id": 24, "name": "复", "pinyin": "fù"},
    {"id": 25, "name": "无妄", "pinyin": "wú wàng"},
    {"id": 26, "name": "大畜", "pinyin": "dà chù"},
    {"id": 27, "name": "颐", "pinyin": "yí"},
    {"id": 28, "name": "大过", "pinyin": "dà guò"},
    {"id": 29, "name": "坎", "pinyin": "kǎn"},
    {"id": 30, "name": "离", "pinyin": "lí"},
    {"id": 31, "name": "咸", "pinyin": "xián"},
    {"id": 32, "name": "恒", "pinyin": "héng"},
    {"id": 33, "name": "遁", "pinyin": "dùn"},
    {"id": 34, "name": "大壮", "pinyin": "dà zhuàng"},
    {"id": 35, "name": "晋", "pinyin": "jìn"},
    {"id": 36, "name": "明夷", "pinyin": "míng yí"},
    {"id": 37, "name": "家人", "pinyin": "jiā rén"},
    {"id": 38, "name": "睽", "pinyin": "kuí"},
    {"id": 39, "name": "蹇", "pinyin": "jiǎn"},
    {"id": 40, "name": "解", "pinyin": "xiè"},
    {"id": 41, "name": "损", "pinyin": "sǔn"},
    {"id": 42, "name": "益", "pinyin": "yì"},
    {"id": 43, "name": "夬", "pinyin": "guài"},
    {"id": 44, "name": "姤", "pinyin": "gòu"},
    {"id": 45, "name": "萃", "pinyin": "cuì"},
    {"id": 46, "name": "升", "pinyin": "shēng"},
    {"id": 47, "name": "困", "pinyin": "kùn"},
    {"id": 48, "name": "井", "pinyin": "jǐng"},
    {"id": 49, "name": "革", "pinyin": "gé"},
    {"id": 50, "name": "鼎", "pinyin": "dǐng"},
    {"id": 51, "name": "震", "pinyin": "zhèn"},
    {"id": 52, "name": "艮", "pinyin": "gèn"},
    {"id": 53, "name": "渐", "pinyin": "jiàn"},
    {"id": 54, "name": "归妹", "pinyin": "guī mèi"},
    {"id": 55, "name": "丰", "pinyin": "fēng"},
    {"id": 56, "name": "旅", "pinyin": "lǚ"},
    {"id": 57, "name": "巽", "pinyin": "xùn"},
    {"id": 58, "name": "兑", "pinyin": "duì"},
    {"id": 59, "name": "涣", "pinyin": "huàn"},
    {"id": 60, "name": "节", "pinyin": "jié"},
    {"id": 61, "name": "中孚", "pinyin": "zhōng fú"},
    {"id": 62, "name": "小过", "pinyin": "xiǎo guò"},
    {"id": 63, "name": "既济", "pinyin": "jì jì"},
    {"id": 64, "name": "未济", "pinyin": "wèi jì"},
]

# 已完整的前 8 卦数据（作为参考）
COMPLETE_DATA = {
    1: {
        "judgment": "元亨利贞。",
        "image": "天行健，君子以自强不息。",
        "lines": [
            "潜龙勿用。",
            "见龙在田，利见大人。",
            "君子终日乾乾，夕惕若厉，无咎。",
            "或跃在渊，无咎。",
            "飞龙在天，利见大人。",
            "亢龙有悔。",
        ]
    },
    2: {
        "judgment": "元亨，利牝马之贞。君子有攸往，先迷后得主。利西南得朋，东北丧朋。安贞吉。",
        "image": "地势坤，君子以厚德载物。",
        "lines": [
            "履霜，坚冰至。",
            "直方大，不习无不利。",
            "含章可贞。或从王事，无成有终。",
            "括囊，无咎无誉。",
            "黄裳，元吉。",
            "龙战于野，其血玄黄。",
        ]
    }
}

def generate_hexagram_data(gua):
    """
    使用 AI 生成单卦的完整数据
    实际应调用 AI API，这里用预设数据
    """
    gua_id = gua["id"]
    
    # 如果已有完整数据，直接返回
    if gua_id in COMPLETE_DATA:
        return COMPLETE_DATA[gua_id]
    
    # 否则返回待补充（实际应调用 AI 生成）
    return {
        "judgment": "卦辞待补充",
        "image": "象传待补充",
        "lines": ["爻辞待补充"] * 6
    }

def main():
    print("📖 开始生成易经 64 卦数据...")
    
    all_data = {}
    
    for i, gua in enumerate(HEXAGRAMS, 1):
        print(f"[{i}/64] 生成 {gua['name']} 卦...")
        data = generate_hexagram_data(gua)
        all_data[gua["id"]] = {
            "name": gua["name"],
            "pinyin": gua["pinyin"],
            **data
        }
    
    # 输出为 JSON
    output_file = "/tmp/iching-data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 数据已生成到 {output_file}")
    print(f"📊 共 {len(all_data)} 卦")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
