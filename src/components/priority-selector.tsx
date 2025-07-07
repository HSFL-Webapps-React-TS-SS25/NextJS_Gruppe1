"use client"

import type React from "react"

import { Badge } from "./ui/shadcn/badge"
import { Button } from "./ui/shadcn/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/shadcn/dropdown-menu"
import { ChevronDown, AlertCircle, Circle, Minus, Zap } from "lucide-react"
import { FormattedMessage } from "react-intl"
import type { Priority } from "../hooks/ToDo/use-todo-enhancements"

interface PrioritySelectorProps {
    priority: Priority
    onPriorityChange: (priority: Priority) => void
}

const priorityConfig = {
    low: {
        labelKey: "priority.low",
        color: "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
        icon: Minus,
    },
    medium: {
        labelKey: "priority.medium",
        color: "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
        icon: Circle,
    },
    high: {
        labelKey: "priority.high",
        color: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
        icon: AlertCircle,
    },
    urgent: {
        labelKey: "priority.urgent",
        color: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
        icon: Zap,
    },
}

export default function PrioritySelector({ priority, onPriorityChange }: PrioritySelectorProps) {
    const currentPriority = priorityConfig[priority]
    const Icon = currentPriority.icon

    const handlePriorityChange = (newPriority: Priority, e: React.MouseEvent) => {
        e.stopPropagation() // Verhindert Drag-Ereignis
        onPriorityChange(newPriority)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2 bg-transparent"
                    onClick={(e) => e.stopPropagation()} // Verhindert Drag-Ereignis
                >
                    <Icon className="h-3 w-3 mr-1" />
                    <Badge className={`${currentPriority.color} text-white text-xs px-1`}>
                        <FormattedMessage id={currentPriority.labelKey} />
                    </Badge>
                    <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {Object.entries(priorityConfig).map(([key, config]) => {
                    const PriorityIcon = config.icon
                    return (
                        <DropdownMenuItem
                            key={key}
                            onClick={(e) => handlePriorityChange(key as Priority, e)}
                            className="flex items-center gap-2"
                        >
                            <PriorityIcon className="h-4 w-4" />
                            <Badge className={`${config.color} text-white`}>
                                <FormattedMessage id={config.labelKey} />
                            </Badge>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
