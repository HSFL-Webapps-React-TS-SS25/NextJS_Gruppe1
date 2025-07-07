"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "./ui/shadcn/button"
import { Calendar } from "./ui/shadcn/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/shadcn/popover"
import { Input } from "./ui/shadcn/input"
import { Label } from "./ui/shadcn/label"
import { CalendarIcon, Clock, AlertTriangle, Check } from "lucide-react"
import { format, isToday, isPast } from "date-fns"
import { de, enUS } from "date-fns/locale"
import { FormattedMessage } from "react-intl"
import { useLocale } from "../contexts/locale-context"

interface DueDatePickerProps {
    dueDate?: Date
    onDateChange: (date: Date | undefined) => void
}

export default function DueDatePicker({ dueDate, onDateChange }: DueDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(dueDate)
    const [hours, setHours] = useState("09")
    const [minutes, setMinutes] = useState("00")
    const { locale } = useLocale()

    const dateLocale = locale === "en" ? enUS : de
    const isOverdue = dueDate && isPast(dueDate)
    const isDueToday = dueDate && isToday(dueDate)

    // Initialisiere Zeit-Werte wenn dueDate sich ändert
    useEffect(() => {
        if (dueDate) {
            setHours(dueDate.getHours().toString().padStart(2, "0"))
            setMinutes(dueDate.getMinutes().toString().padStart(2, "0"))
            setSelectedDate(dueDate)
        } else {
            setHours("09")
            setMinutes("00")
            setSelectedDate(undefined)
        }
    }, [dueDate])

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)
        // Nicht automatisch schließen, damit Zeit eingestellt werden kann
    }

    const createDateTime = () => {
        if (selectedDate) {
            const newDateTime = new Date(selectedDate)
            const hourNum = Math.max(0, Math.min(23, Number.parseInt(hours) || 0))
            const minuteNum = Math.max(0, Math.min(59, Number.parseInt(minutes) || 0))
            newDateTime.setHours(hourNum, minuteNum, 0, 0)
            return newDateTime
        }
        return undefined
    }

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation() // Verhindert Drag-Ereignis
        const newDateTime = createDateTime()
        onDateChange(newDateTime)
        setIsOpen(false)
    }

    const handleHoursChange = (value: string) => {
        const cleanValue = value.replace(/\D/g, "").slice(0, 2)
        if (cleanValue === "") {
            setHours("")
            return
        }
        const numValue = Number.parseInt(cleanValue)
        if (numValue >= 0 && numValue <= 23) {
            setHours(cleanValue)
        }
    }

    const handleMinutesChange = (value: string) => {
        const cleanValue = value.replace(/\D/g, "").slice(0, 2)
        if (cleanValue === "") {
            setMinutes("")
            return
        }
        const numValue = Number.parseInt(cleanValue)
        if (numValue >= 0 && numValue <= 59) {
            setMinutes(cleanValue)
        }
    }

    const handleHoursBlur = () => {
        if (hours === "") {
            setHours("00")
        } else if (hours.length === 1) {
            setHours(hours.padStart(2, "0"))
        }
    }

    const handleMinutesBlur = () => {
        if (minutes === "") {
            setMinutes("00")
        } else if (minutes.length === 1) {
            setMinutes(minutes.padStart(2, "0"))
        }
    }

    const getButtonContent = () => {
        if (!dueDate) {
            return (
                <>
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <FormattedMessage id="dueDate.select" />
                </>
            )
        }

        const formattedDate = format(dueDate, "dd.MM", { locale: dateLocale })
        const formattedTime = format(dueDate, "HH:mm")

        if (isOverdue) {
            return (
                <>
                    <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                    <span className="text-xs">
            {formattedDate} {formattedTime}
          </span>
                </>
            )
        }

        if (isDueToday) {
            return (
                <>
                    <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                    <span className="text-xs">{formattedTime}</span>
                </>
            )
        }

        return (
            <>
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span className="text-xs">
          {formattedDate} {formattedTime}
        </span>
            </>
        )
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-xs px-2 ${
                        isOverdue
                            ? "border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : isDueToday
                                ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                : ""
                    }`}
                    onClick={(e) => e.stopPropagation()} // Verhindert Drag-Ereignis
                >
                    {getButtonContent()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="rounded-md border-0"
                    />

                    {selectedDate && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                            <Label className="text-sm font-medium">
                                <FormattedMessage id="dueDate.time" />
                            </Label>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="text"
                                        value={hours}
                                        onChange={(e) => handleHoursChange(e.target.value)}
                                        onBlur={handleHoursBlur}
                                        className="w-12 h-8 text-center text-sm"
                                        placeholder="09"
                                        maxLength={2}
                                    />
                                    <span className="text-sm font-medium">:</span>
                                    <Input
                                        type="text"
                                        value={minutes}
                                        onChange={(e) => handleMinutesChange(e.target.value)}
                                        onBlur={handleMinutesBlur}
                                        className="w-12 h-8 text-center text-sm"
                                        placeholder="00"
                                        maxLength={2}
                                    />
                                </div>
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <FormattedMessage id="dueDate.timeFormat" />
                            </div>

                            {/* Speichern Button */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={handleSave}
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                >
                                    <Check className="h-3 w-3 mr-1" />
                                    <FormattedMessage id="dueDate.save" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {dueDate && (
                    <div className="p-3 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation() // Verhindert Drag-Ereignis
                                onDateChange(undefined)
                                setSelectedDate(undefined)
                                setHours("09")
                                setMinutes("00")
                                setIsOpen(false)
                            }}
                            className="w-full"
                        >
                            <FormattedMessage id="dueDate.remove" />
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
