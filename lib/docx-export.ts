"use client"

import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ExternalHyperlink } from "docx"
import saveAs from "file-saver"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { DraftManager } from "./draft-manager"

export async function exportResumeToDocx(resume: GeneratedResume): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 540, // 0.75 inches
              right: 540, // 0.75 inches
              bottom: 540, // 0.75 inches
              left: 540, // 0.75 inches
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: `Valentine Ohalebo - ${resume.jobTitle}`,
                bold: true,
                size: 32, // 16pt
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, line: 276, lineRule: "auto" }, // 1.15 line spacing
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${resume.location} • `,
                size: 20, // 10pt
                font: "Arial",
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "hello@valentine.dev",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "mailto:hello@valentine.dev",
              }),
              new TextRun({
                text: " • ",
                size: 20, // 10pt
                font: "Arial",
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "valentine.dev",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "https://valentine.dev",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "LinkedIn",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
              }),
              new TextRun({ text: " | ", size: 20, font: "Arial" }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "GitHub",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "https://github.com/thevalentinedev",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400, line: 276, lineRule: "auto" },
          }),

          // Professional Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "PROFESSIONAL SUMMARY",
                bold: true,
                size: 28, // 14pt
                font: "Arial",
              }),
            ],
            spacing: { after: 200, line: 276, lineRule: "auto" },
            border: {
              bottom: {
                color: "auto",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resume.summary,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 400, line: 276, lineRule: "auto" },
          }),

          // Technical Skills
          new Paragraph({
            children: [
              new TextRun({
                text: "TECHNICAL SKILLS",
                bold: true,
                size: 28, // 14pt
                font: "Arial",
              }),
            ],
            spacing: { after: 200, line: 276, lineRule: "auto" },
            border: {
              bottom: {
                color: "auto",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
          ...Object.entries(resume.skills).map(
            ([category, skills]) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${category}: `,
                    bold: true,
                    size: 22, // 11pt
                    font: "Arial",
                  }),
                  new TextRun({
                    text: skills.join(", "),
                    size: 22, // 11pt
                    font: "Arial",
                  }),
                ],
                spacing: { after: 100, line: 276, lineRule: "auto" },
              }),
          ),
          new Paragraph({
            text: "",
            spacing: { after: 300 },
          }),

          // Professional Experience
          new Paragraph({
            children: [
              new TextRun({
                text: "PROFESSIONAL EXPERIENCE",
                bold: true,
                size: 28, // 14pt
                font: "Arial",
              }),
            ],
            spacing: { after: 200, line: 276, lineRule: "auto" },
            border: {
              bottom: {
                color: "auto",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
          ...resume.experience.flatMap((exp) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 22, // 11pt
                  font: "Arial",
                }),
                new TextRun({
                  text: `\t${exp.period}`,
                  size: 22, // 11pt
                  font: "Arial",
                }),
              ],
              spacing: { after: 100, line: 276, lineRule: "auto" },
            }),
            ...exp.bullets.map(
              (bullet) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${bullet}`,
                      size: 22, // 11pt
                      font: "Arial",
                    }),
                  ],
                  indent: { left: 360 },
                  spacing: { after: 100, line: 276, lineRule: "auto" },
                }),
            ),
            new Paragraph({
              text: "",
              spacing: { after: 200 },
            }),
          ]),

          // Selected Projects
          new Paragraph({
            children: [
              new TextRun({
                text: "SELECTED PROJECTS",
                bold: true,
                size: 28, // 14pt
                font: "Arial",
              }),
            ],
            spacing: { after: 200, line: 276, lineRule: "auto" },
            border: {
              bottom: {
                color: "auto",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
          ...resume.projects.flatMap((project) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: project.title,
                  bold: true,
                  size: 22, // 11pt
                  font: "Arial",
                }),
                new TextRun({
                  text: `\t${project.period}`,
                  size: 22, // 11pt
                  font: "Arial",
                }),
              ],
              spacing: { after: 100, line: 276, lineRule: "auto" },
            }),
            ...project.bullets.map(
              (bullet) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${bullet}`,
                      size: 22, // 11pt
                      font: "Arial",
                    }),
                  ],
                  indent: { left: 360 },
                  spacing: { after: 100, line: 276, lineRule: "auto" },
                }),
            ),
            new Paragraph({
              text: "",
              spacing: { after: 200 },
            }),
          ]),

          // Education
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                size: 28, // 14pt
                font: "Arial",
              }),
            ],
            spacing: { after: 200, line: 276, lineRule: "auto" },
            border: {
              bottom: {
                color: "auto",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Ontario College Diploma, Computer Programming - 2025",
                bold: true,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Conestoga College - Waterloo, ON",
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• GPA: 3.92 (High Distinction)",
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Courses: Web Development, OOP, UI/UX Design, Data Structures",
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Awards: Best Final Year Project, Tech Showcase 2025, Best of Program, Capstone Project Award",
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, "Valentine_Ohalebo_Resume.docx")

  // Clear resume draft after successful export
  DraftManager.clearResumeDraft()
}

export async function exportCoverLetterToDocx(coverLetter: GeneratedCoverLetter): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 540, // 0.75 inches
              right: 540, // 0.75 inches
              bottom: 540, // 0.75 inches
              left: 540, // 0.75 inches
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: "Valentine Ohalebo",
                bold: true,
                size: 28, // 14pt
                font: "Arial",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${coverLetter.location} • `,
                size: 20, // 10pt
                font: "Arial",
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "hello@valentine.dev",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "mailto:hello@valentine.dev",
              }),
              new TextRun({
                text: " • ",
                size: 20, // 10pt
                font: "Arial",
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "valentine.dev",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "https://valentine.dev",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "LinkedIn",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
              }),
              new TextRun({ text: " | ", size: 20, font: "Arial" }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "Github",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: "https://github.com/thevalentinedev",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${coverLetter.date}`,
                size: 20, // 10pt
                font: "Arial",
              }),
            ],
            spacing: { after: 400, line: 276, lineRule: "auto" },
          }),

          // Recipient
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetter.recipient.name,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetter.recipient.company,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetter.recipient.location,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 400, line: 276, lineRule: "auto" },
          }),

          // Greeting
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetter.greeting,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 300, line: 276, lineRule: "auto" },
          }),

          // Body
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetter.body.hook,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 300, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetter.body.skills,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 300, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetter.body.closing,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 400, line: 276, lineRule: "auto" },
          }),

          // Closing
          new Paragraph({
            children: [
              new TextRun({
                text: "Warm regards,",
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
            spacing: { after: 200, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Valentine Ohalebo",
                bold: true,
                size: 22, // 11pt
                font: "Arial",
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, "Valentine_Ohalebo_Cover_Letter.docx")

  // Clear cover letter draft after successful export
  DraftManager.clearCoverLetterDraft()
}

export async function exportBothToDocx(resume: GeneratedResume, coverLetter: GeneratedCoverLetter): Promise<void> {
  // Export resume
  await exportResumeToDocx(resume)

  // Small delay to ensure files don't conflict
  setTimeout(async () => {
    await exportCoverLetterToDocx(coverLetter)
  }, 500)

  // Clear all drafts after successful export
  DraftManager.clearAllDrafts()
}
