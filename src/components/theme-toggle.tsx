
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  const handleThemeChange = (theme: string, e: React.MouseEvent<HTMLDivElement>) => {
    const event = e as MouseEvent & {
      __themeTransition?: boolean
    }
    if (event.__themeTransition) {
        return
    }
    event.preventDefault()
    event.stopPropagation()
    const x = e.clientX
    const y = e.clientY
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    )

    // @ts-ignore
    if (!document.startViewTransition) {
        setTheme(theme)
        return
    }

    // @ts-ignore
    const transition = document.startViewTransition(() => {
        setTheme(theme)
    })

    transition.ready.then(() => {
        const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
        ]
        document.documentElement.animate(
            {
                clipPath: clipPath,
            },
            {
                duration: 500,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        )
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => handleThemeChange("light", e)}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleThemeChange("dark", e)}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleThemeChange("system", e)}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
