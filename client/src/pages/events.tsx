import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecurityEvent } from "@shared/schema";
import {
  Search,
  Download,
  Activity,
  ChevronRight,
  Globe,
  Server,
  Clock,
  Shield,
  Target,
  Network,
  FileText,
  AlertTriangle,
  User,
  MapPin,
  Cpu,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "destructive";
    case "High":
      return "destructive";
    case "Medium":
      return "secondary";
    case "Low":
      return "secondary";
    default:
      return "secondary";
  }
};

const getActionVariant = (action: string | null) => {
  if (!action) return "secondary";
  switch (action) {
    case "Block":
    case "Deny":
    case "Drop":
      return "destructive";
    case "Allow":
      return "secondary";
    case "Alert":
      return "secondary";
    default:
      return "secondary";
  }
};

interface EventDetailProps {
  event: SecurityEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EventDetailDialog({ event, open, onOpenChange }: EventDetailProps) {
  const metadata = event.metadata as Record<string, unknown> | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Event Details
            <Badge variant={getSeverityVariant(event.severity)} className="ml-2">
              {event.severity}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed security event information including network data, threat intelligence, and raw logs
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="network" data-testid="tab-network">Network</TabsTrigger>
            <TabsTrigger value="threat" data-testid="tab-threat">Threat Intel</TabsTrigger>
            <TabsTrigger value="raw" data-testid="tab-raw">Raw Log</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Event Type
                    </label>
                    <p className="text-sm font-medium mt-1">{event.eventType}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Timestamp
                    </label>
                    <p className="text-sm font-mono mt-1">
                      {format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss.SSS")}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Category
                    </label>
                    <p className="text-sm mt-1">{event.category || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </label>
                    <p className="text-sm mt-1">{event.status || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Action
                    </label>
                    <div className="mt-1">
                      <Badge variant={getActionVariant(event.action)}>
                        {event.action || "None"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      User
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{event.user || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Rule
                    </label>
                    <p className="text-sm mt-1">
                      {event.ruleName || "N/A"} {event.ruleId && <span className="text-xs text-muted-foreground">({event.ruleId})</span>}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </label>
                <p className="text-sm mt-1">{event.description}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Details
                </label>
                <p className="text-sm mt-1">{event.details || "No additional details"}</p>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Source</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">IP Address</span>
                      <span className="text-sm font-mono">{event.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Port</span>
                      <span className="text-sm font-mono">{(metadata?.sourcePort as number) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Country</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{(metadata?.sourceCountry as string) || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">City</span>
                      <span className="text-sm">{(metadata?.sourceCity as string) || "Unknown"}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Destination</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">IP Address</span>
                      <span className="text-sm font-mono">{event.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Port</span>
                      <span className="text-sm font-mono">{(metadata?.destinationPort as number) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Country</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{(metadata?.destinationCountry as string) || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">City</span>
                      <span className="text-sm">{(metadata?.destinationCity as string) || "Unknown"}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Connection Details</h4>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Protocol</span>
                    <Badge variant="outline" className="mt-1">{(metadata?.protocol as string) || "N/A"}</Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Duration</span>
                    <span className="text-sm">{(metadata?.duration as number) ? `${metadata.duration}s` : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Bytes In</span>
                    <span className="text-sm font-mono">{(metadata?.bytesIn as number)?.toLocaleString() || "0"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Bytes Out</span>
                    <span className="text-sm font-mono">{(metadata?.bytesOut as number)?.toLocaleString() || "0"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Packets In</span>
                    <span className="text-sm font-mono">{(metadata?.packetsIn as number)?.toLocaleString() || "0"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Packets Out</span>
                    <span className="text-sm font-mono">{(metadata?.packetsOut as number)?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Device Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Hostname</span>
                    <span className="text-sm font-mono">{(metadata?.hostName as string) || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Operating System</span>
                    <span className="text-sm">{(metadata?.hostOs as string) || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Vendor</span>
                    <span className="text-sm">{(metadata?.deviceVendor as string) || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Product</span>
                    <span className="text-sm">{(metadata?.deviceProduct as string) || "N/A"}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="threat" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <h4 className="font-medium">Threat Assessment</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground block">Threat Score</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (metadata?.threatScore as number) >= 70
                                ? "bg-destructive"
                                : (metadata?.threatScore as number) >= 40
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${(metadata?.threatScore as number) || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{(metadata?.threatScore as number) || 0}/100</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Threat Category</span>
                      <Badge variant="outline" className="mt-1">{(metadata?.threatCategory as string) || "Unknown"}</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">MITRE ATT&CK</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground block">Tactic</span>
                      <span className="text-sm mt-1 block">{event.tactic || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Technique</span>
                      <Badge variant="secondary" className="mt-1">
                        {event.technique || (metadata?.mitreTechnique as string) || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {metadata?.tags && Array.isArray(metadata.tags) && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(metadata.tags as string[]).map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </Card>
              )}

              {metadata?.authMethod && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Authentication Details</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">Method</span>
                      <span className="text-sm">{metadata.authMethod as string}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Result</span>
                      <Badge variant={metadata.authResult === "Success" ? "secondary" : "destructive"}>
                        {metadata.authResult as string}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Session ID</span>
                      <span className="text-sm font-mono">{metadata.sessionId as string}</span>
                    </div>
                  </div>
                </Card>
              )}

              {metadata?.fileName && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">File Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">File Name</span>
                      <span className="text-sm font-mono">{metadata.fileName as string}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">File Path</span>
                      <span className="text-sm font-mono text-xs">{metadata.filePath as string}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">File Hash</span>
                      <span className="text-sm font-mono text-xs truncate block">{metadata.fileHash as string}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">File Size</span>
                      <span className="text-sm">{((metadata.fileSize as number) / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="raw" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Raw Log Entry</h4>
                </div>
                <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {event.rawLog || "No raw log available"}
                </pre>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Full Metadata (JSON)</h4>
                </div>
                <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto">
                  {metadata ? JSON.stringify(metadata, null, 2) : "No metadata available"}
                </pre>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function Events() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const { data: events = [], isLoading, isError } = useQuery<SecurityEvent[]>({
    queryKey: ["/api/events"],
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading security events...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Events</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load security events. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      search === "" ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.source.toLowerCase().includes(search.toLowerCase()) ||
      event.user?.toLowerCase().includes(search.toLowerCase()) ||
      event.eventType?.toLowerCase().includes(search.toLowerCase()) ||
      event.tactic?.toLowerCase().includes(search.toLowerCase()) ||
      event.technique?.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter;
    const matchesType = typeFilter === "all" || event.eventType === typeFilter;

    return matchesSearch && matchesSeverity && matchesType;
  });

  const eventTypes = Array.from(new Set(events.map((e) => e.eventType)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Security Events</h1>
        <p className="text-sm text-muted-foreground">
          Monitor and analyze security events in real-time
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events, tactics, techniques..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-events"
            />
          </div>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40" data-testid="select-severity-filter">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48" data-testid="select-type-filter">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="default" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wide w-8" />
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Timestamp
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Severity
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Event Type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Source
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Action
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  MITRE Tactic
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No events found matching filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => setSelectedEvent(event)}
                    data-testid={`event-row-${event.id}`}
                  >
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityVariant(event.severity)} className="text-xs">
                        {event.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{event.eventType}</TableCell>
                    <TableCell className="text-sm font-mono">{event.source}</TableCell>
                    <TableCell>
                      <Badge variant={getActionVariant(event.action)} className="text-xs">
                        {event.action || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.tactic || "-"}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {event.description}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {filteredEvents.length} of {events.length} events
          </p>
          <p className="text-xs">Click on a row to view detailed event information</p>
        </div>
      </Card>

      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
