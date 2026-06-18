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
          content: `你是一个专业的简历文档分析助手。任务是分析简历图片，分割出各个内容区块。

**严格要求**：你必须返回一个严格符合JSON规范的格式。属性名和字符串值必须用双引号。
不要在对象末尾加逗号。不要用单引号。

格式示例：
{
  "blocks": [
    {
      "x": 40,
      "y": 60,
      "width": 150,
      "height": 46,
      "type": "title",
      "content": "张三",
      "confidence": 1
    }
  ]
}

区块类型(type)必须为以下之一:
- "title": 姓名/大标题
- "paragraph": 正文/个人总结/描述
- "timeline": 教育经历/工作经历
- "skill-bar": 技能条/技能+百分比
- "tag-group": 标签组/技能词列表
- "contact": 联系方式
- "divider": 分割线
- "avatar": 头像

注意:
1. 精确标注像素坐标
2. 图片尺寸为 ${imgWidth}x${imgHeight}px
3. **只返回JSON,不要任何其他文字或解释**
4. **JSON必须是严格的RFC标准: 双引号、无尾部逗号**
5. 合并相邻的同类内容`,
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

  console.log('Kimi raw response:', content)

  // 从返回文本中提取对象/数组部分
  let extracted = content.trim()

  // 尝试提取 ```json ... ``` 代码块
  const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlock) {
    extracted = codeBlock[1].trim()
  } else {
    // 提取第一个 { 或 [ 开始的内容
    const startIdx = Math.min(
      extracted.indexOf('{') >= 0 ? extracted.indexOf('{') : Infinity,
      extracted.indexOf('[') >= 0 ? extracted.indexOf('[') : Infinity,
    )
    if (startIdx < Infinity) {
      extracted = extracted.slice(startIdx)
    }
  }

  // 去掉末尾多余的文本（} 或 ] 之后）
  const lastBrace = extracted.lastIndexOf('}')
  const lastBracket = extracted.lastIndexOf(']')
  const endIdx = Math.max(lastBrace, lastBracket)
  if (endIdx > 0) {
    extracted = extracted.slice(0, endIdx + 1)
  }

  // 核心策略：用 JS new Function 解析（容忍无引号key、单引号、尾部逗号）
  let parsed: any
  try {
    // 先尝试标准 JSON.parse
    parsed = JSON.parse(extracted)
  } catch {
    try {
      // 用 JS 对象字面量方式解析（更宽容）
      parsed = new Function(`return (${extracted})`)()
    } catch (e2) {
      // 最后一招：修复常见问题后重试
      let fixed = extracted
        .replace(/,\s*([}\]])/g, '$1')          // 去尾部逗号
        .replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":') // 无引号key加引号
        .replace(/'/g, '"')                      // 单引号→双引号
      try {
        parsed = JSON.parse(fixed)
      } catch (e3) {
        console.error('Kimi parse failed. Raw:', content)
        console.error('Extracted:', extracted)
        console.error('Fixed:', fixed)
        throw new Error(
          `AI 返回格式解析失败。原始回复: ${content.substring(0, 250)}...`
        )
      }
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
