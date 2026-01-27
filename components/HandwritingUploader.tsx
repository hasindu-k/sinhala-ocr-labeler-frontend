import { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  X,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/localStore";

interface HandwritingUploaderProps {
  onSubmit: (image: File) => void;
  completedSamples: number;
  totalSamples: number;
  promptText: string;
  isLoading?: boolean;
}

const HandwritingUploader = ({
  onSubmit,
  completedSamples,
  totalSamples,
  promptText,
  isLoading = false,
}: HandwritingUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const progressPercentage = (completedSamples / totalSamples) * 100;

  const token = getAccessToken();

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          setFeedback({
            type: "error",
            message: "කරුණාකර රූපයක් පමණක් උඩුගත කරන්න",
          });
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setFeedback({
            type: "error",
            message: "රූපය 10MB ට වඩා කුඩා විය යුතුය",
          });
          return;
        }

        setSelectedImage(file);
        setFeedback(null);

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      event.target.value = "";
    },
    [],
  );

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setFeedback(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      setFeedback({
        type: "error",
        message: "කරුණාකර පළමුව රූපයක් උඩුගත කරන්න",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const wordCount = promptText.trim().split(/\s+/).length;
      const tier = wordCount > 3 ? "tier-2" : "tier-1";

      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("tier", tier);
      formData.append("sentence", promptText);

      const res = await fetch(`${API_BASE_URL}/handwriting/submit`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();
      console.log("Backend response:", data);

      onSubmit(selectedImage);
      setFeedback({ type: "success", message: "සාර්ථකව උඩුගත කරන ලදී!" });
      setSelectedImage(null);
      setImagePreview(null);

      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "උඩුගත කිරීම අසාර්ථක විය",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedImage, promptText, onSubmit]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Progress Header */}
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-lg font-semibold font-sinhala">
                ප්‍රගතිය (Progress)
              </h2>
              <span className="text-sm font-medium">
                {completedSamples} / {totalSamples}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Writing Prompt */}
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              පහත පෙළ කඩදාසියක් මත ලියන්න:
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="font-sinhala text-sm text-muted-foreground">
                    Loading sentence...
                  </p>
                </div>
              ) : (
                <p className="font-sinhala text-2xl sm:text-3xl font-bold leading-relaxed tracking-wide text-foreground">
                  {promptText}
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs font-sinhala">
                කරුණාකර එක් පේළියක් ලෙස පැහැදිලිව ලියන්න.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <div
          className={`relative group border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center min-h-[300px]
            ${imagePreview ? "border-primary/50 bg-white dark:bg-slate-900" : "border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100"}`}
        >
          {imagePreview && (
            <>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 rounded-full shadow-lg z-20 h-8 w-8"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Image Display */}
              <div className="relative w-full p-2 h-full flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[280px] w-auto rounded-lg shadow-md object-contain"
                />
              </div>
            </>
          )}

          {!imagePreview && (
            <div className="text-center p-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-sinhala text-lg font-medium">
                  ඔබගේ අත්අකුරු රූපය උඩුගත කරන්න
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Camera or Gallery
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <Button
            variant="outline"
            className="h-12 gap-2 font-sinhala"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Camera className="h-5 w-5" /> ඡායාරූපය (Camera)
          </Button>
          <Button
            variant="outline"
            className="h-12 gap-2 font-sinhala"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Upload className="h-5 w-5" /> උඩුගත කරන්න (Upload)
          </Button>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Feedback & Submit */}
        <div className="space-y-4">
          {feedback && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2
              ${feedback.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
            >
              {feedback.type === "success" ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-sinhala font-medium">
                {feedback.message}
              </span>
            </div>
          )}

          <Button
            className="w-full h-14 text-lg font-sinhala gap-2 shadow-lg"
            disabled={!selectedImage || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Check className="h-5 w-5" />
            )}
            {isSubmitting ? "උඩුගත කරමින්..." : "ඉදිරිපත් කරන්න (Submit)"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground font-sinhala">
          ඔබගේ දායකත්වයට ස්තූතියි 🙏
        </p>
      </div>
    </div>
  );
};

export default HandwritingUploader;
