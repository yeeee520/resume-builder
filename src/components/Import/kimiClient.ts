// Kimi (Moonshot) Vision API 接入
// endpoint: https://api.moonshot.cn/v1/chat/completions
// model: moonshot-v1-8k-vision-preview

const KIMI_API_KEY = ''
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

  // 从返回文本中提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Kimi did not return valid JSON: ' + content.substring(0, 200))
  }

  const parsed = JSON.parse(jsonMatch[0])
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
