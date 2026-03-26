import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { haversineKm } from "@/lib/haversine";
import { Button } from "@/components/ui/button";
import { Navigation, Radio, MapPin, Clock } from "lucide-react";

interface Mission {
  id: string;
  target_lat: number;
  target_lon: number;
  status: string;
  created_at: string;
}

interface Props {
  accidentId: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400" },
  in_progress: { label: "In Progress", className: "bg-primary/20 text-primary" },
  completed: { label: "Completed", className: "bg-green-500/20 text-green-400" },
};

const MissionPanel = ({ accidentId }: Props) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [vehicleLat, setVehicleLat] = useState<number | null>(null);
  const [vehicleLon, setVehicleLon] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMission();
  }, [accidentId]);

  // Subscribe to mission status changes
  useEffect(() => {
    if (!mission) return;
    const channel = supabase
      .channel(`mission-status-${mission.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "missions", filter: `id=eq.${mission.id}` },
        (payload) => {
          setMission((prev) => (prev ? { ...prev, ...payload.new } : prev));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mission?.id]);

  // Subscribe to ESP32 live location
  useEffect(() => {
    if (!mission) return;
    // Fetch latest location on mount
    fetchLatestLocation(mission.id);

    const channel = supabase
      .channel(`esp32-live-${mission.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "esp32_location", filter: `mission_id=eq.${mission.id}` },
        (payload) => {
          const p = payload.new as any;
          setVehicleLat(p.lat);
          setVehicleLon(p.lon);
          setLastUpdated(new Date(p.updated_at));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mission?.id]);

  // Relative time updater
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(i);
  }, []);

  const fetchMission = async () => {
    const { data } = await supabase
      .from("missions")
      .select("*")
      .eq("accident_id", accidentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) setMission(data as any);
    setLoading(false);
  };

  const fetchLatestLocation = async (missionId: string) => {
    const { data } = await supabase
      .from("esp32_location")
      .select("*")
      .eq("mission_id", missionId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setVehicleLat((data as any).lat);
      setVehicleLon((data as any).lon);
      setLastUpdated(new Date((data as any).updated_at));
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!mission) return;
    await supabase.from("missions").update({ status: newStatus }).eq("id", mission.id);
    setMission({ ...mission, status: newStatus });
  };

  const relativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  };

  if (loading) return null;
  if (!mission) return null;

  const distance =
    vehicleLat != null && vehicleLon != null
      ? haversineKm(vehicleLat, vehicleLon, mission.target_lat, mission.target_lon)
      : null;
  const arrived = distance != null && distance < 0.05;
  const sc = statusConfig[mission.status] || statusConfig.pending;

  return (
    <div className="mt-3 border-t border-border pt-3 space-y-3">
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Mission</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.className}`}>
            {sc.label}
          </span>
        </div>
        <div className="flex gap-2">
          {mission.status === "pending" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("in_progress")} className="text-xs h-7">
              Mark In Progress
            </Button>
          )}
          {mission.status === "in_progress" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("completed")} className="text-xs h-7">
              Mark Completed
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Target location */}
        <div className="rounded-lg p-3 bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive flex items-center gap-1 mb-1.5 font-medium">
            <MapPin className="w-3 h-3" /> Target Location
          </p>
          <p className="text-xs text-muted-foreground mb-0.5">Accident Location (ESP32 Navigating To)</p>
          <p className="font-mono text-sm">
            Lat: {mission.target_lat.toFixed(6)}
          </p>
          <p className="font-mono text-sm">
            Lon: {mission.target_lon.toFixed(6)}
          </p>
        </div>

        {/* Vehicle live location */}
        <div className="rounded-lg p-3 bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary flex items-center gap-1 mb-1.5 font-medium">
            <Radio className="w-3 h-3" /> Vehicle Live Location
          </p>
          <p className="text-xs text-muted-foreground mb-0.5">ESP32 Current Position</p>
          {vehicleLat != null && vehicleLon != null ? (
            <>
              <p className="font-mono text-sm">Lat: {vehicleLat.toFixed(6)}</p>
              <p className="font-mono text-sm">Lon: {vehicleLon.toFixed(6)}</p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last updated: {relativeTime(lastUpdated)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm italic text-muted-foreground">Waiting for vehicle GPS...</p>
          )}
        </div>
      </div>

      {/* Distance indicator */}
      {distance != null && (
        <div className={`text-center text-sm font-medium py-1.5 rounded-lg ${arrived ? "bg-green-500/10 text-green-400" : "bg-secondary"}`}>
          {arrived ? "✅ Vehicle has arrived" : `Distance to accident: ${distance.toFixed(2)} km`}
        </div>
      )}
    </div>
  );
};

export default MissionPanel;
