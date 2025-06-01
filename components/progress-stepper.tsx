import { cn } from "@/lib/utils"

interface ProgressStepperProps {
  steps: string[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index < currentStep
                  ? "bg-[#3B82F6] text-white"
                  : index === currentStep
                    ? "bg-[#3B82F6] text-white"
                    : "bg-gray-200 text-gray-500",
              )}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span
              className={cn(
                "text-xs mt-2 text-center",
                index <= currentStep ? "text-[#1E293B] font-medium" : "text-gray-500",
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        <div className="absolute top-0 h-1 bg-gray-200 w-full"></div>
        <div
          className="absolute top-0 h-1 bg-[#3B82F6] transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
