import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Shelf, ScannerDevice } from "@/api/api-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Play, Radio, Library } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function StartScanDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: shelves } = useQuery({
    queryKey: ["shelves"],
    queryFn: api.getShelves,
  });

  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
  });

  const startMutation = useMutation({
    mutationFn: () => 
      api.startSession(Number(selectedDevice), Number(selectedShelf)),
    onSuccess: (session) => {
      toast.success("Scan session started!");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setIsOpen(false);
      navigate(`/sessions/${session.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to start session. Ensure Device and Shelf are valid.");
    }
  });

  const handleStart = () => {
    if (!selectedShelf || !selectedDevice) {
      toast.error("Please select both a shelf and a device.");
      return;
    }
    startMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Play className="w-4 h-4 fill-current" />
          Start New Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Initialize Shelf Scan
          </DialogTitle>
          <DialogDescription>
            Select which shelf you are about to scan. Your ESP32 will automatically link its scans to this session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="shelf font-semibold">Target Shelf</Label>
            <Select onValueChange={setSelectedShelf}>
              <SelectTrigger id="shelf">
                <SelectValue placeholder="Which shelf?" />
              </SelectTrigger>
              <SelectContent>
                {shelves?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    <div className="flex items-center gap-2">
                      <Library className="w-3.5 h-3.5 opacity-50" />
                      <span>{s.code} ({s.section_name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="device font-semibold">Scanner Device</Label>
            <Select onValueChange={setSelectedDevice}>
              <SelectTrigger id="device">
                <SelectValue placeholder="Select scanner device" />
              </SelectTrigger>
              <SelectContent>
                {devices?.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    <span className="font-medium">{d.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">({d.device_id})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleStart} 
            disabled={startMutation.isPending}
            className="w-full"
          >
            {startMutation.isPending ? "Starting..." : "Begin Scan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
