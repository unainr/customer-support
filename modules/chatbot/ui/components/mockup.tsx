"use client";

import { useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
} from "react-konva";
import Konva from "konva";
import { saveMockup, savePreview, uploadLogo } from "../../server/mockup";

// ─── Types ────────────────────────────────────────────────────────────────────
type ElementKind = "text" | "image";

type CanvasElement = {
  id: string;
  kind: ElementKind;
  x: number;
  y: number;
  // text
  text?: string;
  fontSize?: number;
  fill?: string;
  fontStyle?: string;
  // image
  src?: string;
  width?: number;
  height?: number;
};

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "iphone15",  label: "iPhone 15",   src: "/templates/iphone15.png"  },
  { id: "macbook",   label: "MacBook Pro",  src: "/templates/macbook.png"   },
  { id: "ipad",      label: "iPad",         src: "/templates/ipad.png"      },
  { id: "android",   label: "Android",      src: "/templates/android.png"   },
];

const CANVAS_W = 390;
const CANVAS_H = 780;

// ─── Hook: load any image URL → HTMLImageElement ───────────────────────────
function useHTMLImage(src: string | undefined) {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => setImage(img);
    img.onerror = () => setImage(undefined);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return image;
}

// ─── Template background ──────────────────────────────────────────────────────
function TemplateImage({ src }: { src: string }) {
  const image = useHTMLImage(src);
  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={CANVAS_W}
      height={CANVAS_H}
      listening={false}
    />
  );
}

// ─── Logo / uploaded image element ───────────────────────────────────────────
function LogoElement({
  el,
  isSelected,
  onSelect,
  onChange,
}: {
  el: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (el: CanvasElement) => void;
}) {
  const image = useHTMLImage(el.src);
  const imgRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // attach transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && imgRef.current) {
      trRef.current.nodes([imgRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imgRef}
        image={image}
        x={el.x}
        y={el.y}
        width={el.width ?? 120}
        height={el.height ?? 120}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) =>
          onChange({ ...el, x: e.target.x(), y: e.target.y() })
        }
        onTransformEnd={() => {
          const node = imgRef.current!;
          onChange({
            ...el,
            x: node.x(),
            y: node.y(),
            width: Math.round(node.width() * node.scaleX()),
            height: Math.round(node.height() * node.scaleY()),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 ? oldBox : newBox
          }
        />
      )}
    </>
  );
}

