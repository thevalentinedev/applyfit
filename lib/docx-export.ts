"use client"

import * as PizZip from "pizzip"
import * as Docxtemplater from "docxtemplater"
import * as fs from "fs"
import * as path from "path"
import saveAs from "file-saver"
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ExternalHyperlink } from "docx"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { DraftManager } from "./draft-manager"
import { storeResumeFile, storeCoverLetterFile } from "@/app/actions/store-resume-file"

// Helper function to format phone number
const formatPhoneNumber = (phone: string) => {
  if (!phone) return ""
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  // Format as XXX XXX XXXX
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone // Return original if not 10 digits
}

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

    // HEADER SECTION - Use the same data as preview
    // Get user data from resume object (which contains the mapped data)
    const userName = resume.candidateName || "Candidate Name"
    const userEmail = resume.candidateEmail || "email@example.com"
    const userPhone = resume.candidatePhone || ""
    const userWebsite = resume.candidateWebsite || ""
    const userLinkedIn = resume.candidateLinkedIn || ""
    const userGitHub = resume.candidateGitHub || ""
    const userLocation = resume.location || "Remote"

    // Name and title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    const headerText = `${userName} - ${resume.jobTitle}`
    const headerWidth = doc.getTextWidth(headerText)
    doc.text(headerText, (pageWidth - headerWidth) / 2, yPosition)
    yPosition += 25

    // Contact info
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    const contactText = `${userLocation} • ${userEmail} • ${formatPhoneNumber(userPhone)}`
    const contactWidth = doc.getTextWidth(contactText)
    doc.text(contactText, (pageWidth - contactWidth) / 2, yPosition)
    yPosition += 20

    // Links with proper hyperlinks - website on first line, social links on second line
    if (resume.candidateWebsite) {
      const websiteUrl = resume.candidateWebsite.startsWith("http")
        ? resume.candidateWebsite
        : `https://${resume.candidateWebsite}`

      // Center the website link
      const websiteText = "makeitnow"
      const websiteWidth = doc.getTextWidth(websiteText)
      const websiteX = (pageWidth - websiteWidth) / 2
      addHyperlink(websiteText, websiteUrl, websiteX, yPosition)
      yPosition += 20
    }

    // Social links on second line
    if (resume.candidateLinkedIn || resume.candidateGitHub) {
      let socialLinksText = ""
      const socialLinks = []

      if (resume.candidateLinkedIn) {
        socialLinks.push("LinkedIn")
        socialLinksText += "LinkedIn"
      }
      if (resume.candidateGitHub) {
        if (socialLinks.length > 0) socialLinksText += " | "
        socialLinks.push("GitHub")
        socialLinksText += "GitHub"
      }

      // Calculate center position for social links
      const socialLinksWidth = doc.getTextWidth(socialLinksText)
      let linkX = (pageWidth - socialLinksWidth) / 2

      if (resume.candidateLinkedIn) {
        const linkedInWidth = addHyperlink("LinkedIn", resume.candidateLinkedIn, linkX, yPosition)
        linkX += linkedInWidth
      }
      if (resume.candidateLinkedIn && resume.candidateGitHub) {
        doc.setTextColor(0, 0, 0) // Reset to black for separator
        doc.text(" | ", linkX, yPosition)
        linkX += doc.getTextWidth(" | ")
      }
      if (resume.candidateGitHub) {
        addHyperlink("GitHub", resume.candidateGitHub, linkX, yPosition)
      }
      yPosition += 35
    } else if (resume.candidateWebsite) {
      yPosition += 15
    }

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

    // EDUCATION - Use the education data from resume object
    checkForNewPage(120)
    addSectionHeader("EDUCATION")

    if (resume.candidateEducation && resume.candidateEducation.length > 0) {
      resume.candidateEducation.forEach((edu) => {
        // Use the actual education data
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text(`${edu.degree} in ${edu.field_of_study} - ${edu.graduation_year}`, margin, yPosition)
        yPosition += 20

        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        doc.text(`${edu.institution} - ${edu.location}`, margin, yPosition)
        yPosition += 20

        if (edu.gpa || edu.achievements) {
          const details = []
          if (edu.gpa) details.push(`GPA: ${edu.gpa}`)
          if (edu.achievements) details.push(edu.achievements)

          details.forEach((detail) => {
            const processedDetail = addTextWithProperSpacing(detail)
            const detailLines = doc.splitTextToSize(`• ${processedDetail}`, contentWidth - 15)
            doc.text(detailLines, margin + 15, yPosition)
            yPosition += detailLines.length * 15 + 5
          })
        }
        yPosition += 10
      })
    }

    // Save the PDF locally
    doc.save(`${resume.candidateName || "Resume"}.pdf`)

    // Get the PDF as blob/buffer for storage
    const pdfBuffer = doc.output("arraybuffer")

    // Store the PDF in Supabase if we have an application ID
    if (resume.applicationId) {
      try {
        const result = await storeResumeFile(resume.applicationId, "pdf", pdfBuffer)
        if (result.success) {
          console.log("Resume PDF stored successfully:", result.fileUrl)
        } else {
          console.error("Failed to store resume PDF:", result.error)
        }
      } catch (error) {
        console.error("Error storing resume PDF:", error)
      }
    }

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
    doc.text(coverLetter.candidateName || "Candidate Name", margin, yPosition)
    yPosition += 20

    // Contact info
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      `${coverLetter.location} • ${coverLetter.candidateEmail || "email@example.com"} • ${formatPhoneNumber(coverLetter.candidatePhone || "")}`,
      margin,
      yPosition,
    )
    yPosition += 15

    // Links with proper hyperlinks - website on first line, social links on second line
    if (coverLetter.candidateWebsite) {
      const websiteUrl = coverLetter.candidateWebsite.startsWith("http")
        ? coverLetter.candidateWebsite
        : `https://${coverLetter.candidateWebsite}`
      addHyperlink("makeitnow", websiteUrl, margin, yPosition)
      yPosition += 15
    }

    // Social links on second line
    if (coverLetter.candidateLinkedIn || coverLetter.candidateGitHub) {
      let linkX = margin
      if (coverLetter.candidateLinkedIn) {
        const linkedInWidth = addHyperlink("LinkedIn", coverLetter.candidateLinkedIn, linkX, yPosition)
        linkX += linkedInWidth
      }
      if (coverLetter.candidateLinkedIn && coverLetter.candidateGitHub) {
        doc.setTextColor(0, 0, 0) // Reset to black for separator
        doc.text(" | ", linkX, yPosition)
        linkX += doc.getTextWidth(" | ")
      }
      if (coverLetter.candidateGitHub) {
        addHyperlink("GitHub", coverLetter.candidateGitHub, linkX, yPosition)
      }
      yPosition += 15
    }

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
    doc.text(coverLetter.candidateName || "Candidate Name", margin, yPosition)

    // Save the PDF locally
    doc.save(`${coverLetter.candidateName || "Cover_Letter"}.pdf`)

    // Get the PDF as blob/buffer for storage
    const pdfBuffer = doc.output("arraybuffer")

    // Store the PDF in Supabase if we have an application ID
    if (coverLetter.applicationId) {
      try {
        const result = await storeCoverLetterFile(coverLetter.applicationId, "pdf", pdfBuffer)
        if (result.success) {
          console.log("Cover letter PDF stored successfully:", result.fileUrl)
        } else {
          console.error("Failed to store cover letter PDF:", result.error)
        }
      } catch (error) {
        console.error("Error storing cover letter PDF:", error)
      }
    }

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
                text: `${resume.candidateName || "Candidate Name"} - ${resume.jobTitle}`,
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
                    text: resume.candidateEmail || "email@example.com",
                    style: "Hyperlink",
                    size: 20,
                    font: "Arial",
                  }),
                ],
                link: `mailto:${resume.candidateEmail || "email@example.com"}`,
              }),
              new TextRun({
                text: " • ",
                size: 20, // 10pt
                font: "Arial",
              }),
              new TextRun({
                text: `${formatPhoneNumber(resume.candidatePhone || "")} • `,
                size: 20, // 10pt
                font: "Arial",
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "makeitnow",
                    style: "Hyperlink",
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                link: resume.candidateWebsite?.startsWith("http")
                  ? resume.candidateWebsite
                  : `https://${resume.candidateWebsite || "website.com"}`,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              ...(resume.candidateLinkedIn
                ? [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: "LinkedIn",
                          style: "Hyperlink",
                          size: 20, // 10pt
                          font: "Arial",
                        }),
                      ],
                      link: resume.candidateLinkedIn,
                    }),
                  ]
                : []),
              ...(resume.candidateLinkedIn && resume.candidateGitHub
                ? [new TextRun({ text: " | ", size: 20, font: "Arial" })]
                : []),
              ...(resume.candidateGitHub
                ? [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: "GitHub",
                          style: "Hyperlink",
                          size: 20, // 10pt
                          font: "Arial",
                        }),
                      ],
                      link: resume.candidateGitHub,
                    }),
                  ]
                : []),
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
          ...(resume.candidateEducation && resume.candidateEducation.length > 0
            ? resume.candidateEducation.flatMap((edu) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.degree} in ${edu.field_of_study} - ${edu.graduation_year}`,
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
                      text: `${edu.institution} - ${edu.location}`,
                      size: 22, // 11pt
                      font: "Arial",
                    }),
                  ],
                  spacing: { after: 100, line: 276, lineRule: "auto" },
                }),
                ...(edu.gpa
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `• GPA: ${edu.gpa}`,
                            size: 22, // 11pt
                            font: "Arial",
                          }),
                        ],
                        indent: { left: 360 },
                        spacing: { after: 100, line: 276, lineRule: "auto" },
                      }),
                    ]
                  : []),
                ...(edu.achievements
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `• ${edu.achievements}`,
                            size: 22, // 11pt
                            font: "Arial",
                          }),
                        ],
                        indent: { left: 360 },
                        spacing: { after: 100, line: 276, lineRule: "auto" },
                      }),
                    ]
                  : []),
              ])
            : [
                // Fallback education
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
              ]),
        ],
      },
    ],
  })

  const headerParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: `${resume.candidateName || "Candidate Name"} - ${resume.jobTitle}`,
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
              text: resume.candidateEmail || "email@example.com",
              style: "Hyperlink",
              size: 20,
              font: "Arial",
            }),
          ],
          link: `mailto:${resume.candidateEmail || "email@example.com"}`,
        }),
        new TextRun({
          text: " • ",
          size: 20, // 10pt
          font: "Arial",
        }),
        new TextRun({
          text: `${formatPhoneNumber(resume.candidatePhone || "")} • `,
          size: 20, // 10pt
          font: "Arial",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, line: 276, lineRule: "auto" },
    }),
  ]

  // Links with proper hyperlinks - website on first line, social links on second line
  if (resume.candidateWebsite) {
    const websiteUrl = resume.candidateWebsite.startsWith("http")
      ? resume.candidateWebsite
      : `https://${resume.candidateWebsite}`

    headerParagraphs.push(
      new Paragraph({
        children: [
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: "makeitnow",
                style: "Hyperlink",
                size: 20,
                font: "Arial",
              }),
            ],
            link: websiteUrl,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100, line: 276, lineRule: "auto" },
      }),
    )
  }

  // Social links on second line
  const socialLinks = []
  if (resume.candidateLinkedIn) {
    socialLinks.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: "LinkedIn",
            style: "Hyperlink",
            size: 20,
            font: "Arial",
          }),
        ],
        link: resume.candidateLinkedIn,
      }),
    )
  }
  if (resume.candidateLinkedIn && resume.candidateGitHub) {
    socialLinks.push(new TextRun({ text: " | ", size: 20, font: "Arial" }))
  }
  if (resume.candidateGitHub) {
    socialLinks.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: "GitHub",
            style: "Hyperlink",
            size: 20,
            font: "Arial",
          }),
        ],
        link: resume.candidateGitHub,
      }),
    )
  }

  if (socialLinks.length > 0) {
    headerParagraphs.push(
      new Paragraph({
        children: socialLinks,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400, line: 276, lineRule: "auto" },
      }),
    )
  }

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
          ...headerParagraphs,

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
          ...(resume.candidateEducation && resume.candidateEducation.length > 0
            ? resume.candidateEducation.flatMap((edu) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.degree} in ${edu.field_of_study} - ${edu.graduation_year}`,
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
                      text: `${edu.institution} - ${edu.location}`,
                      size: 22, // 11pt
                      font: "Arial",
                    }),
                  ],
                  spacing: { after: 100, line: 276, lineRule: "auto" },
                }),
                ...(edu.gpa
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `• GPA: ${edu.gpa}`,
                            size: 22, // 11pt
                            font: "Arial",
                          }),
                        ],
                        indent: { left: 360 },
                        spacing: { after: 100, line: 276, lineRule: "auto" },
                      }),
                    ]
                  : []),
                ...(edu.achievements
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `• ${edu.achievements}`,
                            size: 22, // 11pt
                            font: "Arial",
                          }),
                        ],
                        indent: { left: 360 },
                        spacing: { after: 100, line: 276, lineRule: "auto" },
                      }),
                    ]
                  : []),
              ])
            : [
                // Fallback education
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
              ]),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${resume.candidateName || "Resume"}.docx`)

  // Convert blob to ArrayBuffer for storage
  const fileBuffer = await blob.arrayBuffer()

  // Store the DOCX in Supabase if we have an application ID
  if (resume.applicationId) {
    try {
      const result = await storeResumeFile(resume.applicationId, "docx", fileBuffer)
      if (result.success) {
        console.log("Resume DOCX stored successfully:", result.fileUrl)
      } else {
        console.error("Failed to store resume DOCX:", result.error)
      }
    } catch (error) {
      console.error("Error storing resume DOCX:", error)
    }
  }

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
                text: coverLetter.candidateName || "Candidate Name",
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
                    text: coverLetter.candidateEmail || "email@example.com",
                    style: "Hyperlink",
                    size: 20,
                    font: "Arial",
                  }),
                ],
                link: `mailto:${coverLetter.candidateEmail || "email@example.com"}`,
              }),
              new TextRun({
                text: " • ",
                size: 20, // 10pt
                font: "Arial",
              }),
              new TextRun({
                text: `${formatPhoneNumber(coverLetter.candidatePhone || "")} • `,
                size: 20, // 10pt
                font: "Arial",
              }),
            ],
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              ...(coverLetter.candidateLinkedIn
                ? [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: "LinkedIn",
                          style: "Hyperlink",
                          size: 20, // 10pt
                          font: "Arial",
                        }),
                      ],
                      link: coverLetter.candidateLinkedIn,
                    }),
                  ]
                : []),
              ...(coverLetter.candidateLinkedIn && coverLetter.candidateGitHub
                ? [new TextRun({ text: " | ", size: 20, font: "Arial" })]
                : []),
              ...(coverLetter.candidateGitHub
                ? [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: "GitHub",
                          style: "Hyperlink",
                          size: 20, // 10pt
                          font: "Arial",
                        }),
                      ],
                      link: coverLetter.candidateGitHub,
                    }),
                  ]
                : []),
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
                text: coverLetter.candidateName || "Candidate Name",
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

  const sections = [
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.candidateName || "Candidate Name",
          bold: true,
          size: 28, // 14pt
          font: "Arial",
        }),
      ],
      spacing: { after: 50 },
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
              text: coverLetter.candidateEmail || "email@example.com",
              style: "Hyperlink",
              size: 20,
              font: "Arial",
            }),
          ],
          link: `mailto:${coverLetter.candidateEmail || "email@example.com"}`,
        }),
        new TextRun({
          text: " • ",
          size: 20, // 10pt
          font: "Arial",
        }),
        new TextRun({
          text: `${formatPhoneNumber(coverLetter.candidatePhone || "")} • `,
          size: 20, // 10pt
          font: "Arial",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${coverLetter.date}`,
          size: 20, // 10pt
          font: "Arial",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.recipient.name,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.recipient.company,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.recipient.location,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.greeting,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.body.hook,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.body.skills,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.body.closing,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Warm regards,",
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.candidateName || "Candidate Name",
          bold: true,
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
      spacing: { after: 50 },
    }),
  ]

  // Links with proper hyperlinks - website on first line, social links on second line
  if (coverLetter.candidateWebsite) {
    const websiteUrl = coverLetter.candidateWebsite.startsWith("http")
      ? coverLetter.candidateWebsite
      : `https://${coverLetter.candidateWebsite}`

    sections.push(
      new Paragraph({
        children: [
          new ExternalHyperlink({
            children: [new TextRun({ text: "makeitnow", style: "Hyperlink", size: 20, font: "Arial" })],
            link: websiteUrl,
          }),
        ],
        spacing: { after: 50 },
      }),
    )
  }

  // Social links on second line
  const socialLinks = []
  if (coverLetter.candidateLinkedIn) {
    const linkedInUrl = coverLetter.candidateLinkedIn.startsWith("http")
      ? coverLetter.candidateLinkedIn
      : `https://${coverLetter.candidateLinkedIn}`
    socialLinks.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: "LinkedIn", style: "Hyperlink", size: 20, font: "Arial" })],
        link: linkedInUrl,
      }),
    )
  }
  if (coverLetter.candidateLinkedIn && coverLetter.candidateGitHub) {
    socialLinks.push(new TextRun({ text: " | ", size: 20, font: "Arial" }))
  }
  if (coverLetter.candidateGitHub) {
    const githubUrl = coverLetter.candidateGitHub.startsWith("http")
      ? coverLetter.candidateGitHub
      : `https://${coverLetter.candidateGitHub}`
    socialLinks.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: "GitHub", style: "Hyperlink", size: 20, font: "Arial" })],
        link: githubUrl,
      }),
    )
  }

  if (socialLinks.length > 0) {
    sections.push(
      new Paragraph({
        children: socialLinks,
        spacing: { after: 50 },
      }),
    )
  }

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
        children: sections,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${coverLetter.candidateName || "Cover_Letter"}.docx`)

  // Convert blob to ArrayBuffer for storage
  const fileBuffer = await blob.arrayBuffer()

  // Store the DOCX in Supabase if we have an application ID
  if (coverLetter.applicationId) {
    try {
      const result = await storeCoverLetterFile(coverLetter.applicationId, "docx", fileBuffer)
      if (result.success) {
        console.log("Cover letter DOCX stored successfully:", result.fileUrl)
      } else {
        console.error("Failed to store cover letter DOCX:", result.error)
      }
    } catch (error) {
      console.error("Error storing cover letter DOCX:", error)
    }
  }

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

export function generateDocx(resumeContent: string, userProfile: any) {
  // Load the template file
  const templatePath = path.resolve(__dirname, "template.docx")
  const templateFile = fs.readFileSync(templatePath, "binary")

  const zip = new PizZip(templateFile)
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

  // Data to be inserted into the document
  const data = {
    resumeContent: resumeContent,
    // Header with dynamic user data
    name: {
      text: userProfile?.full_name || "Your Name",
      style: "name",
    },
    email: {
      text: userProfile?.email || "your.email@example.com",
      style: "contact",
    },
    phone: {
      text: userProfile?.phone || "Your Phone",
      style: "contact",
    },
    website: {
      text: userProfile?.website || "Your Website",
      style: "contact",
    },
    linkedin: {
      text: userProfile?.linkedin_url || "LinkedIn Profile",
      style: "contact",
    },
    github: {
      text: userProfile?.github_url || "GitHub Profile",
      style: "contact",
    },
    // Dynamic education section
    education: (userProfile?.education || []).map((edu) => ({
      text: `${edu.degree} in ${edu.field_of_study}`,
      style: "educationItem",
    })),
    // Dynamic experience section
    experience: (userProfile?.professional_experience || []).map((exp) => ({
      text: `${exp.job_title} at ${exp.company}`,
      style: "experienceItem",
    })),
  }

  // Render the document
  doc.render(data)

  // Generate the docx file
  const buffer = doc
    .getZip()
    .generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })

  // Save the file
  saveAs(buffer, "resume.docx")
}
