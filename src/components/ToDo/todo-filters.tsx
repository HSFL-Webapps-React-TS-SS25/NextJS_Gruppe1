"use client"

import { useState } from "react"
import { Input } from "../ui/shadcn/input"
import { Button } from "../ui/shadcn/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/shadcn/select"
import { Badge } from "../ui/shadcn/badge"
import { Search, X, Filter } from "lucide-react"
import { FormattedMessage } from "react-intl"
import { useTheme } from "next-themes"

export type FilterStatus = "all" | "completed" | "open"
export type SortOption = "newest" | "oldest" | "title" | "completed"

export interface TodoFilters {
    search: string
    status: FilterStatus
    sort: SortOption
}

interface TodoFiltersProps {
    filters: TodoFilters
    onFiltersChange: (filters: TodoFilters) => void
    totalCount: number
    filteredCount: number
}

export default function TodoFilters({ filters, onFiltersChange, totalCount, filteredCount }: TodoFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { resolvedTheme } = useTheme();

    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, search: value })
    }

    const handleStatusChange = (value: FilterStatus) => {
        onFiltersChange({ ...filters, status: value })
    }

    const handleSortChange = (value: SortOption) => {
        onFiltersChange({ ...filters, sort: value })
    }

    const clearFilters = () => {
        onFiltersChange({ search: "", status: "all", sort: "newest" })
    }

    const hasActiveFilters = filters.search !== "" || filters.status !== "all" || filters.sort !== "newest"

    return (
        <div className="space-y-4 mb-6">
            {/* Suchleiste - immer sichtbar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    type="text"
                    placeholder="Todos durchsuchen..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`pl-10 pr-4 ${resolvedTheme === "light" ? "text-white bg-gray-900" : ""} placeholder:text-gray-400`}
                />
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    <FormattedMessage id="todo.filter.results" />
                    {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1">
                            {filteredCount}
                        </Badge>
                    )}
                </Button>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                        <X className="h-4 w-4 mr-1" />
                        <FormattedMessage id="todo.filter.clear" />
                    </Button>
                )}
            </div>

            {/* Erweiterte Filter */}
            {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                        <Select value={filters.status} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    <FormattedMessage id="todo.filter.status.all" />
                                </SelectItem>
                                <SelectItem value="completed">
                                    <FormattedMessage id="todo.filter.status.completed" />
                                </SelectItem>
                                <SelectItem value="open">
                                    <FormattedMessage id="todo.filter.status.open" />
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Sortierung</label>
                        <Select value={filters.sort} onValueChange={handleSortChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">
                                    <FormattedMessage id="todo.filter.sort.newest" />
                                </SelectItem>
                                <SelectItem value="oldest">
                                    <FormattedMessage id="todo.filter.sort.oldest" />
                                </SelectItem>
                                <SelectItem value="title">
                                    <FormattedMessage id="todo.filter.sort.title" />
                                </SelectItem>
                                <SelectItem value="completed">
                                    <FormattedMessage id="todo.filter.sort.completed" />
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Ergebnis-Anzeige */}
            {filteredCount !== totalCount && (
                <div className="text-sm text-gray-600">
                    <FormattedMessage id="todo.filter.results" />: {filteredCount} von {totalCount}
                </div>
            )}
        </div>
    )
}
