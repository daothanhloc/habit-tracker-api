// Thrown by service-layer ownership checks (e.g. a goal/habit exists but
// belongs to a different user) - distinct from Prisma's P2025, which only
// fires when the row doesn't exist at all, not when it's just not owned
// by the requesting user.
export class NotFoundError extends Error {}
