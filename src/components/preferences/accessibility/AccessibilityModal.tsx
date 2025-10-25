// src/components/accessibility/AccessibilityModal.tsx - REPLACE ENTIRE FILE

import { useState, useEffect, useTransition, memo } from "react";
import Modal from "@/components/Modal";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { A11yPreferences } from "./types";
import Section from "./controls/Section";
import SliderControl from "./controls/SliderControl";
import ToggleControl from "./controls/ToggleControl";
import SelectControl from "./controls/SelectControl";
import ButtonGroupControl from "./controls/ButtonGroupControl";
import LanguageSwitcher from "../language/LanguageSwitcher";

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AccessibilityModal({ isOpen, onClose }: AccessibilityModalProps) {
  const { preferences, setPreferences, resetPreferences } = useAccessibility();
  const [isPending, startTransition] = useTransition();

  // Local state for editing (only save on "Save" click)
  const [localPrefs, setLocalPrefs] = useState<A11yPreferences>(preferences);

  // Sync local state when preferences change (cross-tab sync)
  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const updateText = (key: keyof A11yPreferences["text"], value: any) => {
    setLocalPrefs((prev) => ({
      ...prev,
      text: { ...prev.text, [key]: value },
    }));
  };

  const updateVisual = (key: keyof A11yPreferences["visual"], value: any) => {
    setLocalPrefs((prev) => ({
      ...prev,
      visual: { ...prev.visual, [key]: value },
    }));
  };

  const updateReading = (key: keyof A11yPreferences["reading"], value: any) => {
    setLocalPrefs((prev) => ({
      ...prev,
      reading: { ...prev.reading, [key]: value },
    }));
  };

  const updateContent = (key: keyof A11yPreferences["content"], value: any) => {
    setLocalPrefs((prev) => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    }));
  };

  const handleSave = () => {
    console.log("💾 Saving preferences");
    setPreferences({ ...localPrefs, timestamp: Date.now(), version: "1.0" });
    startTransition(() => {
      onClose();
    });
  };

  const handleReset = () => {
    console.log("🔄 Resetting preferences");
    resetPreferences();
    setLocalPrefs(preferences);
    startTransition(() => {
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeButton={true}
      className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      overlayClass="bg-black/50"
      ariaLabel="Reading preferences"
      ssr={false}
    >
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Reading Preferences</h2>
        <p className="text-sm text-gray-600">
          Customize how content appears on this site. These preferences are
          saved locally and sync across tabs.
        </p>
      </div>

      <Section title="Language">
        {/* Language Switcher - Client-side only */}
        <LanguageSwitcher />
      </Section>

      {/* TEXT & TYPOGRAPHY */}
      <Section title="Text & Typography">
        <SliderControl
          label="Font Size"
          description="Adjust the size of text throughout the site"
          value={localPrefs.text.fontSize}
          min={100}
          max={200}
          step={10}
          suffix="%"
          onChange={(value) => updateText("fontSize", value)}
        />

        <SliderControl
          label="Line Height"
          description="Spacing between lines of text"
          value={localPrefs.text.lineHeight}
          min={1.5}
          max={2.5}
          step={0.1}
          onChange={(value) => updateText("lineHeight", value)}
        />

        <SliderControl
          label="Letter Spacing"
          description="Space between individual letters"
          value={localPrefs.text.letterSpacing}
          min={0}
          max={0.3}
          step={0.05}
          suffix="em"
          onChange={(value) => updateText("letterSpacing", value)}
        />

        <SliderControl
          label="Word Spacing"
          description="Space between words"
          value={localPrefs.text.wordSpacing}
          min={0}
          max={0.5}
          step={0.1}
          suffix="em"
          onChange={(value) => updateText("wordSpacing", value)}
        />

        <SelectControl
          label="Font Family"
          description="Choose a font that's easier for you to read"
          value={localPrefs.text.fontFamily}
          options={[
            { value: "default", label: "Site Default" },
            { value: "dyslexia", label: "Dyslexia-Friendly (OpenDyslexic)" },
            { value: "readable", label: "High Readability (Verdana)" },
          ]}
          onChange={(value) => updateText("fontFamily", value as any)}
        />

        <ButtonGroupControl
          label="Font Weight"
          value={localPrefs.text.fontWeight}
          options={[
            { value: "normal", label: "Normal" },
            { value: "semibold", label: "Semibold" },
            { value: "bold", label: "Bold" },
          ]}
          onChange={(value) => updateText("fontWeight", value as any)}
        />

        <ButtonGroupControl
          label="Text Alignment"
          value={localPrefs.text.textAlign}
          options={[
            { value: "left", label: "Left" },
            { value: "justify", label: "Justify" },
          ]}
          onChange={(value) => updateText("textAlign", value as any)}
        />
      </Section>

      {/* VISUAL ENHANCEMENTS */}
      <Section title="Visual Enhancements">
        <ToggleControl
          label="Highlight Links"
          description="Add background color to all clickable links"
          checked={localPrefs.visual.linkHighlight}
          onChange={(checked) => updateVisual("linkHighlight", checked)}
        />

        <ToggleControl
          label="Highlight Headings"
          description="Emphasize page headings with background and border"
          checked={localPrefs.visual.titleHighlight}
          onChange={(checked) => updateVisual("titleHighlight", checked)}
        />

        <ToggleControl
          label="Boost Contrast"
          description="Slightly increase overall contrast (may make colors more vibrant)"
          checked={localPrefs.visual.contrastBoost}
          onChange={(checked) => updateVisual("contrastBoost", checked)}
        />

        <ButtonGroupControl
          label="Color Saturation"
          value={localPrefs.visual.saturation}
          options={[
            { value: "normal", label: "Normal" },
            { value: "low", label: "Low" },
            { value: "high", label: "High" },
            { value: "monochrome", label: "Grayscale" },
          ]}
          onChange={(value) => updateVisual("saturation", value as any)}
        />
      </Section>

      {/* READING AIDS */}
      <Section title="Reading Aids">
        <ToggleControl
          label="Reading Guide"
          description="Horizontal line that follows your cursor to help track lines"
          checked={localPrefs.reading.readingGuide}
          onChange={(checked) => updateReading("readingGuide", checked)}
        />

        <ToggleControl
          label="Reading Mask"
          description="Dim the page except for the area around your cursor"
          checked={localPrefs.reading.readingMask}
          onChange={(checked) => updateReading("readingMask", checked)}
        />

        <ToggleControl
          label="Focus Highlighting"
          description="Add strong outline to focused elements for easier keyboard navigation"
          checked={localPrefs.reading.focusHighlight}
          onChange={(checked) => updateReading("focusHighlight", checked)}
        />

        <ToggleControl
          label="Big Cursor"
          description="Increase cursor size for better visibility"
          checked={localPrefs.reading.bigCursor}
          onChange={(checked) => updateReading("bigCursor", checked)}
        />

        <ToggleControl
          label="Pause Animations"
          description="Stop all animations and auto-playing content"
          checked={localPrefs.reading.pauseAnimations}
          onChange={(checked) => updateReading("pauseAnimations", checked)}
        />
      </Section>

      {/* CONTENT SIMPLIFICATION */}
      <Section title="Content Simplification">
        <ToggleControl
          label="Hide Images"
          description="Replace images with their text descriptions"
          checked={localPrefs.content.hideImages}
          onChange={(checked) => updateContent("hideImages", checked)}
        />

        <ToggleControl
          label="Mute Sounds"
          description="Hide all audio and video elements"
          checked={localPrefs.content.muteSounds}
          onChange={(checked) => updateContent("muteSounds", checked)}
        />

        <ToggleControl
          label="Reduce Motion"
          description="Minimize all animations and transitions (recommended for vestibular disorders)"
          checked={localPrefs.content.reducedMotion}
          onChange={(checked) => updateContent("reducedMotion", checked)}
        />
      </Section>

      {/* DISCLAIMER */}
      <div className="text-xs text-gray-500 mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="font-semibold mb-2">📌 Important Information:</p>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>
            These preferences only change how content appears to you visually
          </li>
          <li>They don't affect the underlying accessibility of the site</li>
          <li>
            If you use screen readers or assistive technology, those will
            continue working normally
          </li>
          <li>
            Settings are saved in your browser and sync across tabs
            automatically
          </li>
          <li>
            For accessibility support, please{" "}
            <a
              href="/contact"
              className="underline text-blue-600 hover:text-blue-700"
            >
              contact us
            </a>
          </li>
        </ul>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleReset}
          disabled={isPending}
          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Reset All
        </button>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Save Preferences
        </button>
      </div>
    </Modal>
  );
}

export default memo(AccessibilityModal);
