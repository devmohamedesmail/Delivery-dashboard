"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"


function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const {t,i18n}=useTranslation()
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        ` gap-2 mb-2 text-sm leading-none font-medium block ${i18n.language==="ar"?"ml-2 text-right":"mr-2 text-left"} group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50`,
        className
      )}
      {...props}
    />
  )
}

export { Label }
