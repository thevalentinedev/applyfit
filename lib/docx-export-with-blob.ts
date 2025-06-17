import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink } from "docx"
import jsPDF from "jspdf"
import { generateBlobFileName, uploadResumeToBlob, uploadCoverLetterToBlob } from "./client-blob-storage"

interface GeneratedResume {
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
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
  candidateWebsite?: string
  candidateLinkedIn?: string
  candidateGitHub?: string
  candidateEducation?: Array<{
    degree: string
    institution: string
    graduation_year: string
    location?: string
    gpa?: string
    field_of_study?: string
    achievements?: string
  }>
  location?: string
  applicationId?: string
}

interface GeneratedCoverLetter {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  candidateWebsite?: string
  candidateLinkedIn?: string
  candidateGitHub?: string
  location: string
  date: string
  recipient: {
    name: string
    company: string
    location: string
  }
  greeting: string
  body: {
    hook: string
    skills: string
    closing: string
  }
  applicationId?: string
}

// Helper function to format phone number
const formatPhoneNumber = (phone: string) => {
  if (!phone) return ""
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone
}

// Helper function to format URL
const formatUrl = (url: string) => {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}

// Helper function to split text into lines that fit within a given width
const splitTextToFit = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const textWidth = doc.getTextWidth(testLine)

    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export async function exportResumeToDocx(
  resume: GeneratedResume,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("🚀 Starting DOCX resume generation...")
    console.log("📋 Resume data:", {
      candidateName: resume.candidateName,
      jobTitle: resume.jobTitle,
      applicationId: resume.applicationId,
    })

    // Create header section
    const headerParagraphs = [
      new Paragraph({
        children: [
          new TextRun({
            text: `${resume.candidateName || "Candidate Name"} - ${resume.jobTitle}`,
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ]

    // Contact info
    const contactInfo = []
    if (resume.location) contactInfo.push(resume.location)
    if (resume.candidateEmail) contactInfo.push(resume.candidateEmail)
    if (resume.candidatePhone) contactInfo.push(formatPhoneNumber(resume.candidatePhone))

    if (contactInfo.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: contactInfo.join(" • "), size: 22 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
      )
    }

    // Links with proper hyperlinks - website on first line, social links on second line
    if (resume.candidateWebsite) {
      const websiteUrl = resume.candidateWebsite.startsWith("http")
        ? resume.candidateWebsite
        : `https://${resume.candidateWebsite}`

      headerParagraphs.push(
        new Paragraph({
          children: [
            new ExternalHyperlink({
              children: [new TextRun({ text: "makeitnow", style: "Hyperlink", size: 22 })],
              link: websiteUrl,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
      )
    }

    // Social links on second line
    const socialLinks = []
    if (resume.candidateLinkedIn) {
      const linkedInUrl = resume.candidateLinkedIn.startsWith("http")
        ? resume.candidateLinkedIn
        : `https://${resume.candidateLinkedIn}`
      socialLinks.push(
        new ExternalHyperlink({
          children: [new TextRun({ text: "LinkedIn", style: "Hyperlink", size: 22 })],
          link: linkedInUrl,
        }),
      )
    }
    if (resume.candidateLinkedIn && resume.candidateGitHub) {
      socialLinks.push(new TextRun({ text: " | ", size: 22 }))
    }
    if (resume.candidateGitHub) {
      const githubUrl = resume.candidateGitHub.startsWith("http")
        ? resume.candidateGitHub
        : `https://${resume.candidateGitHub}`
      socialLinks.push(
        new ExternalHyperlink({
          children: [new TextRun({ text: "GitHub", style: "Hyperlink", size: 22 })],
          link: githubUrl,
        }),
      )
    }

    if (socialLinks.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          children: socialLinks,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
      )
    }

    const sections = [...headerParagraphs]

    // Professional Summary
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "PROFESSIONAL SUMMARY", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: resume.summary, size: 22 })],
        spacing: { after: 200 },
      }),
    )

    // Technical Skills
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
    )

    Object.entries(resume.skills || {}).forEach(([category, skills]) => {
      const skillsText = Array.isArray(skills) ? skills.join(", ") : skills
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${category}: `, bold: true, size: 22 }),
            new TextRun({ text: skillsText, size: 22 }),
          ],
          spacing: { after: 100 },
        }),
      )
    })

    // Professional Experience
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "PROFESSIONAL EXPERIENCE", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
    )

    resume.experience?.forEach((exp) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22 }),
            new TextRun({ text: ` - ${exp.period}`, size: 22 }),
          ],
          spacing: { after: 100 },
        }),
      )

      exp.bullets?.forEach((bullet) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${bullet}`, size: 22 })],
            indent: { left: 360 },
            spacing: { after: 50 },
          }),
        )
      })
    })

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: "SELECTED PROJECTS", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      )

      resume.projects.forEach((project) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: project.title, bold: true, size: 22 }),
              new TextRun({ text: ` - ${project.period}`, size: 22 }),
            ],
            spacing: { after: 100 },
          }),
        )

        project.bullets?.forEach((bullet) => {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${bullet}`, size: 22 })],
              indent: { left: 360 },
              spacing: { after: 50 },
            }),
          )
        })
      })
    }

    // Education
    if (resume.candidateEducation && resume.candidateEducation.length > 0) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: "EDUCATION", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      )

      resume.candidateEducation.forEach((edu) => {
        const degreeText = `${edu.degree || "Degree"}${edu.field_of_study ? ` in ${edu.field_of_study}` : ""} - ${edu.graduation_year || "Year"}`
        const institutionText = `${edu.institution || "Institution"}${edu.location ? ` - ${edu.location}` : ""}`

        sections.push(
          new Paragraph({
            children: [new TextRun({ text: degreeText, bold: true, size: 22 })],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({ text: institutionText, size: 22 })],
            spacing: { after: edu.gpa || edu.achievements ? 50 : 100 },
          }),
        )

        if (edu.gpa) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 22 })],
              spacing: { after: 50 },
            }),
          )
        }

        if (edu.achievements) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: edu.achievements, size: 22 })],
              spacing: { after: 100 },
            }),
          )
        }
      })
    }

    // Create document
    console.log("📝 Creating DOCX document...")
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    })

    // Generate buffer
    console.log("🔄 Generating DOCX buffer...")
    const buffer = await Packer.toBuffer(doc)
    console.log(`✅ DOCX buffer generated successfully (${buffer.byteLength} bytes)`)

    // Upload to Vercel Blob if applicationId exists
    let blobUrl: string | undefined
    if (resume.applicationId) {
      console.log("☁️ Starting cloud upload process...")
      console.log("📁 Application ID:", resume.applicationId)

      const fileName = generateBlobFileName("user", resume.applicationId, "resume", "docx")

      const uploadResult = await uploadResumeToBlob(
        buffer,
        fileName,
        resume.applicationId,
        "docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      )

      if (uploadResult.success) {
        blobUrl = uploadResult.url
        console.log("🎉 Cloud upload successful!")
        console.log("🔗 Blob URL:", blobUrl)
      } else {
        console.error("❌ Cloud upload failed:", uploadResult.error)
      }
    } else {
      console.log("⚠️ No application ID provided - skipping cloud upload")
    }

    // Download locally
    console.log("💾 Starting local download...")
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${resume.candidateName || "Resume"}_${resume.jobTitle.replace(/\s+/g, "_")}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("✅ DOCX resume generated and downloaded successfully")
    console.log("📊 Final result:", { success: true, cloudUrl: blobUrl })

    return { success: true, url: blobUrl }
  } catch (error) {
    console.error("❌ Error generating DOCX resume:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function exportResumeToPDF(
  resume: GeneratedResume,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("🚀 Starting PDF resume generation...")
    console.log("📋 Resume data:", {
      candidateName: resume.candidateName,
      jobTitle: resume.jobTitle,
      applicationId: resume.applicationId,
    })

    // Create new PDF document
    console.log("📝 Creating PDF document with jsPDF...")
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 54 // 0.75 inch margins
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number, isBold = false, isCenter = false) => {
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", isBold ? "bold" : "normal")

      const lines = splitTextToFit(doc, text, contentWidth)

      for (const line of lines) {
        // Check if we need a new page
        if (yPosition + fontSize > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        const xPosition = isCenter ? pageWidth / 2 : margin
        const align = isCenter ? "center" : "left"

        doc.text(line, xPosition, yPosition, { align: align as any })
        yPosition += fontSize + 4
      }
    }

    // Add spacing
    const addSpacing = (space: number) => {
      yPosition += space
    }

    console.log("📄 Adding content to PDF...")

    // Header
    addText(`${resume.candidateName || "Candidate Name"} - ${resume.jobTitle}`, 16, true, true)
    addSpacing(5)

    // Contact info
    const contactInfo = []
    if (resume.location) contactInfo.push(resume.location)
    if (resume.candidateEmail) contactInfo.push(resume.candidateEmail)
    if (resume.candidatePhone) contactInfo.push(formatPhoneNumber(resume.candidatePhone))

    if (contactInfo.length > 0) {
      addText(contactInfo.join(" • "), 11, false, true)
    }

    // Links
    const links = []
    if (resume.candidateWebsite) links.push(formatUrl(resume.candidateWebsite))
    if (resume.candidateLinkedIn) links.push(formatUrl(resume.candidateLinkedIn))
    if (resume.candidateGitHub) links.push(formatUrl(resume.candidateGitHub))

    if (links.length > 0) {
      addText(links.join(" | "), 11, false, true)
    }

    addSpacing(20)

    // Professional Summary
    addText("PROFESSIONAL SUMMARY", 14, true)
    addSpacing(5)
    addText(resume.summary, 11)
    addSpacing(15)

    // Technical Skills
    addText("TECHNICAL SKILLS", 14, true)
    addSpacing(5)
    Object.entries(resume.skills || {}).forEach(([category, skills]) => {
      const skillsText = Array.isArray(skills) ? skills.join(", ") : skills
      addText(`${category}: ${skillsText}`, 11)
    })
    addSpacing(15)

    // Professional Experience
    addText("PROFESSIONAL EXPERIENCE", 14, true)
    addSpacing(5)
    resume.experience?.forEach((exp) => {
      addText(`${exp.title} - ${exp.period}`, 11, true)
      exp.bullets?.forEach((bullet) => {
        addText(`• ${bullet}`, 11)
      })
      addSpacing(10)
    })

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      addText("SELECTED PROJECTS", 14, true)
      addSpacing(5)
      resume.projects.forEach((project) => {
        addText(`${project.title} - ${project.period}`, 11, true)
        project.bullets?.forEach((bullet) => {
          addText(`• ${bullet}`, 11)
        })
        addSpacing(10)
      })
    }

    // Education
    if (resume.candidateEducation && resume.candidateEducation.length > 0) {
      addText("EDUCATION", 14, true)
      addSpacing(5)
      resume.candidateEducation.forEach((edu) => {
        const degreeText = `${edu.degree || "Degree"}${edu.field_of_study ? ` in ${edu.field_of_study}` : ""} - ${edu.graduation_year || "Year"}`
        const institutionText = `${edu.institution || "Institution"}${edu.location ? ` - ${edu.location}` : ""}`

        addText(degreeText, 11, true)
        addText(institutionText, 11)

        if (edu.gpa) {
          addText(`GPA: ${edu.gpa}`, 11)
        }
        if (edu.achievements) {
          addText(edu.achievements, 11)
        }
        addSpacing(10)
      })
    }

    // Generate PDF buffer
    console.log("🔄 Generating PDF buffer...")
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    console.log(`✅ PDF buffer generated successfully (${pdfBuffer.length} bytes)`)

    // Upload to Vercel Blob if applicationId exists
    let blobUrl: string | undefined
    if (resume.applicationId) {
      console.log("☁️ Starting cloud upload process...")
      console.log("📁 Application ID:", resume.applicationId)

      const fileName = generateBlobFileName("user", resume.applicationId, "resume", "pdf")

      const uploadResult = await uploadResumeToBlob(pdfBuffer, fileName, resume.applicationId, "pdf", "application/pdf")

      if (uploadResult.success) {
        blobUrl = uploadResult.url
        console.log("🎉 Cloud upload successful!")
        console.log("🔗 Blob URL:", blobUrl)
      } else {
        console.error("❌ Cloud upload failed:", uploadResult.error)
      }
    } else {
      console.log("⚠️ No application ID provided - skipping cloud upload")
    }

    // Download locally
    console.log("💾 Starting local download...")
    const blob = new Blob([pdfBuffer], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${resume.candidateName || "Resume"}_${resume.jobTitle.replace(/\s+/g, "_")}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("✅ PDF resume generated and downloaded successfully")
    console.log("📊 Final result:", { success: true, cloudUrl: blobUrl })

    return { success: true, url: blobUrl }
  } catch (error) {
    console.error("❌ Error generating PDF resume:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function exportCoverLetterToDocx(
  coverLetter: GeneratedCoverLetter,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("🚀 Starting DOCX cover letter generation...")
    console.log("📋 Cover letter data:", {
      candidateName: coverLetter.candidateName,
      company: coverLetter.recipient.company,
      applicationId: coverLetter.applicationId,
    })

    const sections = [
      // Header
      new Paragraph({
        children: [new TextRun({ text: coverLetter.candidateName, bold: true, size: 28 })],
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: coverLetter.candidateEmail, size: 22 })],
        spacing: { after: 50 },
      }),
    ]

    if (coverLetter.candidatePhone) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: formatPhoneNumber(coverLetter.candidatePhone), size: 22 })],
          spacing: { after: 50 },
        }),
      )
    }

    // Links with proper hyperlinks - website on first line, social links on second line
    if (coverLetter.candidateWebsite) {
      const websiteUrl = coverLetter.candidateWebsite.startsWith("http")
        ? coverLetter.candidateWebsite
        : `https://${coverLetter.candidateWebsite}`

      sections.push(
        new Paragraph({
          children: [
            new ExternalHyperlink({
              children: [new TextRun({ text: "makeitnow", style: "Hyperlink", size: 22 })],
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
          children: [new TextRun({ text: "LinkedIn", style: "Hyperlink", size: 22 })],
          link: linkedInUrl,
        }),
      )
    }
    if (coverLetter.candidateLinkedIn && coverLetter.candidateGitHub) {
      socialLinks.push(new TextRun({ text: " | ", size: 22 }))
    }
    if (coverLetter.candidateGitHub) {
      const githubUrl = coverLetter.candidateGitHub.startsWith("http")
        ? coverLetter.candidateGitHub
        : `https://${coverLetter.candidateGitHub}`
      socialLinks.push(
        new ExternalHyperlink({
          children: [new TextRun({ text: "GitHub", style: "Hyperlink", size: 22 })],
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

    if (coverLetter.location) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: coverLetter.location, size: 22 })],
          spacing: { after: 200 },
        }),
      )
    }

    // Date
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: coverLetter.date, size: 22 })],
        spacing: { after: 200 },
      }),
    )

    // Recipient
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: coverLetter.recipient.name, size: 22 })],
        spacing: { after: 50 },
      }),
      new Paragraph({
        children: [new TextRun({ text: coverLetter.recipient.company, size: 22 })],
        spacing: { after: 50 },
      }),
      new Paragraph({
        children: [new TextRun({ text: coverLetter.recipient.location, size: 22 })],
        spacing: { after: 200 },
      }),
    )

    // Greeting
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: coverLetter.greeting, size: 22 })],
        spacing: { after: 200 },
      }),
    )

    // Body
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: coverLetter.body.hook, size: 22 })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: coverLetter.body.skills, size: 22 })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: coverLetter.body.closing, size: 22 })],
        spacing: { after: 200 },
      }),
    )

    // Signature
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Best regards,", size: 22 })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: coverLetter.candidateName, bold: true, size: 22 })],
      }),
    )

    console.log("📝 Creating DOCX document...")
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    })

    console.log("🔄 Generating DOCX buffer...")
    const buffer = await Packer.toBuffer(doc)
    console.log(`✅ DOCX buffer generated successfully (${buffer.byteLength} bytes)`)

    // Upload to Vercel Blob if applicationId exists
    let blobUrl: string | undefined
    if (coverLetter.applicationId) {
      console.log("☁️ Starting cloud upload process...")
      console.log("📁 Application ID:", coverLetter.applicationId)

      const fileName = generateBlobFileName("user", coverLetter.applicationId, "cover-letter", "docx")

      const uploadResult = await uploadCoverLetterToBlob(
        buffer,
        fileName,
        coverLetter.applicationId,
        "docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      )

      if (uploadResult.success) {
        blobUrl = uploadResult.url
        console.log("🎉 Cloud upload successful!")
        console.log("🔗 Blob URL:", blobUrl)
      } else {
        console.error("❌ Cloud upload failed:", uploadResult.error)
      }
    } else {
      console.log("⚠️ No application ID provided - skipping cloud upload")
    }

    // Download locally
    console.log("💾 Starting local download...")
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${coverLetter.candidateName}_Cover_Letter.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("✅ DOCX cover letter generated and downloaded successfully")
    console.log("📊 Final result:", { success: true, cloudUrl: blobUrl })

    return { success: true, url: blobUrl }
  } catch (error) {
    console.error("❌ Error generating DOCX cover letter:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function exportCoverLetterToPDF(
  coverLetter: GeneratedCoverLetter,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("🚀 Starting PDF cover letter generation...")
    console.log("📋 Cover letter data:", {
      candidateName: coverLetter.candidateName,
      company: coverLetter.recipient.company,
      applicationId: coverLetter.applicationId,
    })

    // Create new PDF document
    console.log("📝 Creating PDF document with jsPDF...")
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 72 // 1 inch margins
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number, isBold = false, spacing = 15) => {
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", isBold ? "bold" : "normal")

      const lines = splitTextToFit(doc, text, contentWidth)

      for (const line of lines) {
        // Check if we need a new page
        if (yPosition + fontSize > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        doc.text(line, margin, yPosition)
        yPosition += fontSize + 4
      }

      yPosition += spacing
    }

    console.log("📄 Adding content to PDF...")

    // Header
    addText(coverLetter.candidateName, 14, true, 5)
    addText(coverLetter.candidateEmail, 11, false, 3)

    if (coverLetter.candidatePhone) {
      addText(formatPhoneNumber(coverLetter.candidatePhone), 11, false, 3)
    }

    if (coverLetter.candidateWebsite) {
      addText(formatUrl(coverLetter.candidateWebsite), 11, false, 3)
    }

    if (coverLetter.location) {
      addText(coverLetter.location, 11, false, 15)
    }

    // Date
    addText(coverLetter.date, 11, false, 15)

    // Recipient
    addText(coverLetter.recipient.name, 11, false, 3)
    addText(coverLetter.recipient.company, 11, false, 3)
    addText(coverLetter.recipient.location, 11, false, 15)

    // Greeting
    addText(coverLetter.greeting, 11, false, 15)

    // Body
    addText(coverLetter.body.hook, 11, false, 15)
    addText(coverLetter.body.skills, 11, false, 15)
    addText(coverLetter.body.closing, 11, false, 15)

    // Signature
    addText("Best regards,", 11, false, 10)
    addText(coverLetter.candidateName, 11, true, 0)

    // Generate PDF buffer
    console.log("🔄 Generating PDF buffer...")
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    console.log(`✅ PDF buffer generated successfully (${pdfBuffer.length} bytes)`)

    // Upload to Vercel Blob if applicationId exists
    let blobUrl: string | undefined
    if (coverLetter.applicationId) {
      console.log("☁️ Starting cloud upload process...")
      console.log("📁 Application ID:", coverLetter.applicationId)

      const fileName = generateBlobFileName("user", coverLetter.applicationId, "cover-letter", "pdf")

      const uploadResult = await uploadCoverLetterToBlob(
        pdfBuffer,
        fileName,
        coverLetter.applicationId,
        "pdf",
        "application/pdf",
      )

      if (uploadResult.success) {
        blobUrl = uploadResult.url
        console.log("🎉 Cloud upload successful!")
        console.log("🔗 Blob URL:", blobUrl)
      } else {
        console.error("❌ Cloud upload failed:", uploadResult.error)
      }
    } else {
      console.log("⚠️ No application ID provided - skipping cloud upload")
    }

    // Download locally
    console.log("💾 Starting local download...")
    const blob = new Blob([pdfBuffer], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${coverLetter.candidateName}_Cover_Letter.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("✅ PDF cover letter generated and downloaded successfully")
    console.log("📊 Final result:", { success: true, cloudUrl: blobUrl })

    return { success: true, url: blobUrl }
  } catch (error) {
    console.error("❌ Error generating PDF cover letter:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
