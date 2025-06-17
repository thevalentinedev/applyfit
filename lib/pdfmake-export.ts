import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

pdfMake.vfs = pdfFonts.pdfMake.vfs

export function generatePDF(resumeContent: string, userProfile: any) {
  // Define document content
  const documentDefinition = {
    content: [
      // Dynamic header section
      {
        columns: [
          {
            stack: [
              { text: userProfile?.full_name || "Your Name", style: "name" },
              {
                text: [
                  userProfile?.email || "your.email@example.com",
                  " | ",
                  userProfile?.phone || "Your Phone",
                  " | ",
                  userProfile?.website || "Your Website",
                ].join(""),
                style: "contact",
              },
              {
                text: [
                  userProfile?.linkedin_url || "LinkedIn Profile",
                  " | ",
                  userProfile?.github_url || "GitHub Profile",
                ].join(""),
                style: "contact",
              },
            ],
          },
          {
            image: userProfile?.profile_picture || "",
            width: 100,
            alignment: "right",
            fit: [100, 100],
          },
        ],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 5,
            x2: 515,
            y2: 5,
            lineWidth: 1,
          },
        ],
      },
      { text: "SUMMARY", style: "sectionHeader" },
      { text: userProfile?.summary || "Add your summary here.", style: "summary" },

      // Dynamic education section
      { text: "EDUCATION", style: "sectionHeader" },
      ...(userProfile?.education || []).map((edu) => ({
        text: `${edu.degree} in ${edu.field_of_study}\n${edu.institution} | ${edu.graduation_year}`,
        style: "educationItem",
      })),

      // Dynamic experience section
      { text: "EXPERIENCE", style: "sectionHeader" },
      ...(userProfile?.professional_experience || []).map((exp) => ({
        text: `${exp.job_title}\n${exp.company} | ${exp.start_date} - ${exp.end_date || "Present"}\n${exp.description}`,
        style: "experienceItem",
      })),

      { text: "SKILLS", style: "sectionHeader" },
      { text: userProfile?.skills || "Add your skills here.", style: "skills" },

      { text: "PROJECTS", style: "sectionHeader" },
      { text: userProfile?.projects || "Add your projects here.", style: "projects" },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 20],
      },
      name: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      contact: {
        fontSize: 10,
        margin: [0, 0, 0, 5],
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 10, 10],
        decoration: "underline",
      },
      summary: {
        fontSize: 12,
        margin: [0, 0, 15, 15],
      },
      educationItem: {
        fontSize: 12,
        margin: [0, 0, 15, 15],
      },
      experienceItem: {
        fontSize: 12,
        margin: [0, 0, 15, 15],
      },
      skills: {
        fontSize: 12,
        margin: [0, 0, 15, 15],
      },
      projects: {
        fontSize: 12,
        margin: [0, 0, 15, 15],
      },
    },
  }

  // Create and download the PDF
  const pdfDoc = pdfMake.createPdf(documentDefinition)
  pdfDoc.download("resume.pdf")
}
