import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";

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
        <p className="font-medium">Loading document...</p>
      </div>
    );
  }

  // Format 'beanstalk.md' -> 'Beanstalk'
  const displayTitle = file
    ? file
        .replace(/\.md$/i, '')
        .split(/[-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 md:p-12 mb-8 mx-auto max-w-6xl min-h-full">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8 text-[#032068]">
        <div className="p-3 bg-[#e7e8ff] rounded-xl">
          <FileText size={28} className="text-[#032068]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight m-0">{displayTitle}</h1>
      </div>
      <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#032068] prose-a:text-[#f4ad5e] prose-code:text-[#036819] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
