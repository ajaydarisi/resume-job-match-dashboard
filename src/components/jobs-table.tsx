import { Contact, ExternalLink, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  id: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  match_score: number;
  reason: string;
  missing_skills: string[];
  apply_url: string;
  contact_email: string | null;
  contact_linkedin: string | null;
  contact_reason: string | null;
};

export function JobsTable({ rows }: { rows: Row[] }) {
  if (!rows.length) {
    return (
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <CardTitle>No saved job matches yet</CardTitle>
          <CardDescription>Run the analysis to populate the dashboard table.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved job matches</CardTitle>
        <CardDescription>{rows.length} ranked roles saved for this profile.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Score</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Missing</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="align-top">
                <TableCell className="px-4">
                  <Badge className="h-8 rounded-md px-2.5 text-sm font-bold">
                    {row.match_score}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground">{row.company}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell className="text-muted-foreground">{row.location}</TableCell>
                <TableCell className="text-muted-foreground">{row.salary}</TableCell>
                <TableCell className="max-w-sm whitespace-normal leading-6 text-muted-foreground">
                  {row.reason}
                </TableCell>
                <TableCell>
                  {row.missing_skills.length ? (
                    <div className="flex max-w-xs flex-wrap gap-1.5">
                      {row.missing_skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="rounded-md">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">None obvious</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Button asChild size="sm">
                      <a href={row.apply_url} target="_blank" rel="noreferrer">
                        Apply <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {row.contact_email ? (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={`mailto:${row.contact_email}?subject=${encodeURIComponent(`${row.title} at ${row.company}`)}`}
                          title={row.contact_reason ?? undefined}
                        >
                          Email <Mail className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : null}
                    {row.contact_linkedin ? (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={row.contact_linkedin}
                          target="_blank"
                          rel="noreferrer"
                          title={row.contact_reason ?? undefined}
                        >
                          LinkedIn <Contact className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
