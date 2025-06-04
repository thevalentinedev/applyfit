"use client"

import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ExternalHyperlink } from "docx"
import saveAs from "file-saver"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { DraftManager } from "./draft-manager"

// PDF Export Functions using jsPDF
export async function exportResumeToPDF(resume: GeneratedResume): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf")

    // Import additional font for better text rendering
    await import("@fontsource/roboto")

    // Create PDF document with letter size
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
      compress: true,
    })

    // Set default font
    doc.setFont("helvetica")

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 72 // 1 inch margins
    const contentWidth = pageWidth - margin * 2

    let yPosition = margin

    // Helper function to add section headers with underlines
    const addSectionHeader = (text: string) => {
      // Add some space before section headers (except the first one)
      if (yPosition > margin + 10) {
        yPosition += 20
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text(text, margin, yPosition)
      yPosition += 8

      // Add underline
      doc.setLineWidth(1)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 15
    }

    // Helper function to check if we need a new page
    const checkForNewPage = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Helper function to add hyperlinks
    const addHyperlink = (text: string, url: string, x: number, y: number) => {
      // Save current text color
      const currentTextColor = doc.getTextColor()

      // Set link color and underline
      doc.setTextColor(0, 102, 204) // #0066cc
      doc.text(text, x, y)

      // Calculate text width for the underline
      const textWidth = doc.getTextWidth(text)

      // Add underline
      doc.setLineWidth(0.5)
      doc.line(x, y + 2, x + textWidth, y + 2)

      // Add link annotation
      doc.link(x, y - 10, textWidth, 14, { url })

      // Restore text color
      doc.setTextColor(currentTextColor)

      return textWidth
    }

    // Helper function for proper text spacing
    const addTextWithProperSpacing = (text: string) => {
      // Fix common spacing issues
      return text
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase words
        .replace(/([a-zA-Z])(\d)/g, "$1 $2") // Add space between letters and numbers
        .replace(/(\d)([a-zA-Z])/g, "$1 $2") // Add space between numbers and letters
        .replace(/([.:,;])([a-zA-Z])/g, "$1 $2") // Add space after punctuation
        .replace(/\s{2,}/g, " ") // Remove extra spaces
    }

    // HEADER SECTION
    // Name and title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    const headerText = `Valentine Ohalebo - ${resume.jobTitle}`
    const headerWidth = doc.getTextWidth(headerText)
    doc.text(headerText, (pageWidth - headerWidth) / 2, yPosition)
    yPosition += 25

    // Contact info
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    const contactText = `${resume.location} • hello@valentine.dev • valentine.dev`
    const contactWidth = doc.getTextWidth(contactText)
    doc.text(contactText, (pageWidth - contactWidth) / 2, yPosition)
    yPosition += 20

    // Links
    let linkX = (pageWidth - doc.getTextWidth("LinkedIn | GitHub")) / 2
    const linkedInWidth = addHyperlink(
      "LinkedIn",
      "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
      linkX,
      yPosition,
    )
    linkX += linkedInWidth + doc.getTextWidth(" | ") - 2
    doc.text(" | ", linkX - doc.getTextWidth(" "), yPosition)
    addHyperlink("GitHub", "https://github.com/thevalentinedev", linkX, yPosition)
    yPosition += 35

    // PROFESSIONAL SUMMARY
    addSectionHeader("PROFESSIONAL SUMMARY")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)

    // Process summary text for proper spacing
    const summaryText = addTextWithProperSpacing(resume.summary)
    const summaryLines = doc.splitTextToSize(summaryText, contentWidth)
    doc.text(summaryLines, margin, yPosition)
    yPosition += summaryLines.length * 15 + 10

    // TECHNICAL SKILLS
    checkForNewPage(150) // Approximate space needed for skills section
    addSectionHeader("TECHNICAL SKILLS")
    doc.setFontSize(11)

    Object.entries(resume.skills).forEach(([category, skills]) => {
      // Check if we need a new page for this skill category
      checkForNewPage(25)

      doc.setFont("helvetica", "bold")
      const categoryText = `${category}: `
      doc.text(categoryText, margin, yPosition)

      doc.setFont("helvetica", "normal")
      const skillsText = skills.join(", ")
      const categoryWidth = doc.getTextWidth(categoryText)

      // Process skills text for proper spacing
      const processedSkillsText = addTextWithProperSpacing(skillsText)
      const skillsLines = doc.splitTextToSize(processedSkillsText, contentWidth - categoryWidth)
      doc.text(skillsLines, margin + categoryWidth, yPosition)
      yPosition += skillsLines.length * 15
    })
    yPosition += 10

    // PROFESSIONAL EXPERIENCE
    checkForNewPage(50)
    addSectionHeader("PROFESSIONAL EXPERIENCE")

    resume.experience.forEach((exp) => {
      // Check if we need a new page for this experience
      checkForNewPage(exp.bullets.length * 20 + 40)

      // Job title and company
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(exp.title, margin, yPosition)

      // Right-aligned date
      const periodWidth = doc.getTextWidth(exp.period)
      doc.setFont("helvetica", "normal")
      doc.text(exp.period, pageWidth - margin - periodWidth, yPosition)
      yPosition += 20

      // Bullets
      doc.setFontSize(11)
      exp.bullets.forEach((bullet) => {
        // Process bullet text for proper spacing
        const processedBullet = addTextWithProperSpacing(bullet)
        const bulletLines = doc.splitTextToSize(`• ${processedBullet}`, contentWidth - 15)

        // Check if we need a new page for this bullet
        if (checkForNewPage(bulletLines.length * 15)) {
          // If we added a new page, we need to reset the font
          doc.setFontSize(11)
          doc.setFont("helvetica", "normal")
        }

        doc.text(bulletLines, margin + 15, yPosition)
        yPosition += bulletLines.length * 15 + 5
      })
      yPosition += 10
    })

    // SELECTED PROJECTS
    checkForNewPage(50)
    addSectionHeader("SELECTED PROJECTS")

    resume.projects.forEach((project) => {
      // Check if we need a new page for this project
      checkForNewPage(project.bullets.length * 20 + 40)

      // Project title
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(project.title, margin, yPosition)

      // Right-aligned period
      const periodWidth = doc.getTextWidth(project.period)
      doc.setFont("helvetica", "normal")
      doc.text(project.period, pageWidth - margin - periodWidth, yPosition)
      yPosition += 20

      // Bullets
      doc.setFontSize(11)
      project.bullets.forEach((bullet) => {
        // Process bullet text for proper spacing
        const processedBullet = addTextWithProperSpacing(bullet)
        const bulletLines = doc.splitTextToSize(`• ${processedBullet}`, contentWidth - 15)

        // Check if we need a new page for this bullet
        if (checkForNewPage(bulletLines.length * 15)) {
          // If we added a new page, we need to reset the font
          doc.setFontSize(11)
          doc.setFont("helvetica", "normal")
        }

        doc.text(bulletLines, margin + 15, yPosition)
        yPosition += bulletLines.length * 15 + 5
      })
      yPosition += 10
    })

    // EDUCATION
    checkForNewPage(120)
    addSectionHeader("EDUCATION")

    // Degree and year
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Ontario College Diploma, Computer Programming - 2025", margin, yPosition)
    yPosition += 20

    // College and location
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text("Conestoga College - Waterloo, ON", margin, yPosition)
    yPosition += 20

    // Education bullets
    const educationBullets = [
      "GPA: 3.92 (High Distinction)",
      "Courses: Web Development, OOP, UI/UX Design, Data Structures",
      "Awards: Best Final Year Project, Tech Showcase 2025, Best of Program, Capstone Project Award",
    ]

    educationBullets.forEach((bullet) => {
      // Process bullet text for proper spacing
      const processedBullet = addTextWithProperSpacing(bullet)
      const bulletLines = doc.splitTextToSize(`• ${processedBullet}`, contentWidth - 15)

      // Check if we need a new page for this bullet
      if (checkForNewPage(bulletLines.length * 15)) {
        // If we added a new page, we need to reset the font
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
      }

      doc.text(bulletLines, margin + 15, yPosition)
      yPosition += bulletLines.length * 15 + 5
    })

    // Save the PDF
    doc.save("Valentine_Ohalebo_Resume.pdf")

    // Clear resume draft after successful export
    DraftManager.clearResumeDraft()
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

