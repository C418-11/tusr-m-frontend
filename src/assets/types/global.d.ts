export {}

declare global {
    declare function showNotification(message: string, type?: string, duration?: number | string): void
}