import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, Upload, MapPin, Loader2, CheckCircle, XCircle, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ReportAccident = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    setGeoLoading(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
        toast.success("Location acquired");
      },
      () => {
        toast.error("Unable to access location. Please enable GPS.");
        setGeoLoading(false);
      }
    );
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  }, []);

  const handleSubmit = async () => {
    if (!image) return toast.error("Please upload an image first");
    if (!location) return toast.error("Location is required");

    setLoading(true);
    setResult(null);

    try {
      // Upload image to storage
      const fileName = `${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("accident-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("accident-images")
        .getPublicUrl(fileName);

      // Call AI analysis edge function
      const { data, error } = await supabase.functions.invoke("analyze-accident", {
        body: {
          imageUrl: urlData.publicUrl,
          latitude: location.lat,
          longitude: location.lng,
        },
      });

      if (error) throw error;

      setResult({
        label: data.prediction_label,
        confidence: data.confidence_score,
      });

      toast.success("Report submitted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <h1 className="text-xl font-bold">Report an Accident</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Image Upload */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Accident Image
          </h2>

          {preview ? (
            <div className="relative mb-4">
              <img src={preview} alt="Preview" className="w-full rounded-lg max-h-80 object-cover" />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => { setPreview(null); setImage(null); setResult(null); }}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-32 flex-col gap-2 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload Image</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-32 flex-col gap-2 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Take Photo</span>
              </Button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Location */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location Data
          </h2>

          {geoLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Acquiring location...
            </div>
          ) : location ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Latitude</p>
                <p className="font-mono text-sm">{location.lat.toFixed(6)}</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Longitude</p>
                <p className="font-mono text-sm">{location.lng.toFixed(6)}</p>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={fetchLocation}>
              <MapPin className="w-4 h-4 mr-2" /> Enable Location
            </Button>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !image || !location}
          className="w-full py-6 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Report Accident"
          )}
        </Button>

        {/* Result */}
        {result && (
          <div className={`mt-6 glass-card rounded-xl p-6 border-l-4 ${
            result.label === "Accident Detected" ? "border-l-destructive" : "border-l-success"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {result.label === "Accident Detected" ? (
                <XCircle className="w-8 h-8 text-destructive" />
              ) : (
                <CheckCircle className="w-8 h-8 text-success" />
              )}
              <div>
                <p className="text-xl font-bold">{result.label}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportAccident;
