"use client"

import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import * as fs from "fs"
import * as path from "path"
import saveAs from "file-saver"
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ExternalHyperlink } from "docx"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { DraftManager } from "./draft-manager"
import { storeResumeFile, storeCoverLetterFile } from "@/app/actions/store-resume-file"
import { uploadResumeToBlob, uploadCoverLetterToBlob } from "@/lib/client-blob-storage"

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
    const userName = resume.full_name || "Candidate Name"
    const userEmail = resume.email || "email@example.com"
    const userPhone = resume.phone || ""
    const userWebsite = resume.website || ""
    const userLinkedIn = resume.linkedin || ""
    const userGitHub = resume.github || ""
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
    if (resume.website) {
      const websiteUrl = resume.website.startsWith("http")
        ? resume.website
        : `https://${resume.website}`

      // Center the website link
      const websiteText = "makeitnow"
      const websiteWidth = doc.getTextWidth(websiteText)
      const websiteX = (pageWidth - websiteWidth) / 2
      addHyperlink(websiteText, websiteUrl, websiteX, yPosition)
      yPosition += 20
    }

    // Social links on second line
    if (resume.linkedin || resume.github) {
      let socialLinksText = ""
      const socialLinks = []

      if (resume.linkedin) {
        socialLinks.push("LinkedIn")
        socialLinksText += "LinkedIn"
      }
      if (resume.github) {
        if (socialLinks.length > 0) socialLinksText += " | "
        socialLinks.push("GitHub")
        socialLinksText += "GitHub"
      }

      // Calculate center position for social links
      const socialLinksWidth = doc.getTextWidth(socialLinksText)
      let linkX = (pageWidth - socialLinksWidth) / 2

      if (resume.linkedin) {
        const linkedInWidth = addHyperlink("LinkedIn", resume.linkedin, linkX, yPosition)
        linkX += linkedInWidth
      }
      if (resume.linkedin && resume.github) {
        doc.setTextColor(0, 0, 0) // Reset to black for separator
        doc.text(" | ", linkX, yPosition)
        linkX += doc.getTextWidth(" | ")
      }
      if (resume.github) {
        addHyperlink("GitHub", resume.github, linkX, yPosition)
      }
      yPosition += 35
    } else if (resume.website) {
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

    resume.experience.forEach((exp: any) => {
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
      exp.bullets.forEach((bullet: string) => {
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

    resume.projects.forEach((project: any) => {
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
      project.bullets.forEach((bullet: string) => {
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

    if (resume.education && resume.education.length > 0) {
      resume.education.forEach((edu: any) => {
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
    doc.save(`${resume.full_name || "Resume"}.pdf`)

    // Get the PDF as blob/buffer for storage
    const pdfBuffer = doc.output("arraybuffer")

    // Store the PDF in Supabase if we have an application ID
    if (resume.applicationId) {
      try {
        // Upload the PDF buffer to get a URL
        const uploadResult = await uploadResumeToBlob(
          new Uint8Array(pdfBuffer),
          `${resume.full_name || "Resume"}.pdf`,
          resume.applicationId,
          "pdf",
          "application/pdf"
        )
        
        if (uploadResult.success && uploadResult.url) {
          const result = await storeResumeFile(resume.applicationId, "pdf", uploadResult.url)
          if (result.success) {
            console.log("Resume PDF stored successfully:", result.fileUrl)
          } else {
            console.error("Failed to store resume PDF:", result.error)
          }
        } else {
          console.error("Failed to upload resume PDF:", uploadResult.error)
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
    doc.text(coverLetter.full_name || "Candidate Name", margin, yPosition)
    yPosition += 20

    // Contact info
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      `${coverLetter.location} • ${coverLetter.email || "email@example.com"} • ${formatPhoneNumber(coverLetter.phone || "")}`,
      margin,
      yPosition,
    )
    yPosition += 15

    // Links with proper hyperlinks - website on first line, social links on second line
    if (coverLetter.website) {
      const websiteUrl = coverLetter.website.startsWith("http")
        ? coverLetter.website
        : `https://${coverLetter.website}`
      addHyperlink("makeitnow", websiteUrl, margin, yPosition)
      yPosition += 15
    }

    // Social links on second line
    if (coverLetter.linkedin || coverLetter.github) {
      let linkX = margin
      if (coverLetter.linkedin) {
        const linkedInWidth = addHyperlink("LinkedIn", coverLetter.linkedin, linkX, yPosition)
        linkX += linkedInWidth
      }
      if (coverLetter.linkedin && coverLetter.github) {
        doc.setTextColor(0, 0, 0) // Reset to black for separator
        doc.text(" | ", linkX, yPosition)
        linkX += doc.getTextWidth(" | ")
      }
      if (coverLetter.github) {
        addHyperlink("GitHub", coverLetter.github, linkX, yPosition)
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
    doc.text(coverLetter.full_name || "Candidate Name", margin, yPosition)

    // Save the PDF locally
    doc.save(`${coverLetter.full_name || "Cover_Letter"}.pdf`)

    // Get the PDF as blob/buffer for storage
    const pdfBuffer = doc.output("arraybuffer")

    // Store the PDF in Supabase if we have an application ID
    if (coverLetter.applicationId) {
      try {
        // Upload the PDF buffer to get a URL
        const uploadResult = await uploadCoverLetterToBlob(
          new Uint8Array(pdfBuffer),
          `${coverLetter.full_name || "Cover_Letter"}.pdf`,
          coverLetter.applicationId,
          "pdf",
          "application/pdf"
        )
        
        if (uploadResult.success && uploadResult.url) {
          const result = await storeCoverLetterFile(coverLetter.applicationId, "pdf", uploadResult.url)
          if (result.success) {
            console.log("Cover letter PDF stored successfully:", result.fileUrl)
          } else {
            console.error("Failed to store cover letter PDF:", result.error)
          }
        } else {
          console.error("Failed to upload cover letter PDF:", uploadResult.error)
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
  const safeName = (resume.full_name || "Candidate Name").replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `${safeName}_Resume.docx`;
  const docxDoc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            color: "000000",
            size: 22, // 11pt default
          },
          paragraph: {
            spacing: { after: 100 },
          },
        },
      },
    },
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
                text: `${resume.full_name || "Candidate Name"} - ${resume.jobTitle}`,
                bold: true,
                size: 32, // 16pt
                font: "Calibri",
                color: "000000",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${resume.location} • `,
                size: 20, // 10pt
                font: "Calibri",
                color: "000000",
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: resume.email || "email@example.com",
                    style: "Hyperlink",
                    size: 20,
                    font: "Calibri",
                    color: "000000",
                  }),
                ],
                link: `mailto:${resume.email || "email@example.com"}`,
              }),
              new TextRun({
                text: " • ",
                size: 20, // 10pt
                font: "Calibri",
                color: "000000",
              }),
              new TextRun({
                text: `${formatPhoneNumber(resume.phone || "")} • `,
                size: 20, // 10pt
                font: "Calibri",
                color: "000000",
              }),
              ...(resume.website
                ? [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: "Website",
                          style: "Hyperlink",
                          size: 20, // 10pt
                          font: "Calibri",
                          color: "000000",
                        }),
                      ],
                      link: resume.website.startsWith("http")
                        ? resume.website
                        : `https://${resume.website}`,
                    }),
                  ]
                : []),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100, line: 276, lineRule: "auto" },
          }),
          new Paragraph({
            children: [
              ...(resume.linkedin
                ? [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: "LinkedIn",
                          style: "Hyperlink",
                          size: 20, // 10pt
                          font: "Calibri",
                          color: "000000",
                        }),
                      ],
                      link: resume.linkedin,
                    }),
                  ]
                : []),
              ...(resume.linkedin && resume.github
                ? [new TextRun({ text: " | ", size: 20, font: "Calibri", color: "000000" })]
                : []),
              ...(resume.github
                ? [
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: "GitHub",
                          style: "Hyperlink",
                          size: 20, // 10pt
                          font: "Calibri",
                          color: "000000",
                        }),
                      ],
                      link: resume.github,
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
                font: "Calibri",
                color: "000000",
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
                font: "Calibri",
                color: "000000",
              }),
            ],
            spacing: { after: 400, line: 276, lineRule: "auto" },
          }),

          // Technical Skills
          new Paragraph({
            children: [
              new TextRun({
                text: "SKILLS",
                bold: true,
                size: 28, // 14pt
                font: "Calibri",
                color: "000000",
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
                    font: "Calibri",
                    color: "000000",
                  }),
                  new TextRun({
                    text: skills.join(", "),
                    size: 22, // 11pt
                    font: "Calibri",
                    color: "000000",
                  }),
                ],
                spacing: { after: 100, line: 276, lineRule: "auto" },
              }),
          ),
          new Paragraph({
            text: "",
            spacing: { after: 300 },
          }),

          // Work Experience (ATS: use WORK EXPERIENCE)
          new Paragraph({
            children: [
              new TextRun({
                text: "WORK EXPERIENCE",
                bold: true,
                size: 28, // 14pt
                font: "Calibri",
                color: "000000",
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
          ...resume.experience.flatMap((exp: any) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 22, // 11pt
                  font: "Calibri",
                  color: "000000",
                }),
                new TextRun({
                  text: `\t${exp.period}`,
                  size: 22, // 11pt
                  font: "Calibri",
                  color: "000000",
                }),
              ],
              spacing: { after: 100, line: 276, lineRule: "auto" },
            }),
            ...exp.bullets.map(
              (bullet: string) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String.fromCharCode(8226) + " " + bullet, // Standard black circle bullet
                      size: 22, // 11pt
                      font: "Calibri",
                      color: "000000",
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
                text: "PROJECTS",
                bold: true,
                size: 28, // 14pt
                font: "Calibri",
                color: "000000",
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
          ...(resume.projects || []).flatMap((project: any) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: project.title,
                  bold: true,
                  size: 22, // 11pt
                  font: "Calibri",
                  color: "000000",
                }),
                new TextRun({
                  text: `\t${project.period}`,
                  size: 22, // 11pt
                  font: "Calibri",
                  color: "000000",
                }),
              ],
              spacing: { after: 100, line: 276, lineRule: "auto" },
            }),
            ...project.bullets.map(
              (bullet: string) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String.fromCharCode(8226) + " " + bullet, // Standard black circle bullet
                      size: 22, // 11pt
                      font: "Calibri",
                      color: "000000",
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
                font: "Calibri",
                color: "000000",
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
          ...(resume.education || []).map(
            (edu: any) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.degree} in ${edu.field_of_study}`,
                    bold: true,
                    size: 22, // 11pt
                    font: "Calibri",
                    color: "000000",
                  }),
                  new TextRun({
                    text: `\n${edu.institution} | ${edu.graduation_year}`,
                    size: 22, // 11pt
                    font: "Calibri",
                    color: "000000",
                  }),
                  ...(edu.gpa
                    ? [
                        new TextRun({
                          text: `\nGPA: ${edu.gpa}`,
                          size: 22, // 11pt
                          font: "Calibri",
                          color: "000000",
                        }),
                      ]
                    : []),
                ],
                spacing: { after: 200, line: 276, lineRule: "auto" },
              }),
          ),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(docxDoc)
  saveAs(blob, fileName)
}

export async function exportCoverLetterToDocx(coverLetter: GeneratedCoverLetter): Promise<void> {
  const sections = [
    // Header block
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.full_name || "Candidate Name",
          bold: true,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 50 },
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${coverLetter.email || "email@example.com"} | ${formatPhoneNumber(coverLetter.phone || "")} | ${coverLetter.linkedin || "LinkedIn"} | ${coverLetter.location}`,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.date,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    // Recipient block
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.recipient.name,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 10 },
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.recipient.company,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 10 },
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.recipient.location,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    // Greeting
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.greeting,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    // Hook
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.body.hook,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    // Skills
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.body.skills,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    // Culture fit
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.body.culture,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    // Assertive closing
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.body.closing,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 30 },
      alignment: AlignmentType.LEFT,
    }),
    // Signature
    new Paragraph({
      children: [
        new TextRun({
          text: "Sincerely,",
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 10 },
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: coverLetter.full_name || "Candidate Name",
          bold: true,
          size: 22, // 11pt
          font: "Calibri",
          color: "000000",
        }),
      ],
      spacing: { after: 10 },
      alignment: AlignmentType.LEFT,
    }),
  ]

  const docxDoc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            color: "000000",
            size: 22, // 11pt default
          },
          paragraph: {
            spacing: { after: 100 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440, // 1 inch
              bottom: 1440, // 1 inch
              left: 1440, // 1 inch
            },
          },
        },
        children: sections,
      },
    ],
  })

  const blob = await Packer.toBlob(docxDoc)
  saveAs(blob, `${coverLetter.full_name || "Cover_Letter"}.docx`)
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
    education: (userProfile?.education || []).map((edu: any) => ({
      text: `${edu.degree} in ${edu.field_of_study}`,
      style: "educationItem",
    })),
    // Dynamic experience section
    experience: (userProfile?.professional_experience || []).map((exp: any) => ({
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
