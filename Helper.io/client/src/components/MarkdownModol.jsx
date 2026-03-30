import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

export default function MarkdownModal({ topic, file, close }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    const getFile = async () => {
      try {
        console.log({ topic, file });
        const { data } = await axios.get(
          `http://localhost:5000/api/notes-docs/${topic}/${file}`,
        );
        console.log(`/api/notes-docs/${topic}/${file}`);
        setContent(data);
      } catch (err) {
        console.error(err);
      }
    };

    getFile();
  }, [topic, file]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={close}
    >
      <div
        className="bg-[#ebecfa] w-[75%] h-[80%] rounded-xl shadow-xl p-8 overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
