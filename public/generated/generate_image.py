import requests
import json
from datetime import datetime

# 生图提示词
prompt = "Professional male driver sitting comfortably in car driver seat with lumbar support cushion behind his back, relaxed driving posture, modern car interior, natural lighting, high quality, photorealistic, 8K resolution, commercial photography style"

# 使用 Stable Diffusion API 或其他生图服务
# 这里使用示例 API，实际使用时需要配置真实的 API endpoint
api_url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

headers = {
    "Authorization": "Bearer YOUR_API_KEY",  # 需要配置 API key
    "Content-Type": "application/json"
}

payload = {
    "text_prompts": [{"text": prompt, "weight": 1.0}],
    "cfg_scale": 7,
    "height": 1024,
    "width": 1024,
    "samples": 1,
    "steps": 30
}

# 生成文件名
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"driver_lumbar_support_{timestamp}.png"

print(f"正在生成图片：{filename}")
print(f"提示词：{prompt}")
print("注意：需要配置真实的生图 API key")

# 保存占位文件（实际使用时替换为真实 API 调用）
with open(filename, 'w') as f:
    f.write("# 图片生成占位文件\n")
    f.write(f"提示词：{prompt}\n")
    f.write(f"生成时间：{timestamp}\n")

print(f"文件已创建：{filename}")
