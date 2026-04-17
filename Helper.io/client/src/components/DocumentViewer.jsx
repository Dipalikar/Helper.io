import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState, useRef } from "react";
import { FileText, Loader2, Link as LinkIcon } from "lucide-react";
import mermaid from "mermaid";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "Inter, sans-serif",
});

const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute("data-processed");
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid flex justify-center p-8 bg-[#f8fafc] rounded-2xl my-12 border border-slate-200 shadow-inner overflow-x-auto" ref={ref}>
      {chart}
    </div>
  );
};

export default function DocumentViewer({ topic, file }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFile = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/notes-docs/${topic}/${file}`
        );
        setContent(data);
      } catch (err) {
        console.error(err);
        setContent("# Error fetching document\n\nCould not fetch the document. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (topic && file) {
      getFile();
    }
  }, [topic, file]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-slate-400 gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-[#032068]" />
        <p className="font-medium animate-pulse">Loading document...</p>
      </div>
    );
  }

  const displayTitle = file
    ? file
        .replace(/\.md$/i, '')
        .split(/[-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-8 md:p-16 mb-12 mx-auto max-w-6xl min-h-full hover:shadow-2xl">
      <div className="flex items-center gap-5 border-b border-slate-100 pb-8 mb-10 text-[#032068]">
        <div className="p-4 bg-gradient-to-br from-[#e7e8ff] to-[#f0f1ff] rounded-2xl shadow-sm">
          <FileText size={32} className="text-[#032068]" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight m-0 bg-clip-text text-transparent bg-gradient-to-r from-[#032068] to-[#0a36a3]">
            {displayTitle}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium flex items-center gap-2">
            <span className="capitalize">{topic}</span> Documentation • {file}
          </p>
        </div>
      </div>

      <div className="prose prose-slate prose-lg max-w-none 
        prose-p:my-6 prose-p:leading-relaxed text-slate-700
        prose-headings:text-[#032068] prose-headings:font-bold prose-headings:tracking-tight
        prose-h1:text-4xl prose-h1:mt-24 prose-h1:mb-10
        prose-h2:text-3xl prose-h2:mt-20 prose-h2:mb-8 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4
        prose-h3:text-2xl prose-h3:mt-16 prose-h3:mb-6
        prose-h4:text-xl prose-h4:mt-12 prose-h4:mb-4
        prose-a:text-[#f4ad5e] prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-[#e09b4d]
        prose-blockquote:border-l-4 prose-blockquote:border-l-[#032068] prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:my-10 prose-blockquote:text-slate-600 prose-blockquote:italic
        prose-strong:text-[#032068] prose-strong:font-bold
        prose-code:text-[#036819] prose-code:bg-[#ebf5ed] prose-code:px-2.5 prose-code:py-1 prose-code:rounded-lg prose-code:font-semibold prose-code:text-base
        prose-pre:bg-[#1e1e1e] prose-pre:text-slate-50 prose-pre:rounded-3xl prose-pre:shadow-2xl prose-pre:my-12 prose-pre:border prose-pre:border-slate-800
        prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-14 prose-img:border prose-img:border-slate-100
        prose-table:w-full prose-table:border-collapse prose-table:my-12 prose-table:rounded-2xl prose-table:overflow-hidden prose-table:shadow-sm
        prose-thead:bg-[#f1f5f9] prose-th:py-4 prose-th:px-6 prose-th:text-left prose-th:font-bold prose-th:text-[#032068]
        prose-td:py-4 prose-td:px-6 prose-td:border-b prose-td:border-slate-100
        prose-ul:my-8 prose-ol:my-8 prose-li:my-3 prose-li:leading-relaxed
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-[#032068] mt-24 mb-10 tracking-tight" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-[#032068] mt-20 mb-8 border-b border-slate-200 pb-4 tracking-tight" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-[#032068] mt-16 mb-6 tracking-tight" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-xl font-bold text-[#032068] mt-12 mb-4 tracking-tight" {...props} />,
            p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-slate-700 block" {...props} />,
            ul: ({node, ...props}) => <ul className="my-8 list-disc pl-8 space-y-3" {...props} />,
            ol: ({node, ...props}) => <ol className="my-8 list-decimal pl-8 space-y-3" {...props} />,
            li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#032068] bg-slate-50 py-4 px-8 rounded-r-2xl my-10 text-slate-600 italic" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-[#032068]" {...props} />,
            hr: ({node, ...props}) => <hr className="my-16 border-t-2 border-slate-200" {...props} />,
            br: ({node, ...props}) => <br className="block my-3 content-['']" {...props} />,
            table: ({node, ...props}) => <div className="overflow-x-auto my-12"><table className="w-full border-collapse rounded-2xl overflow-hidden shadow-sm border border-slate-200 text-left" {...props} /></div>,
            th: ({node, ...props}) => <th className="bg-[#f1f5f9] py-4 px-6 text-left font-bold text-[#032068]" {...props} />,
            td: ({node, ...props}) => <td className="py-4 px-6 border-b border-slate-100" {...props} />,
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : null;

              if (language === "mermaid") {
                return <Mermaid chart={String(children).replace(/\n$/, "")} />;
              }

              return !inline && language ? (
                <div className="relative group">
                   <div className="absolute right-4 top-4 text-xs font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    {language}
                  </div>
                  <SyntaxHighlighter
                    style={atomOneLight}
                    language={language}
                    PreTag="div"
                    className="!rounded-2xl !p-6"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            a({ node, children, href, ...props }) {
              return (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 group"
                  {...props}
                >
                  {children}
                  <LinkIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
