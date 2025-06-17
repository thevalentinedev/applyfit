"use client"

import { RESUME_TEMPLATE } from "@/lib/resume-template"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TemplateReference() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Template Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Header Format</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div>{RESUME_TEMPLATE.structure.header.name}</div>
                <div>{RESUME_TEMPLATE.structure.header.location}</div>
                <div>{RESUME_TEMPLATE.structure.header.contact}</div>
                <div>{RESUME_TEMPLATE.structure.header.links}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Section Order</h3>
              <ol className="list-decimal list-inside space-y-1">
                {RESUME_TEMPLATE.structure.sections.map((section, index) => (
                  <li key={index} className="text-sm">
                    {section}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Technical Skills Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(RESUME_TEMPLATE.content.technicalSkills.categories).map(([category, description]) => (
                  <div key={category} className="bg-blue-50 p-2 rounded text-sm">
                    <div className="font-medium">{category}</div>
                    <div className="text-gray-600 text-xs">{description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Fixed Education Details</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">{RESUME_TEMPLATE.content.education.degree}</div>
                <div>{RESUME_TEMPLATE.content.education.institution}</div>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {RESUME_TEMPLATE.content.education.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
