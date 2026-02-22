import Link from "next/link"
import { Construction } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ComingSoonProps {
  title?: string
  description?: string
  showBackButton?: boolean
}

export function ComingSoon({
  title = "Coming Soon",
  description = "We're working on something exciting. Check back later!",
  showBackButton = true,
}: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Construction className="size-10 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-8 text-muted-foreground">{description}</p>
        {showBackButton && (
          <Button asChild variant="outline">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
