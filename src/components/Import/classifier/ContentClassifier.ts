import type { TextSegment, ClassificationResult } from '@/store/types'
import {
  type ClassifierRule,
  ContactRule,
  TimelineRule,
  NameRule,
  HeadingRule,
  SkillRule,
  ParagraphRule,
} from './rules'

export class ContentClassifier {
  private rules: ClassifierRule[] = []

  constructor() {
    this.rules = [
      new ContactRule(),
      new TimelineRule(),
      new NameRule(),
      new HeadingRule(),
      new SkillRule(),
      new ParagraphRule(),
    ]
    // Sort by priority
    this.rules.sort((a, b) => a.priority - b.priority)
  }

  classify(segments: TextSegment[]): ClassificationResult[] {
    const assigned = new Set<number>()
    const allResults: ClassificationResult[] = []

    for (const rule of this.rules) {
      const results = rule.match(segments, assigned)
      for (const r of results) {
        for (const idx of r.segmentIndices) {
          if (!assigned.has(idx)) {
            assigned.add(idx)
          }
        }
        allResults.push(r)
      }
    }

    // Sort by segment order
    allResults.sort((a, b) => a.segmentIndices[0] - b.segmentIndices[0])

    return allResults
  }
}
