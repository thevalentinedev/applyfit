"use client"

import { COVER_LETTER_TEMPLATE } from "@/lib/cover-letter-template"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CoverLetterReference() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter Template Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Header Format</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div>{COVER_LETTER_TEMPLATE.structure.header.name}</div>
                <div>{COVER_LETTER_TEMPLATE.structure.header.location}</div>
                <div>{COVER_LETTER_TEMPLATE.structure.header.contact}</div>
                <div>{COVER_LETTER_TEMPLATE.structure.header.links}</div>
                <div>{COVER_LETTER_TEMPLATE.structure.header.date}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Recipient Format</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div>{COVER_LETTER_TEMPLATE.structure.recipient.hiringManager}</div>
                <div>{COVER_LETTER_TEMPLATE.structure.recipient.company}</div>
                <div>{COVER_LETTER_TEMPLATE.structure.recipient.location}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Body Structure</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div className="mb-2">{COVER_LETTER_TEMPLATE.structure.greeting}</div>
                <div className="space-y-2">
                  {COVER_LETTER_TEMPLATE.structure.body.map((paragraph, index) => (
                    <div key={index}>{paragraph}</div>
                  ))}
                </div>
                <div className="mt-2 whitespace-pre-line">{COVER_LETTER_TEMPLATE.structure.closing}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Content Guidelines</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-2 rounded text-sm">
                  <div className="font-medium">Hook Sentence</div>
                  <div className="text-gray-600 text-xs">{COVER_LETTER_TEMPLATE.content.body.hook.instructions}</div>
                  <div className="mt-1 text-xs italic">
                    Example: {COVER_LETTER_TEMPLATE.content.body.hook.examples[0]}
                  </div>
                </div>

                <div className="bg-blue-50 p-2 rounded text-sm">
                  <div className="font-medium">Skills Highlight</div>
                  <div className="text-gray-600 text-xs">{COVER_LETTER_TEMPLATE.content.body.skills.instructions}</div>
                  <div className="mt-1 text-xs italic">
                    Example: {COVER_LETTER_TEMPLATE.content.body.skills.examples[0]}
                  </div>
                </div>

                <div className="bg-blue-50 p-2 rounded text-sm">
                  <div className="font-medium">Closing Statement</div>
                  <div className="text-gray-600 text-xs">{COVER_LETTER_TEMPLATE.content.body.closing.instructions}</div>
                  <div className="mt-1 text-xs italic">
                    Example: {COVER_LETTER_TEMPLATE.content.body.closing.examples[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
