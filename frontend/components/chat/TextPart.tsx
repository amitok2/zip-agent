import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface TextPartProps {
  text: string
}

export default function TextPart({ text }: TextPartProps) {
  return (
    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}
