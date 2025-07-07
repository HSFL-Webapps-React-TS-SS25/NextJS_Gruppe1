"use client"

import { toast } from "sonner"

export function useToast() {
    return {
        toast: {
            success: (title: string, { description }: { description?: string } = {}) => {
                return toast.success(title, {
                    description,
                })
            },
            error: (title: string, { description }: { description?: string } = {}) => {
                return toast.error(title, {
                    description,
                })
            },
            // Einfache Methode für normale Toasts
            info: (title: string, { description }: { description?: string } = {}) => {
                return toast(title, {
                    description,
                })
            },
            // Adapter für die shadcn/ui-ähnliche API
            // Diese Methode nimmt ein Objekt mit title, description und variant entgegen
            // und ruft die entsprechende Sonner-Methode auf
            __call: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
                const { title = "", description, variant } = options

                if (variant === "destructive") {
                    return toast.error(title, { description })
                }

                return toast.success(title, { description })
            },
        },
    }
}
