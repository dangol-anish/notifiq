'use client'

import { formatDistanceToNow } from 'date-fns'

interface Props {
  comment: any
}

export default function CommentItem({ comment }: Props) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
        {comment.author_name?.charAt(0).toUpperCase() || '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {comment.author_name}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {comment.body}
        </p>
      </div>
    </div>
  )
}