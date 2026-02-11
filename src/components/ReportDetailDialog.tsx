import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, Brain, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  reported_at: string;
  prediction_label: string;
  confidence_score: number | null;
}

interface Props {
  report: Report | null;
  onClose: () => void;
}

const DISPATCH_LAT = 16.52;
const DISPATCH_LNG = 80.62;

const ReportDetailDialog = ({ report, onClose }: Props) => {
  if (!report) return null;

  const mapsEmbedUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/${report.latitude},${report.longitude}/${DISPATCH_LAT},${DISPATCH_LNG}`;

  return (
    <Dialog open={!!report} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Report Details
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              report.prediction_label === "Accident Detected"
                ? "bg-destructive/20 text-destructive"
                : "bg-success/20 text-success"
            }`}>
              {report.prediction_label}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        <img
          src={report.image_url}
          alt="Accident scene"
          className="w-full rounded-lg max-h-80 object-cover"
        />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Brain className="w-3 h-3" /> Confidence
            </p>
            <p className="font-mono font-semibold">
              {report.confidence_score ? `${(report.confidence_score * 100).toFixed(1)}%` : "N/A"}
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Reported
            </p>
            <p className="font-mono text-sm">
              {new Date(report.reported_at).toLocaleString()}
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-3 col-span-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3" /> Coordinates
            </p>
            <p className="font-mono text-sm">
              {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </p>
          </div>
        </div>

        {/* Map Embed */}
        <div className="rounded-lg overflow-hidden border border-border">
          <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Accident Location"
          />
        </div>

        <Button asChild className="w-full">
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Get Directions to Dispatch Center
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailDialog;
