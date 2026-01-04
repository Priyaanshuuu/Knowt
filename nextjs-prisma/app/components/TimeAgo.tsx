"use client"

import { formatDistanceToNow } from "date-fns"

export function TimeAgo({ date }: { date: Date }) {
  return (
    <>{formatDistanceToNow(new Date(date), { addSuffix: true })}</>
  )
}