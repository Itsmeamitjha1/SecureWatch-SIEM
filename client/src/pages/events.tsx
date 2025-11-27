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
import { SecurityEvent } from "@shared/schema";
import { Search, Filter, Download, Activity } from "lucide-react";
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

export default function Events() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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
      event.user?.toLowerCase().includes(search.toLowerCase());

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
              placeholder="Search events..."
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
                  User
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No events found matching filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className="hover-elevate"
                    data-testid={`event-row-${event.id}`}
                  >
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
                    <TableCell className="text-sm">{event.user || "-"}</TableCell>
                    <TableCell className="text-sm">{event.description}</TableCell>
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
        </div>
      </Card>
    </div>
  );
}
