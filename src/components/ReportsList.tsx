import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2 } from "lucide-react";

interface Report {
  id: string;
  company_name: string;
  incident_date: string;
  description: string;
  status: string;
  is_anonymous: boolean;
  tracking_token: string | null;
  created_at: string;
}

export default function ReportsList({ userId }: { userId?: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReports(data);
      }
      setLoading(false);
    };

    fetchReports();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "in_review": return "bg-accent/10 text-accent border-accent/20";
      case "investigating": return "bg-primary/10 text-primary border-primary/20";
      case "resolved": return "bg-success/10 text-success border-success/20";
      case "dismissed": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      in_review: "Em Análise",
      investigating: "Investigando",
      resolved: "Resolvida",
      dismissed: "Arquivada",
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando denúncias...</div>;
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Você ainda não tem denúncias registradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Minhas Denúncias</h2>
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {report.company_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(report.incident_date).toLocaleDateString("pt-BR")}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(report.status)}>
                {getStatusLabel(report.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {report.description}
            </p>
            {report.is_anonymous && report.tracking_token && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Token de rastreamento:</p>
                <code className="text-sm font-mono">{report.tracking_token}</code>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
