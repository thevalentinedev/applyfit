"use client"

import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { DraftManager } from "./draft-manager"

// Set up fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs

export async function exportResumeToPDF(resume: GeneratedResume): Promise<void> {
  const docDefinition = {
    content: [
      // Header
      {
        text: `Valentine Ohalebo - ${resume.jobTitle}`,
        style: "header",
        alignment: "center" as const,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      {
        text: [
          { text: `${resume.location} • `, style: "contact" },
          { text: "hello@valentine.dev", style: "contactLink" },
          { text: " • ", style: "contact" },
          { text: "valentine.dev", style: "contactLink" },
        ],
        alignment: "center" as const,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
      {
        text: [
          { text: "LinkedIn", style: "contactLink" },
          { text: " | ", style: "contact" },
          { text: "GitHub", style: "contactLink" },
        ],
        alignment: "center" as const,
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // Professional Summary
      {
        text: "PROFESSIONAL SUMMARY",
        style: "sectionHeader",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#000000",
          },
        ],
        margin: [0, -5, 0, 10] as [number, number, number, number],
      },
      {
        text: resume.summary,
        style: "bodyText",
        margin: [0, 0, 0, 15] as [number, number, number, number],
      },

      // Technical Skills
      {
        text: "TECHNICAL SKILLS",
        style: "sectionHeader",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#000000",
          },
        ],
        margin: [0, -5, 0, 10] as [number, number, number, number],
      },
      ...Object.entries(resume.skills).map(([category, skills]) => ({
        text: [
          { text: `${category}: `, style: "skillCategory" },
          { text: skills.join(", "), style: "skillList" },
        ],
        margin: [0, 0, 0, 5] as [number, number, number, number],
      })),
      { text: "", margin: [0, 0, 0, 10] as [number, number, number, number] },

      // Professional Experience
      {
        text: "PROFESSIONAL EXPERIENCE",
        style: "sectionHeader",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#000000",
          },
        ],
        margin: [0, -5, 0, 10] as [number, number, number, number],
      },
      ...resume.experience.flatMap((exp) => [
        {
          columns: [
            { text: exp.title, style: "jobTitle", width: "*" },
            { text: exp.period, style: "jobPeriod", width: "auto", alignment: "right" as const },
          ],
          margin: [0, 0, 0, 5] as [number, number, number, number],
        },
        {
          ul: exp.bullets.map((bullet) => ({ text: bullet, style: "bulletPoint" })),
          margin: [20, 0, 0, 10] as [number, number, number, number],
        },
      ]),

      // Selected Projects
      {
        text: "SELECTED PROJECTS",
        style: "sectionHeader",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#000000",
          },
        ],
        margin: [0, -5, 0, 10] as [number, number, number, number],
      },
      ...resume.projects.flatMap((project) => [
        {
          columns: [
            { text: project.title, style: "jobTitle", width: "*" },
            { text: project.period, style: "jobPeriod", width: "auto", alignment: "right" as const },
          ],
          margin: [0, 0, 0, 5] as [number, number, number, number],
        },
        {
          ul: project.bullets.map((bullet) => ({ text: bullet, style: "bulletPoint" })),
          margin: [20, 0, 0, 10] as [number, number, number, number],
        },
      ]),

      // Education
      {
        text: "EDUCATION",
        style: "sectionHeader",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#000000",
          },
        ],
        margin: [0, -5, 0, 10] as [number, number, number, number],
      },
      {
        text: "Ontario College Diploma, Computer Programming - 2025",
        style: "jobTitle",
        margin: [0, 0, 0, 3] as [number, number, number, number],
      },
      {
        text: "Conestoga College - Waterloo, ON",
        style: "bodyText",
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
      {
        ul: [
          { text: "GPA: 3.92 (High Distinction)", style: "bulletPoint" },
          { text: "Courses: Web Development, OOP, UI/UX Design, Data Structures", style: "bulletPoint" },
          {
            text: "Awards: Best Final Year Project, Tech Showcase 2025, Best of Program, Capstone Project Award",
            style: "bulletPoint",
          },
        ],
        margin: [20, 0, 0, 0] as [number, number, number, number],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        font: "Helvetica",
      },
      contact: {
        fontSize: 10,
        font: "Helvetica",
      },
      contactLink: {
        fontSize: 10,
        font: "Helvetica",
        color: "#0066cc",
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        font: "Helvetica",
        margin: [0, 15, 0, 5] as [number, number, number, number],
      },
      bodyText: {
        fontSize: 11,
        font: "Helvetica",
        lineHeight: 1.15,
      },
      skillCategory: {
        fontSize: 11,
        bold: true,
        font: "Helvetica",
      },
      skillList: {
        fontSize: 11,
        font: "Helvetica",
      },
      jobTitle: {
        fontSize: 11,
        bold: true,
        font: "Helvetica",
      },
      jobPeriod: {
        fontSize: 11,
        font: "Helvetica",
      },
      bulletPoint: {
        fontSize: 11,
        font: "Helvetica",
        lineHeight: 1.15,
      },
    },
    pageSize: "LETTER",
    pageMargins: [54, 54, 54, 54], // 0.75 inches
    defaultStyle: {
      font: "Helvetica",
    },
  }

  try {
    const pdfDocGenerator = pdfMake.createPdf(docDefinition)
    pdfDocGenerator.download("Valentine_Ohalebo_Resume.pdf")

    // Clear resume draft after successful export
    DraftManager.clearResumeDraft()
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

export async function exportCoverLetterToPDF(coverLetter: GeneratedCoverLetter): Promise<void> {
  const docDefinition = {
    content: [
      // Header
      {
        text: "Valentine Ohalebo",
        style: "header",
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
      {
        text: [
          { text: `${coverLetter.location} • `, style: "contact" },
          { text: "hello@valentine.dev", style: "contactLink" },
          { text: " • ", style: "contact" },
          { text: "valentine.dev", style: "contactLink" },
        ],
        margin: [0, 0, 0, 3] as [number, number, number, number],
      },
      {
        text: [
          { text: "LinkedIn", style: "contactLink" },
          { text: " | ", style: "contact" },
          { text: "GitHub", style: "contactLink" },
        ],
        margin: [0, 0, 0, 3] as [number, number, number, number],
      },
      {
        text: `Date: ${coverLetter.date}`,
        style: "contact",
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // Recipient
      {
        text: coverLetter.recipient.name,
        style: "bodyText",
        margin: [0, 0, 0, 3] as [number, number, number, number],
      },
      {
        text: coverLetter.recipient.company,
        style: "bodyText",
        margin: [0, 0, 0, 3] as [number, number, number, number],
      },
      {
        text: coverLetter.recipient.location,
        style: "bodyText",
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // Greeting
      {
        text: coverLetter.greeting,
        style: "bodyText",
        margin: [0, 0, 0, 15] as [number, number, number, number],
      },

      // Body
      {
        text: coverLetter.body.hook,
        style: "bodyText",
        margin: [0, 0, 0, 15] as [number, number, number, number],
      },
      {
        text: coverLetter.body.skills,
        style: "bodyText",
        margin: [0, 0, 0, 15] as [number, number, number, number],
      },
      {
        text: coverLetter.body.closing,
        style: "bodyText",
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // Closing
      {
        text: "Warm regards,",
        style: "bodyText",
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      {
        text: "Valentine Ohalebo",
        style: "signature",
      },
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        font: "Helvetica",
      },
      contact: {
        fontSize: 10,
        font: "Helvetica",
      },
      contactLink: {
        fontSize: 10,
        font: "Helvetica",
        color: "#0066cc",
      },
      bodyText: {
        fontSize: 11,
        font: "Helvetica",
        lineHeight: 1.15,
      },
      signature: {
        fontSize: 11,
        bold: true,
        font: "Helvetica",
      },
    },
    pageSize: "LETTER",
    pageMargins: [54, 54, 54, 54], // 0.75 inches
    defaultStyle: {
      font: "Helvetica",
    },
  }

  try {
    const pdfDocGenerator = pdfMake.createPdf(docDefinition)
    pdfDocGenerator.download("Valentine_Ohalebo_Cover_Letter.pdf")

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
