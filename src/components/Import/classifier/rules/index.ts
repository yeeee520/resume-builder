import type { TextSegment, ClassificationResult } from '@/store/types'

// ==================== Rule 基类 ====================

export interface ClassifierRule {
  name: string
  priority: number
  match(segments: TextSegment[], assigned: Set<number>): ClassificationResult[]
}

// ==================== 联系方式 ====================

export class ContactRule implements ClassifierRule {
  name = 'contact'
  priority = 10

  match(segments: TextSegment[], assigned: Set<number>): ClassificationResult[] {
    const results: ClassificationResult[] = []

    const phoneRe = /1[3-9]\d{1}[-.\s]?\d{4}[-.\s]?\d{4}/g
    const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const githubRe = /github\.com\/[a-zA-Z0-9_-]+/ig
    const linkedinRe = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/ig
    const urlRe = /https?:\/\/[^\s,，。]+/g
    const kvRe = /(电话|手机|邮箱|Email|GitHub|LinkedIn|网站|博客|微信|QQ|地址)[：:]/

    for (let i = 0; i < segments.length; i++) {
      if (assigned.has(i)) continue
      const text = segments[i].text
      const items: Array<{ label: string; value: string }> = []

      // Check K/V format
      const kvMatch = text.match(kvRe)
      if (kvMatch) {
        const parts = text.split(/[：:]\s*/)
        if (parts.length >= 2) {
          items.push({ label: kvMatch[1], value: parts.slice(1).join(': ').trim() })
        }
      }

      // Check for direct matches
      for (const match of text.matchAll(phoneRe)) {
        items.push({ label: '电话', value: match[0] })
      }
      for (const match of text.matchAll(emailRe)) {
        items.push({ label: '邮箱', value: match[0] })
      }
      for (const match of text.matchAll(githubRe)) {
        items.push({ label: 'GitHub', value: match[0] })
      }
      for (const match of text.matchAll(linkedinRe)) {
        items.push({ label: 'LinkedIn', value: match[0] })
      }
      for (const match of text.matchAll(urlRe)) {
        const isAlreadyAdded = items.some(item => item.value === match[0])
        if (!isAlreadyAdded) {
          items.push({ label: '网站', value: match[0] })
        }
      }

      if (items.length > 0) {
        results.push({
          segmentIndices: [i],
          blockType: 'contact',
          confidence: 'high',
          label: '联系方式',
          data: { items },
          ruleName: this.name,
        })
      }
    }

    return results
  }
}

// ==================== 时间线 ====================

export class TimelineRule implements ClassifierRule {
  name = 'timeline'
  priority = 20

  match(segments: TextSegment[], assigned: Set<number>): ClassificationResult[] {
    const results: ClassificationResult[] = []
    const dateRe = /\d{4}[.年/-]\d{1,2}[月]?\s*[-–—至到]\s*(\d{4}[.年/-]?\d{1,2}[月]?|至今|现在|present)/i

    for (let i = 0; i < segments.length; i++) {
      if (assigned.has(i)) continue
      const text = segments[i].text
      if (!dateRe.test(text)) continue

      // Found a date line — look for title (next non-date line) and description
      let title = ''
      let description = ''
      let end = i

      // Title is the next non-date segment(s), up to a limit
      for (let j = i; j < Math.min(i + 3, segments.length); j++) {
        if (assigned.has(j)) break
        if (j === i) {
          // The date line itself may contain title (e.g. "2020 - 2023 XX公司 前端工程师")
          const withoutDate = text.replace(dateRe, '').trim()
          if (withoutDate) {
            title = withoutDate
            end = j
          }
        } else if (!dateRe.test(segments[j].text)) {
          if (!title) {
            title = segments[j].text
            end = j
          } else if (!description) {
            description = segments[j].text
            end = j
          }
        } else {
          break
        }
      }

      if (!title) {
        // Use the date line text as the title too
        title = text
        end = i
      }

      results.push({
        segmentIndices: [i, end],
        blockType: 'timeline',
        confidence: description ? 'high' : 'medium',
        label: title || text,
        data: {
          items: [{
            id: '',
            dateRange: text.match(dateRe)?.[0] || text,
            title: title || text,
            description,
          }],
        },
        ruleName: this.name,
      })

      // Mark all consumed indices
      for (let k = i; k <= end; k++) assigned.add(k)
    }

    return results
  }
}

// ==================== 姓名 ====================

export class NameRule implements ClassifierRule {
  name = 'name'
  priority = 15

