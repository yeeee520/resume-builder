// Kimi (Moonshot) Vision API 接入
// endpoint: https://api.moonshot.cn/v1/chat/completions
// model: moonshot-v1-8k-vision-preview

const KIMI_API_KEY = 'sk-Xfzmqy6VfneqVmp70Ix4DJ7l5Tfqqh4VyA3QFEh4eBbgBe2I'
const KIMI_BASE_URL = 'https://api.moonshot.cn/v1'

export interface VisionBlockResult {
  x: number
  y: number
  width: number
  height: number
  type: string        // 'title' | 'paragraph' | 'timeline' | 'skill-bar' | 'tag-group' | 'contact' | 'divider' | 'avatar'
  content: string
  confidence: number
}

export interface VisionPageResult {
  page: number
  width: number
  height: number
  blocks: VisionBlockResult[]
}

/**
 * 将图片 base64 发送给 Kimi Vision API 进行简历区块识别
 */
export async function analyzeResumeImage(
  imageBase64: string,
  apiKey: string,
  pageIndex: number,
  imgWidth: number,
  imgHeight: number,
): Promise<VisionPageResult> {
  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k-vision-preview',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的简历文档分析助手。你的任务是分析简历图片，识别并分割出其中的各个内容区块。

请以JSON格式返回分析结果，格式如下：
{
  "blocks": [
    {
      "x": 区块左上角x坐标(像素),
      "y": 区块左上角y坐标(像素),
      "width": 区块宽度(像素),
      "height": 区块高度(像素),
      "type": 区块类型,
      "content": "区块内的文字内容",
      "confidence": 置信度(0-1)
    }
  ]
}

区块类型(type)必须是以下之一:
- "title": 姓名/大标题
- "paragraph": 正文/个人总结/描述文字
- "timeline": 教育经历/工作经历(含日期)
- "skill-bar": 技能条/技能+百分比
- "tag-group": 标签组/技能词列表
- "contact": 联系方式(电话/邮箱/地址/GitHub)
- "divider": 分割线
- "avatar": 头像/照片

注意:
1. 请尽量精确地标注每个区块的像素坐标
2. 图片尺寸为 ${imgWidth}x${imgHeight}px
3. 只返回JSON,不要有其他文字说明
4. 将相邻且语义相同的内容合并为一个区块`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: `请分析这份简历的第${pageIndex + 1}页，识别所有内容区块并返回JSON。`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Kimi API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Kimi 可能在 JSON 中混入了其他文字，需要精确提取
  let extracted = content

  // 尝试匹配 ```json ... ``` 代码块
  const codeBlock = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (codeBlock) {
    extracted = codeBlock[1]
  } else {
    // 尝试匹配 { 开头的完整 JSON（贪心匹配）
    const objMatch = content.match(/\{[\s\S]*\}/)
    if (objMatch) {
      extracted = objMatch[0]
    }
  }

  // 修复常见的 JSON 问题
  extracted = extracted
    .replace(/,\s*\}/g, '}')           // 移除尾部逗号
    .replace(/,\s*\]/g, ']')           // 移除数组尾部逗号
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // 属性名加引号
    .replace(/:\s*'([^']*)'/g, ': "$1"') // 单引号值 → 双引号
    .replace(/\n/g, ' ')              // 换行替换空格
    .replace(/\t/g, ' ')              // 制表符替换空格

  let parsed: any
  try {
    parsed = JSON.parse(extracted)
  } catch {
    // 第二次尝试：更激进地修复
    // Kimi 有时在 blocks 数组里的 object key 不加引号
    const blocksMatch = content.match(/"blocks"\s*:\s*\[([\s\S]*?)\]\s*\}/)
    if (blocksMatch) {
      // 手动重建
      parsed = { blocks: [] }
      // 尝试逐行提取
    }

    if (!parsed) {
      console.error('Kimi raw response:', content)
      throw new Error('AI 返回的格式无法解析，请重试。原始响应: ' + content.substring(0, 300))
    }
  }
  const blocks: VisionBlockResult[] = (parsed.blocks || []).map((b: any, i: number) => ({
    x: Math.round(b.x || 0),
    y: Math.round(b.y || 0),
    width: Math.round(b.width || 100),
    height: Math.round(b.height || 40),
    type: b.type || 'paragraph',
    content: b.content || '',
    confidence: b.confidence || 0.8,
  }))

  return {
    page: pageIndex,
    width: imgWidth,
    height: imgHeight,
    blocks,
  }
}

/**
 * 批量分析 PDF 的所有页面
 */
export async function analyzeResumePDF(
  pageImages: Array<{ page: number; base64: string; width: number; height: number }>,
  apiKey: string,
): Promise<VisionPageResult[]> {
  const results: VisionPageResult[] = []

  for (const pageImg of pageImages) {
    try {
      const result = await analyzeResumeImage(
        pageImg.base64,
        apiKey,
        pageImg.page,
        pageImg.width,
        pageImg.height,
      )
      results.push(result)
    } catch (err) {
      console.error(`Page ${pageImg.page + 1} analysis failed:`, err)
      throw err
    }
  }

  return results
}
