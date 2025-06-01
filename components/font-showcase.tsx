import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
} from "@/components/typography"

export function FontShowcase() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Font System</h2>
        <p className="text-muted-foreground">
          Applyfit uses a dual-font system with Inter for body text and Space Grotesk for headings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Heading Font: Space Grotesk</h3>
          <div className="space-y-2">
            <TypographyH1>Heading 1 - Space Grotesk</TypographyH1>
            <TypographyH2>Heading 2 - Space Grotesk</TypographyH2>
            <TypographyH3>Heading 3 - Space Grotesk</TypographyH3>
            <TypographyH4>Heading 4 - Space Grotesk</TypographyH4>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Body Font: Inter</h3>
          <div className="space-y-2">
            <TypographyP>
              This is a paragraph set in Inter. Inter is a variable font family designed for computer screens. It
              features a tall x-height to aid in readability of mixed-case and lower-case text.
            </TypographyP>
            <TypographyLead>This is a lead paragraph with slightly larger text.</TypographyLead>
            <TypographyLarge>This is large text in Inter.</TypographyLarge>
            <TypographySmall>This is small text in Inter.</TypographySmall>
            <TypographyMuted>This is muted text in Inter.</TypographyMuted>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Font Weights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-heading font-light">Space Grotesk Light (300)</p>
              <p className="font-heading font-normal">Space Grotesk Regular (400)</p>
              <p className="font-heading font-medium">Space Grotesk Medium (500)</p>
              <p className="font-heading font-semibold">Space Grotesk SemiBold (600)</p>
              <p className="font-heading font-bold">Space Grotesk Bold (700)</p>
            </div>
            <div>
              <p className="font-body font-light">Inter Light (300)</p>
              <p className="font-body font-normal">Inter Regular (400)</p>
              <p className="font-body font-medium">Inter Medium (500)</p>
              <p className="font-body font-semibold">Inter SemiBold (600)</p>
              <p className="font-body font-bold">Inter Bold (700)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
