import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { haversineKm } from "@/lib/haversine";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, History } from "lucide-react";

interface MissionRow {
  id: string;
  target_lat: number;
  target_lon: number;
  status: string;
  created_at: string;
  vehicle_lat: number | null;
  vehicle_lon: number | null;
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-400",
  in_progress: "text-primary",
  completed: "text-green-400",
};

const MissionHistory = () => {
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && missions.length === 0) fetchMissions();
  }, [open]);

  const fetchMissions = async () => {
    const { data } = await supabase
      .from("missions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    const withVehicle: MissionRow[] = await Promise.all(
      (data as any[]).map(async (m) => {
        const { data: loc } = await supabase
          .from("esp32_location")
          .select("*")
          .eq("mission_id", m.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();
        return {
          ...m,
          vehicle_lat: loc ? (loc as any).lat : null,
          vehicle_lon: loc ? (loc as any).lon : null,
        };
      })
    );
    setMissions(withVehicle);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-8">
      <CollapsibleTrigger className="flex items-center gap-2 w-full glass-card rounded-xl p-4 hover:bg-card/80 transition-colors">
        <History className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold">Past Missions</span>
        <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="glass-card rounded-xl mt-2 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Target Location</TableHead>
                <TableHead>Last Vehicle Position</TableHead>
                <TableHead>Final Distance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No missions yet
                  </TableCell>
                </TableRow>
              ) : (
                missions.map((m) => {
                  const dist =
                    m.vehicle_lat != null && m.vehicle_lon != null
                      ? haversineKm(m.vehicle_lat, m.vehicle_lon, m.target_lat, m.target_lon)
                      : null;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(m.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {m.target_lat.toFixed(6)}, {m.target_lon.toFixed(6)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {m.vehicle_lat != null
                          ? `${m.vehicle_lat.toFixed(6)}, ${m.vehicle_lon!.toFixed(6)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {dist != null ? `${dist.toFixed(2)} km` : "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium capitalize ${statusColors[m.status] || ""}`}>
                          {m.status?.replace("_", " ")}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MissionHistory;