  match(segments: TextSegment[], assigned: Set<number>): ClassificationResult[] {
    const results: ClassificationResult[] = []
    const nameRe = /^[一-鿿]{2,4}$/
    const enNameRe = /^[A-Z][a-z]+\s+[A-Z][a-z]+$/

    // Look in first 3 unassigned segments
    const candidates = segments
      .map((s, i) => ({ s, i }))
      .filter(({ i }) => !assigned.has(i))
      .slice(0, 3)

    for (const { s, i } of candidates) {
      const text = s.text
      if (nameRe.test(text) || enNameRe.test(text)) {
        results.push({
          segmentIndices: [i],
          blockType: 'title',
          confidence: i === 0 ? 'high' : 'medium',
          label: text,
          data: { content: text, level: 'h1' },
          ruleName: this.name,
        })
        return results // Only one name
      }
    }

    return results
  }
}

// ==================== 章节标题 ====================

export class HeadingRule implements ClassifierRule {
  name = 'heading'
  priority = 25

  static KEYWORDS = [
    '教育', '工作', '项目', '技能', '联系', '个人', '自我', '总结',
    '实习', '校园', '荣誉', '证书', '语言', '经历', '经验', '学历',
    '专业', '背景', '概况', '简介', '能力',
  ]

  match(segments: TextSegment[], assigned: Set<number>): ClassificationResult[] {
    const results: ClassificationResult[] = []

    for (let i = 0; i < segments.length; i++) {
      if (assigned.has(i)) continue
      const text = segments[i].text

      const isShort = text.length <= 20
      const isBold = segments[i].metadata.isBold === true
      const hasKeyword = HeadingRule.KEYWORDS.some(k => text.includes(k))
      const score = (isShort ? 1 : 0) + (isBold ? 1 : 0) + (hasKeyword ? 2 : 0)

      if (score >= 2) {
        results.push({
          segmentIndices: [i],
          blockType: 'title',
          confidence: score >= 3 ? 'high' : 'medium',
          label: text,
          data: { content: text, level: 'h2' },
          ruleName: this.name,
        })
      }
    }

    return results
  }
}

// ==================== 技能 ====================

export class SkillRule implements ClassifierRule {
  name = 'skill'
  priority = 30

  match(segments: TextSegment[], assigned: Set<number>): ClassificationResult[] {
    const results: ClassificationResult[] = []

    for (let i = 0; i < segments.length; i++) {
      if (assigned.has(i)) continue
      const text = segments[i].text
      if (text.length > 80) continue

      // Check for "Skill 90%" patterns
      const percentRe = /([\w\s+\-.#]+?)\s+(\d{1,3})%/i
      const percentMatch = text.match(percentRe)

      if (percentMatch) {
        results.push({
          segmentIndices: [i],
          blockType: 'skill-bar',
          confidence: 'high',
          label: percentMatch[1].trim(),
          data: { label: percentMatch[1].trim(), level: parseInt(percentMatch[2]) },
          ruleName: this.name,
        })
        continue
      }

      // Check for comma/separator separated list
      const parts = text.split(/[,，、;；\s]{2,}/).filter(p => p.trim().length > 0 && p.trim().length <= 15)
      if (parts.length >= 2) {
        const tags = parts.map(p => ({
          id: '',
          text: p.trim(),
          color: '#2563eb',
        }))
        results.push({
          segmentIndices: [i],
          blockType: 'tag-group',
          confidence: 'medium',
          label: `标签组 (${parts.length}个)`,
          data: { tags },
          ruleName: this.name,
        })
      }
    }

    return results
  }
}

// ==================== 正文 (兜底) ====================

export class ParagraphRule implements ClassifierRule {
  name = 'paragraph'
  priority = 100

  match(segments: TextSegment[], assigned: Set<number>): ClassificationResult[] {
    const results: ClassificationResult[] = []

    for (let i = 0; i < segments.length; i++) {
      if (assigned.has(i)) continue
      results.push({
        segmentIndices: [i],
        blockType: 'paragraph',
        confidence: 'low',
        label: segments[i].text.substring(0, 40),
        data: { content: segments[i].text },
        ruleName: this.name,
      })
    }

    // Merge adjacent paragraphs
    return this.mergeAdjacent(results, segments)
  }

  private mergeAdjacent(results: ClassificationResult[], segments: TextSegment[]): ClassificationResult[] {
    const merged: ClassificationResult[] = []
    for (const r of results) {
      const prev = merged[merged.length - 1]
      if (prev && prev.blockType === 'paragraph' &&
        r.segmentIndices[0] === (prev.segmentIndices[prev.segmentIndices.length - 1] ?? -1) + 1) {
        prev.segmentIndices.push(r.segmentIndices[0])
        const combined = [prev.data.content as string, r.data.content as string].join('\n\n')
        prev.data.content = combined
        prev.label = combined.substring(0, 40)
      } else {
        merged.push(r)
      }
    }
    return merged
  }
}
