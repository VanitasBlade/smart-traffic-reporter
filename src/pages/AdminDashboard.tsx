import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Brain, Calendar, Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReportDetailDialog from "@/components/ReportDetailDialog";

interface Report {
  id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  reported_at: string;
  prediction_label: string;
  confidence_score: number | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchReports();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("accident_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load reports");
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold">Dispatch Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Accident Reports</h2>
            <p className="text-muted-foreground text-sm">{reports.length} total reports</p>
          </div>
          <Button variant="outline" onClick={fetchReports}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No reports yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="glass-card-hover rounded-xl p-4 flex items-center gap-4 text-left w-full"
              >
                <img
                  src={report.image_url}
                  alt="Accident"
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      report.prediction_label === "Accident Detected"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-success/20 text-success"
                    }`}>
                      {report.prediction_label}
                    </span>
                    {report.confidence_score && (
                      <span className="text-xs text-muted-foreground">
                        {(report.confidence_score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.reported_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </main>

      <ReportDetailDialog
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};

export default AdminDashboard;