// ─── Text element ─────────────────────────────────────────────────────────────
function TextElement({
  el,
  isSelected,
  onSelect,
  onChange,
}: {
  el: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (el: CanvasElement) => void;
}) {
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaText
        ref={textRef}
        x={el.x}
        y={el.y}
        text={el.text ?? ""}
        fontSize={el.fontSize ?? 24}
        fill={el.fill ?? "#ffffff"}
        fontStyle={el.fontStyle ?? "normal"}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) =>
          onChange({ ...el, x: e.target.x(), y: e.target.y() })
        }
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 ? oldBox : newBox
          }
        />
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MockupCanvas({
  initialMockupId,
  initialTemplateId,
  initialElements,
}: {
  initialMockupId?: string;
  initialTemplateId?: string;
  initialElements?: CanvasElement[];
}) {
  const stageRef = useRef<Konva.Stage>(null);

  const [templateId, setTemplateId] = useState(
    initialTemplateId ?? TEMPLATES[0].id
  );
  const [elements, setElements] = useState<CanvasElement[]>(
    initialElements ?? []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mockupId, setMockupId] = useState<string | null>(
    initialMockupId ?? null
  );

  // toolbar
  const [textInput, setTextInput] = useState("Your text");
  const [fontSize, setFontSize] = useState(28);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [bold, setBold] = useState(false);

  // loading states
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const templateSrc =
    TEMPLATES.find((t) => t.id === templateId)?.src ?? TEMPLATES[0].src;

  // ── helpers ──────────────────────────────────────────────────────────────
  const updateElement = (updated: CanvasElement) =>
    setElements((prev) =>
      prev.map((el) => (el.id === updated.id ? updated : el))
    );

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  // ── add text ──────────────────────────────────────────────────────────────
  const addText = () => {
    if (!textInput.trim()) return;
    setElements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: "text",
        x: 60,
        y: 160,
        text: textInput,
        fontSize,
        fill: fontColor,
        fontStyle: bold ? "bold" : "normal",
      },
    ]);
  };

  // ── upload logo ───────────────────────────────────────────────────────────
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { url } = await uploadLogo(formData);

      setElements((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: "image",
          x: 100,
          y: 200,
          src: url,
          width: 120,
          height: 120,
        },
      ]);
    } catch (err) {
      console.error("Logo upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── save to DB ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const { mockupId: id } = await saveMockup(
        templateId,
        elements,
        mockupId ?? undefined
      );
      setMockupId(id);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── download PNG ──────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!stageRef.current) return;
    setDownloading(true);
    setSelectedId(null); // hide transformer

    // wait one frame for transformer to unmount
    await new Promise((r) => setTimeout(r, 60));

    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

      if (mockupId) await savePreview(mockupId, dataUrl);

      const a = document.createElement("a");
      a.download = "mockup.png";
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-72 flex flex-col gap-5 p-5 border-r border-zinc-800 overflow-y-auto shrink-0">
        <h1 className="text-base font-bold tracking-tight">
          🖼 Mockup Generator
        </h1>

        {/* Template picker */}
        <section className="flex flex-col gap-2">
          <p className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">
            Device
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`text-xs py-2 px-2 rounded-lg border transition-colors ${
                  templateId === t.id
                    ? "bg-white text-black border-white font-semibold"
                    : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* Text tool */}
        <section className="flex flex-col gap-2">
          <p className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">
            Text
          </p>
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text..."
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400 transition-colors"
          />
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={fontSize}
              min={10}
              max={120}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-sm w-20 outline-none"
            />
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-10 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
              title="Text color"
            />
            <button
              onClick={() => setBold((b) => !b)}
              className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
                bold
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300"
              }`}
            >
              B
            </button>
          </div>
          <button
            onClick={addText}
            className="bg-white text-black text-sm py-2 rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
          >
            + Add Text
          </button>
        </section>

        {/* Logo upload */}
        <section className="flex flex-col gap-2">
          <p className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">
            Logo / Image
          </p>
          <label
            className={`flex items-center justify-center gap-2 cursor-pointer bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-sm py-2 px-3 rounded-lg transition-colors ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {uploading ? "Uploading..." : "📁 Upload Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
        </section>

        {/* Delete selected */}
        {selectedId && (
          <section>
            <button
              onClick={deleteSelected}
              className="w-full bg-red-600 hover:bg-red-500 text-white text-sm py-2 rounded-lg transition-colors font-semibold"
            >
              🗑 Delete Selected
            </button>
          </section>
        )}

        {/* Save + Download */}
        <section className="mt-auto flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg font-semibold transition-colors"
          >
            {saving ? "Saving..." : "💾 Save"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg font-semibold transition-colors"
          >
            {downloading ? "Exporting..." : "⬇ Download PNG"}
          </button>
        </section>
      </aside>

      {/* ── Canvas ── */}
      <main className="flex-1 flex items-center justify-center bg-zinc-900">
        <Stage
          ref={stageRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-2xl overflow-hidden shadow-2xl"
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
          onTouchStart={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
        >
          <Layer>
            <TemplateImage src={templateSrc} />

            {elements.map((el) =>
              el.kind === "text" ? (
                <TextElement
                  key={el.id}
                  el={el}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={updateElement}
                />
              ) : (
                <LogoElement
                  key={el.id}
                  el={el}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={updateElement}
                />
              )
            )}
          </Layer>
        </Stage>
      </main>
    </div>
  );
}