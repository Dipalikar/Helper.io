/**
 * documentTools.js
 *
 * Gemini FunctionDeclaration objects for the five document-management tools.
 * These are passed to the Gemini SDK as the `tools` array when running the
 * agentic loop, enabling the model to call server-side operations.
 */

export const documentToolDeclarations = [
  {
    name: "create_document",
    description:
      "Creates a new personal document (note) for the user. " +
      "Stores the content in Cloudflare R2 and saves the metadata " +
      "(title, file_key) in NeonDB. Use this when the user asks you to " +
      "write, create, draft, or save a new note or document.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: {
          type: "STRING",
          description:
            "A short, descriptive title for the document (e.g. 'AWS EC2 Basics').",
        },
        content: {
          type: "STRING",
          description:
            "The full markdown content of the document. " +
            "Write rich, well-structured markdown with headings, bullet points, " +
            "and code blocks where appropriate.",
        },
      },
      required: ["title", "content"],
    },
  },

  {
    name: "update_document",
    description:
      "Updates (overwrites) the content of an existing personal document. " +
      "Use this when the user asks to edit, update, rewrite, or add to an " +
      "existing document. You must know the document_id first — call " +
      "list_documents if you are unsure which document to update.",
    parameters: {
      type: "OBJECT",
      properties: {
        document_id: {
          type: "NUMBER",
          description:
            "The integer ID of the document to update, as returned by list_documents.",
        },
        new_content: {
          type: "STRING",
          description:
            "The complete new markdown content that will replace the current content.",
        },
        new_title: {
          type: "STRING",
          description:
            "Optional. A new title for the document. " +
            "Omit this field if the title should remain unchanged.",
        },
      },
      required: ["document_id", "new_content"],
    },
  },

  {
    name: "list_documents",
    description:
      "Returns a list of all personal documents belonging to the current user. " +
      "Each entry includes id, title, file_key, and created_at. " +
      "Use this to discover document IDs before updating or deleting one, " +
      "or when the user asks 'what notes do I have?' or similar.",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: [],
    },
  },

  {
    name: "get_document",
    description:
      "Fetches the full markdown content of a specific document. " +
      "Use this when the user asks to read, view, show, or summarize a " +
      "particular document. You need the document_id — call list_documents first if unknown.",
    parameters: {
      type: "OBJECT",
      properties: {
        document_id: {
          type: "NUMBER",
          description: "The integer ID of the document to fetch.",
        },
      },
      required: ["document_id"],
    },
  },

  {
    name: "delete_document",
    description:
      "Permanently deletes a personal document from both Cloudflare R2 and NeonDB. " +
      "This action is irreversible. Always confirm the document name with the user " +
      "before calling this tool. You need the document_id — call list_documents first if unknown.",
    parameters: {
      type: "OBJECT",
      properties: {
        document_id: {
          type: "NUMBER",
          description: "The integer ID of the document to delete.",
        },
      },
      required: ["document_id"],
    },
  },
];
