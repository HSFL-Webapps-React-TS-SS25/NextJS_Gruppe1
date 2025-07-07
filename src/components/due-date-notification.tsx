"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/shadcn/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/shadcn/card"
import { AlertCircle, X, Calendar, Clock } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"
import { format, isPast, isToday } from "date-fns"
import type { Todo } from "../app/actions/todo-actions"
import { useTodoEnhancements } from "../hooks/ToDo/use-todo-enhancements"

interface DueDateNotificationProps {
    todos: Todo[]
    onDismiss?: () => void // Neuer Callback
}

const SHOWN_NOTIFICATIONS_KEY = "shown-due-notifications"

export default function DueDateNotification({ todos, onDismiss }: DueDateNotificationProps) {
    const [showNotification, setShowNotification] = useState(false)
    const [dueTodos, setDueTodos] = useState<Todo[]>([])
    const [currentTime, setCurrentTime] = useState(new Date())
    const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set())
    const { getTodoEnhancement } = useTodoEnhancements()
    const intl = useIntl()

    // Lade bereits gezeigte Benachrichtigungen aus localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(SHOWN_NOTIFICATIONS_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)

                // Bereinige alte Einträge (älter als 7 Tage)
                const validEntries = parsed.filter((entry: { date?: string; notificationIds?: string[] }) => {
                    if (!entry.date) return false
                    const entryDate = new Date(entry.date)
                    const daysDiff = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
                    return daysDiff <= 7 // Behalte nur Einträge der letzten 7 Tage
                })

                // Erstelle Set aus allen gültigen Notification-IDs
                const allNotificationIds = new Set<string>()
                validEntries.forEach((entry: { notificationIds?: string[] }) => {
                    if (entry.notificationIds && Array.isArray(entry.notificationIds)) {
                        entry.notificationIds.forEach((id: string) => allNotificationIds.add(id))
                    }
                })

                setShownNotifications(allNotificationIds)
                console.log("📚 Loaded shown notifications:", allNotificationIds.size)
            }
        } catch (error) {
            console.error("Fehler beim Laden der gezeigten Benachrichtigungen:", error)
        }
    }, [])

    // Speichere gezeigte Benachrichtigungen in localStorage
    const saveShownNotifications = (newShownNotifications: Set<string>) => {
        try {
            const stored = localStorage.getItem(SHOWN_NOTIFICATIONS_KEY)
            let entries = []

            if (stored) {
                entries = JSON.parse(stored)
            }

            const today = new Date().toISOString()
            const todayString = new Date().toDateString()

            // Finde oder erstelle Eintrag für heute
            let todayEntry = entries.find(
                (entry: { date?: string; notificationIds?: string[] }) =>
                    entry.date && new Date(entry.date).toDateString() === todayString,
            )

            if (!todayEntry) {
                todayEntry = {
                    date: today,
                    notificationIds: [],
                }
                entries.push(todayEntry)
            }

            // Füge neue Notification-IDs hinzu
            const newIds = Array.from(newShownNotifications).filter((id) => !todayEntry.notificationIds.includes(id))
            todayEntry.notificationIds.push(...newIds)

            // Bereinige alte Einträge (älter als 7 Tage)
            entries = entries.filter((entry: { date?: string }) => {
                if (!entry.date) return false
                const entryDate = new Date(entry.date)
                const daysDiff = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
                return daysDiff <= 7
            })

            localStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(entries))
            setShownNotifications(newShownNotifications)
            console.log("💾 Saved shown notifications:", newShownNotifications.size)
        } catch (error) {
            console.error("Fehler beim Speichern der gezeigten Benachrichtigungen:", error)
        }
    }

    // Aktualisiere die Zeit jede Sekunde
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000) // Jede Sekunde!

        return () => clearInterval(interval)
    }, [])

    // Prüfe bei jeder Zeitänderung auf fällige Todos
    useEffect(() => {
        const now = new Date()
        const currentMinuteString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}:${now.getMinutes()}`

        console.log("🕐 Checking todos at:", now.toLocaleTimeString())

        // Finde alle fälligen Todos
        const foundDueTodos = todos.filter((todo) => {
            if (todo.completed) return false

            const enhancement = getTodoEnhancement(todo.id)
            if (!enhancement.dueDate) return false

            const dueDate = new Date(enhancement.dueDate)
            const dueMinuteString = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}-${dueDate.getHours()}:${dueDate.getMinutes()}`

            // Erstelle eine eindeutige ID für diese Benachrichtigung
            const notificationId = `${todo.id}-${dueMinuteString}`

            // Prüfe ob diese Benachrichtigung bereits gezeigt wurde
            if (shownNotifications.has(notificationId)) {
                return false
            }

            // Exakt jetzt fällig
            const isExactlyDue = dueMinuteString === currentMinuteString

            // Überfällig (aber nur einmal pro Tag zeigen)
            const isOverdue = isPast(dueDate)
            const overdueId = `${todo.id}-overdue-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
            const isOverdueAndNotShown = isOverdue && !shownNotifications.has(overdueId)

            // Heute fällig (für morgendliche Erinnerung)
            const isDueToday = isToday(dueDate) && now.getHours() === 9 && now.getMinutes() === 0
            const todayId = `${todo.id}-today-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
            const isDueTodayAndNotShown = isDueToday && !shownNotifications.has(todayId)

            if (isExactlyDue) {
                console.log("🚨 EXACT DUE:", todo.title, "at", dueDate.toLocaleTimeString())
            }
            if (isOverdueAndNotShown) {
                console.log("⚠️ OVERDUE:", todo.title, "was due at", dueDate.toLocaleTimeString())
            }

            return isExactlyDue || isOverdueAndNotShown || isDueTodayAndNotShown
        })

        if (foundDueTodos.length > 0 && !showNotification) {
            console.log(
                "📢 Showing notification for:",
                foundDueTodos.map((t) => t.title),
            )
            setDueTodos(foundDueTodos)
            setShowNotification(true)
        }
    }, [currentTime, todos, getTodoEnhancement, showNotification, shownNotifications])

    const handleDismiss = () => {
        console.log("✅ Notification dismissed")

        // Markiere alle aktuell gezeigten Todos als "bereits gezeigt"
        const newShownNotifications = new Set(shownNotifications)
        const now = new Date()

        dueTodos.forEach((todo) => {
            const enhancement = getTodoEnhancement(todo.id)
            if (!enhancement.dueDate) return

            const dueDate = new Date(enhancement.dueDate)
            const dueMinuteString = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}-${dueDate.getHours()}:${dueDate.getMinutes()}`

            // Exakte Zeit-Benachrichtigung
            const notificationId = `${todo.id}-${dueMinuteString}`
            newShownNotifications.add(notificationId)

            // Überfällige Benachrichtigung (einmal pro Tag)
            if (isPast(dueDate)) {
                const overdueId = `${todo.id}-overdue-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
                newShownNotifications.add(overdueId)
            }

            // Heute-fällig Benachrichtigung
            if (isToday(dueDate)) {
                const todayId = `${todo.id}-today-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
                newShownNotifications.add(todayId)
            }
        })

        // Speichere in localStorage
        saveShownNotifications(newShownNotifications)

        setShowNotification(false)
        setDueTodos([])

        // Rufe den Parent-Callback auf für sofortiges Update
        if (onDismiss) {
            onDismiss()
        }
    }

    if (!showNotification || dueTodos.length === 0) {
        return null
    }

    const now = new Date()
    const hasExactTimeTodos = dueTodos.some((todo) => {
        const enhancement = getTodoEnhancement(todo.id)
        if (!enhancement.dueDate) return false

        const dueDate = new Date(enhancement.dueDate)
        const timeDiff = Math.abs(now.getTime() - dueDate.getTime())
        return timeDiff < 60000 // Weniger als 1 Minute Unterschied
    })

    const hasOverdueTodos = dueTodos.some((todo) => {
        const enhancement = getTodoEnhancement(todo.id)
        if (!enhancement.dueDate) return false
        return isPast(new Date(enhancement.dueDate))
    })

    const isUrgentNotification = hasExactTimeTodos || hasOverdueTodos

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card
                className={`w-full max-w-md bg-white dark:bg-gray-900 ${
                    isUrgentNotification
                        ? "border-red-200 dark:border-red-800 animate-pulse"
                        : "border-orange-200 dark:border-orange-800"
                }`}
            >
                <CardHeader
                    className={`pb-3 ${
                        isUrgentNotification ? "bg-red-50 dark:bg-red-900/20" : "bg-orange-50 dark:bg-orange-900/20"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <CardTitle
                            className={`flex items-center gap-2 ${
                                isUrgentNotification ? "text-red-800 dark:text-red-200" : "text-orange-800 dark:text-orange-200"
                            }`}
                        >
                            <AlertCircle className="h-5 w-5" />
                            {hasExactTimeTodos ? (
                                <span>Jetzt fällig!</span>
                            ) : hasOverdueTodos ? (
                                <span>🚨 Überfällige Aufgaben!</span>
                            ) : (
                                <FormattedMessage id="notification.dueToday.title" />
                            )}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {hasExactTimeTodos ? (
                            <span>Die folgenden Aufgaben sind genau jetzt fällig:</span>
                        ) : hasOverdueTodos ? (
                            <span>Die folgenden Aufgaben sind überfällig:</span>
                        ) : (
                            <FormattedMessage id="notification.dueToday.message" values={{ count: dueTodos.length }} />
                        )}
                    </p>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dueTodos.map((todo) => {
                            const enhancement = getTodoEnhancement(todo.id)
                            const dueDate = enhancement.dueDate
                            const isOverdue = dueDate && isPast(new Date(dueDate))

                            return (
                                <div
                                    key={todo.id}
                                    className={`flex items-center gap-2 p-2 rounded-md ${
                                        isUrgentNotification
                                            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                            : "bg-gray-50 dark:bg-gray-800"
                                    }`}
                                >
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Calendar className={`h-4 w-4 ${isUrgentNotification ? "text-red-500" : "text-orange-500"}`} />
                                        {dueDate && (
                                            <Clock className={`h-3 w-3 ${isUrgentNotification ? "text-red-400" : "text-orange-400"}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium truncate block">{todo.title}</span>
                                        {dueDate && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                        Fällig: {format(new Date(dueDate), "dd.MM.yyyy HH:mm")}
                                                {isOverdue && ` (${intl.formatMessage({ id: "dueDate.overdue" })})`}
                      </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={handleDismiss}
                            className={`flex-1 ${
                                isUrgentNotification
                                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                    : "bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
                            }`}
                        >
                            <FormattedMessage id="notification.dueToday.understood" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
