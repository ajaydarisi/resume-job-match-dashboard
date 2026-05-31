import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Analysis = {
  candidate_name: string | null;
  mobile_number: string | null;
  preferred_cities: string[];
  skills: string[];
  years_of_experience: string;
  seniority_level: string;
  technologies: string[];
  leadership_experience: string[];
  created_at: string;
};

export function ResumeSummary({ analysis }: { analysis: Analysis | null }) {
  if (!analysis) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-2xl font-semibold">{analysis.candidate_name ?? "Candidate"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {analysis.mobile_number ?? "Mobile not provided"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Experience</p>
            <p className="mt-2 text-2xl font-semibold">{analysis.years_of_experience}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{analysis.seniority_level}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leadership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analysis.leadership_experience.map((item) => (
            <p key={item} className="text-sm leading-6 text-muted-foreground">
              {item}
            </p>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile signals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Preferred cities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.preferred_cities.map((city) => (
                <Badge key={city}>{city}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Technologies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.technologies.map((technology) => (
                <Badge key={technology} variant="secondary">
                  {technology}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
