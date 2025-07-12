"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
  CodeBracketIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline"

const RichTextEditor = forwardRef(
  (
    {
      initialContent = "",
      onChange = () => {},
      placeholder = "Start writing...",
      height = "400px",
      theme = "snow",
      readOnly = false,
    },
    ref,
  ) => {
    const editorRef = useRef(null)
    const quillRef = useRef(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useImperativeHandle(ref, () => ({
      getContent: () => quillRef.current?.root.innerHTML || "",
      getPlainText: () => quillRef.current?.getText() || "",
      setContent: (content) => {
        if (quillRef.current) {
          quillRef.current.root.innerHTML = content
        }
      },
      clear: () => {
        if (quillRef.current) {
          quillRef.current.setText("")
        }
      },
      focus: () => {
        if (quillRef.current) {
          quillRef.current.focus()
        }
      },
      insertText: (text) => {
        if (quillRef.current) {
          const selection = quillRef.current.getSelection()
          quillRef.current.insertText(selection ? selection.index : 0, text)
        }
      },
    }))

    useEffect(() => {
      const loadQuill = async () => {
        if (typeof window !== "undefined" && !quillRef.current) {
          // Dynamically import Quill to avoid SSR issues
          const { default: Quill } = await import("quill")
          await import("quill/dist/quill.snow.css")

          // Custom toolbar configuration
          const toolbarOptions = [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
          ]

          const quill = new Quill(editorRef.current, {
            theme: theme,
            placeholder: placeholder,
            readOnly: readOnly,
            modules: {
              toolbar: toolbarOptions,
              history: {
                delay: 1000,
                maxStack: 50,
                userOnly: true,
              },
            },
          })

          // Set initial content
          if (initialContent) {
            quill.root.innerHTML = initialContent
          }

          // Handle content changes
          quill.on("text-change", () => {
            const content = quill.root.innerHTML
            onChange(content)
          })

          quillRef.current = quill
          setIsLoaded(true)
        }
      }

      loadQuill()
    }, [initialContent, onChange, placeholder, theme, readOnly])

    const handleExport = () => {
      if (quillRef.current) {
        const content = quillRef.current.root.innerHTML
        const blob = new Blob([content], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "document.html"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }

    const handleImport = (event) => {
      const file = event.target.files[0]
      if (file && quillRef.current) {
        const reader = new FileReader()
        reader.onload = (e) => {
          quillRef.current.root.innerHTML = e.target.result
        }
        reader.readAsText(file)
      }
    }

    const formatText = (format, value = true) => {
      if (quillRef.current) {
        const selection = quillRef.current.getSelection()
        if (selection) {
          quillRef.current.formatText(selection.index, selection.length, format, value)
        }
      }
    }

    const insertLink = () => {
      if (quillRef.current) {
        const url = prompt("Enter URL:")
        if (url) {
          const selection = quillRef.current.getSelection()
          if (selection) {
            quillRef.current.formatText(selection.index, selection.length, "link", url)
          }
        }
      }
    }

    const insertImage = () => {
      if (quillRef.current) {
        const url = prompt("Enter image URL:")
        if (url) {
          const selection = quillRef.current.getSelection()
          quillRef.current.insertEmbed(selection ? selection.index : 0, "image", url)
        }
      }
    }

    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 p-2 bg-gray-50">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => formatText("bold")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bold"
            >
              <BoldIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText("italic")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Italic"
            >
              <ItalicIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText("underline")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
              onClick={() => quillRef.current?.format("align", "")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Left"
            >
              <Bars3BottomLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => quillRef.current?.format("align", "center")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Center"
            >
              <Bars3Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => quillRef.current?.format("align", "right")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Right"
            >
              <Bars3BottomRightIcon className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
              onClick={() => quillRef.current?.format("list", "bullet")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bullet List"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => quillRef.current?.format("list", "ordered")}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Numbered List"
            >
              <NumberedListIcon className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
              onClick={insertLink}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              onClick={insertImage}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insert Image"
            >
              <PhotoIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => quillRef.current?.format("code-block", true)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Code Block"
            >
              <CodeBracketIcon className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
              onClick={() => quillRef.current?.history.undo()}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Undo"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => quillRef.current?.history.redo()}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Redo"
            >
              <ArrowUturnRightIcon className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button onClick={handleExport} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Export">
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            <label className="cursor-pointer">
              <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Import" type="button">
                <ArrowUpTrayIcon className="h-4 w-4" />
              </button>
              <input type="file" accept=".html,.txt" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        <div ref={editorRef} style={{ height }} className="prose max-w-none" />

        {!isLoaded && (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading editor...</div>
          </div>
        )}
      </div>
    )
  },
)

RichTextEditor.displayName = "RichTextEditor"

export default RichTextEditor