export async function exportCoverLetterToPDF(coverLetter: GeneratedCoverLetter): Promise<void> {
  try {
    const { jsPDF } = await import("jspdf")

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
      compress: true,
    })

    // Set default font
    doc.setFont("helvetica")

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 72 // 1 inch margins
    const contentWidth = pageWidth - margin * 2

    let yPosition = margin

    // Helper function to check if we need a new page
    const checkForNewPage = (neededSpace: number) => {
      const pageHeight = doc.internal.pageSize.getHeight()
      if (yPosition + neededSpace > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Helper function to add hyperlinks
    const addHyperlink = (text: string, url: string, x: number, y: number) => {
      // Save current text color
      const currentTextColor = doc.getTextColor()

      // Set link color and underline
      doc.setTextColor(0, 102, 204) // #0066cc
      doc.text(text, x, y)

      // Calculate text width for the underline
      const textWidth = doc.getTextWidth(text)

      // Add underline
      doc.setLineWidth(0.5)
      doc.line(x, y + 2, x + textWidth, y + 2)

      // Add link annotation
      doc.link(x, y - 10, textWidth, 14, { url })

      // Restore text color
      doc.setTextColor(currentTextColor)

      return textWidth
    }

    // Helper function for proper text spacing
    const addTextWithProperSpacing = (text: string) => {
      // Fix common spacing issues
      return text
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase words
        .replace(/([a-zA-Z])(\d)/g, "$1 $2") // Add space between letters and numbers
        .replace(/(\d)([a-zA-Z])/g, "$1 $2") // Add space between numbers and letters
        .replace(/([.:,;])([a-zA-Z])/g, "$1 $2") // Add space after punctuation
        .replace(/\s{2,}/g, " ") // Remove extra spaces
    }

    // HEADER
    // Name
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Valentine Ohalebo", margin, yPosition)
    yPosition += 20

    // Contact info
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`${coverLetter.location} • hello@valentine.dev • valentine.dev`, margin, yPosition)
    yPosition += 15

    // Links
    let linkX = margin
    const linkedInWidth = addHyperlink(
      "LinkedIn",
      "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
      linkX,
      yPosition,
    )
    linkX += linkedInWidth + doc.getTextWidth(" | ") - 2
    doc.text(" | ", linkX - doc.getTextWidth(" "), yPosition)
    addHyperlink("GitHub", "https://github.com/thevalentinedev", linkX, yPosition)
    yPosition += 15

    // Date
    doc.text(`Date: ${coverLetter.date}`, margin, yPosition)
    yPosition += 30

    // RECIPIENT
    doc.setFontSize(11)
    doc.text(coverLetter.recipient.name, margin, yPosition)
    yPosition += 15

    doc.text(coverLetter.recipient.company, margin, yPosition)
    yPosition += 15

    doc.text(coverLetter.recipient.location, margin, yPosition)
    yPosition += 30

    // GREETING
    doc.text(coverLetter.greeting, margin, yPosition)
    yPosition += 25

    // BODY PARAGRAPHS
    const bodyParagraphs = [coverLetter.body.hook, coverLetter.body.skills, coverLetter.body.closing]

    bodyParagraphs.forEach((paragraph) => {
      // Process paragraph text for proper spacing
      const processedParagraph = addTextWithProperSpacing(paragraph)
      const lines = doc.splitTextToSize(processedParagraph, contentWidth)

      // Check if we need a new page
      if (checkForNewPage(lines.length * 15 + 10)) {
        // If we added a new page, we need to reset the font
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
      }

      doc.text(lines, margin, yPosition)
      yPosition += lines.length * 15 + 15
    })

    // CLOSING
    yPosition += 10
    doc.text("Warm regards,", margin, yPosition)
    yPosition += 25

    doc.setFont("helvetica", "bold")
    doc.text("Valentine Ohalebo", margin, yPosition)

    // Save the PDF
    doc.save("Valentine_Ohalebo_Cover_Letter.pdf")

    // Clear cover letter draft after successful export
    DraftManager.clearCoverLetterDraft()
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

export async function exportBothToPDF(resume: GeneratedResume, coverLetter: GeneratedCoverLetter): Promise<void> {
  // Export resume
  await exportResumeToPDF(resume)

  // Small delay to ensure files don't conflict
  setTimeout(async () => {
    await exportCoverLetterToPDF(coverLetter)
  }, 500)

  // Clear all drafts after successful export
  DraftManager.clearAllDrafts()
}

// DOCX Export Functions (existing)
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
