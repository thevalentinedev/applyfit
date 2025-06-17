import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import jsPDF from "jspdf"
import { StorageHelper, generateFilePath } from "./storage-helper"
import { verifySession } from "./dal"

// Remove the file-saver import and use native browser download
const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface ResumeData {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  candidateWebsite?: string
  candidateLinkedIn?: string
  candidateGitHub?: string
  location: string
  jobTitle: string
  summary: string
  skills: Record<string, string | string[]>
  experience: Array<{
    title: string
    company?: string
    period: string
    bullets: string[]
  }>
  projects: Array<{
    title: string
    period: string
    bullets: string[]
  }>
  candidateEducation: Array<{
    degree: string
    field_of_study?: string
    institution: string
    location?: string
    graduation_year: string
    gpa?: string
    achievements?: string
  }>
  applicationId?: string
}

export async function exportResumeToDocx(
  resumeData: ResumeData,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("📄 Generating DOCX resume...")

    // Create the document
    const doc = new Document({
      sections: [
        {
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.candidateName} - ${resumeData.jobTitle}`,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
            }),

            // Contact Info
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.location} • ${resumeData.candidateEmail}${resumeData.candidatePhone ? ` • ${resumeData.candidatePhone}` : ""}`,
                  size: 22,
                }),
              ],
            }),

            // Professional Summary
            new Paragraph({
              children: [new TextRun({ text: "PROFESSIONAL SUMMARY", bold: true, size: 28 })],
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: resumeData.summary, size: 22 })],
              spacing: { after: 200 },
            }),

            // Technical Skills
            new Paragraph({
              children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 28 })],
              spacing: { before: 400, after: 200 },
            }),
            ...Object.entries(resumeData.skills).map(
              ([category, skills]) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `${category}: `, bold: true, size: 22 }),
                    new TextRun({ text: Array.isArray(skills) ? skills.join(", ") : skills, size: 22 }),
                  ],
                  spacing: { after: 100 },
                }),
            ),

            // Professional Experience
            new Paragraph({
              children: [new TextRun({ text: "PROFESSIONAL EXPERIENCE", bold: true, size: 28 })],
              spacing: { before: 400, after: 200 },
            }),
            ...resumeData.experience.flatMap((exp) => [
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title, bold: true, size: 22 }),
                  new TextRun({ text: ` - ${exp.period}`, size: 22 }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              ...exp.bullets.map(
                (bullet) =>
                  new Paragraph({
                    children: [new TextRun({ text: `• ${bullet}`, size: 22 })],
                    spacing: { after: 100 },
                  }),
              ),
            ]),

            // Education
            new Paragraph({
              children: [new TextRun({ text: "EDUCATION", bold: true, size: 28 })],
              spacing: { before: 400, after: 200 },
            }),
            ...resumeData.candidateEducation.map(
              (edu) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.degree}${edu.field_of_study ? ` in ${edu.field_of_study}` : ""} - ${edu.graduation_year}`,
                      bold: true,
                      size: 22,
                    }),
                    new TextRun({ text: `\n${edu.institution}${edu.location ? ` - ${edu.location}` : ""}`, size: 22 }),
                  ],
                  spacing: { after: 200 },
                }),
            ),
          ],
        },
      ],
    })

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc)

    // Save locally first
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
    downloadFile(blob, `${resumeData.candidateName.replace(/\s+/g, "_")}_Resume.docx`)

    // Upload to storage if applicationId is provided
    if (resumeData.applicationId) {
      const session = await verifySession()
      if (session.isAuth && session.user) {
        const storageHelper = new StorageHelper()
        const filePath = generateFilePath(session.user.id, resumeData.applicationId, "resume.docx")

        const uploadResult = await storageHelper.uploadFile(
          buffer,
          filePath,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

        if (uploadResult.success) {
          console.log("✅ Resume saved to storage:", uploadResult.url)
          return { success: true, url: uploadResult.url }
        } else {
          console.warn("⚠️ Storage upload failed, but local download succeeded")
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("❌ Error generating DOCX:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function exportResumeToPDF(
  resumeData: ResumeData,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("📄 Generating PDF resume...")

    const pdf = new jsPDF()
    let yPosition = 20

    // Header
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text(`${resumeData.candidateName} - ${resumeData.jobTitle}`, 20, yPosition)
    yPosition += 10

    // Contact Info
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "normal")
    pdf.text(
      `${resumeData.location} • ${resumeData.candidateEmail}${resumeData.candidatePhone ? ` • ${resumeData.candidatePhone}` : ""}`,
      20,
      yPosition,
    )
    yPosition += 15

    // Professional Summary
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("PROFESSIONAL SUMMARY", 20, yPosition)
    yPosition += 8

    pdf.setFontSize(11)
    pdf.setFont("helvetica", "normal")
    const summaryLines = pdf.splitTextToSize(resumeData.summary, 170)
    pdf.text(summaryLines, 20, yPosition)
    yPosition += summaryLines.length * 5 + 10

    // Technical Skills
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("TECHNICAL SKILLS", 20, yPosition)
    yPosition += 8

    pdf.setFontSize(11)
    pdf.setFont("helvetica", "normal")
    Object.entries(resumeData.skills).forEach(([category, skills]) => {
      const skillText = `${category}: ${Array.isArray(skills) ? skills.join(", ") : skills}`
      const skillLines = pdf.splitTextToSize(skillText, 170)
      pdf.text(skillLines, 20, yPosition)
      yPosition += skillLines.length * 5 + 3
    })
    yPosition += 5

    // Professional Experience
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("PROFESSIONAL EXPERIENCE", 20, yPosition)
    yPosition += 8

    resumeData.experience.forEach((exp) => {
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text(`${exp.title} - ${exp.period}`, 20, yPosition)
      yPosition += 6

      pdf.setFont("helvetica", "normal")
      exp.bullets.forEach((bullet) => {
        const bulletLines = pdf.splitTextToSize(`• ${bullet}`, 165)
        pdf.text(bulletLines, 25, yPosition)
        yPosition += bulletLines.length * 5 + 2
      })
      yPosition += 5
    })

    // Education
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("EDUCATION", 20, yPosition)
    yPosition += 8

    resumeData.candidateEducation.forEach((edu) => {
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text(
        `${edu.degree}${edu.field_of_study ? ` in ${edu.field_of_study}` : ""} - ${edu.graduation_year}`,
        20,
        yPosition,
      )
      yPosition += 6

      pdf.setFont("helvetica", "normal")
      pdf.text(`${edu.institution}${edu.location ? ` - ${edu.location}` : ""}`, 20, yPosition)
      yPosition += 8
    })

    // Generate PDF buffer
    const pdfBuffer = pdf.output("arraybuffer")

    // Save locally first
    const blob = new Blob([pdfBuffer], { type: "application/pdf" })
    downloadFile(blob, `${resumeData.candidateName.replace(/\s+/g, "_")}_Resume.pdf`)

    // Upload to storage if applicationId is provided
    if (resumeData.applicationId) {
      const session = await verifySession()
      if (session.isAuth && session.user) {
        const storageHelper = new StorageHelper()
        const filePath = generateFilePath(session.user.id, resumeData.applicationId, "resume.pdf")

        const uploadResult = await storageHelper.uploadFile(pdfBuffer, filePath, "application/pdf")

        if (uploadResult.success) {
          console.log("✅ Resume saved to storage:", uploadResult.url)
          return { success: true, url: uploadResult.url }
        } else {
          console.warn("⚠️ Storage upload failed, but local download succeeded")
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("❌ Error generating PDF:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
