import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Track() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*, report_status_history(*)")
        .eq("tracking_token", token.trim().toUpperCase())
        .single();

      if (error || !data) {
        toast.error("Token não encontrado");
        setReport(null);
      } else {
        setReport(data);
      }
    } catch (error) {
      toast.error("Erro ao buscar denúncia");
      setReport(null);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Search className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Rastrear Denúncia</CardTitle>
                  <CardDescription>
                    Insira o token para acompanhar sua denúncia anônima
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token de Rastreamento</Label>
                  <Input
                    id="token"
                    placeholder="XXXXXXXX-XXXXXXXX"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Buscando..." : "Buscar Denúncia"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {report && (
            <Card className="shadow-medium">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {report.company_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(report.incident_date).toLocaleDateString(
                        "pt-BR"
                      )}
                    </CardDescription>
                  </div>
                  <Badge>{getStatusLabel(report.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </div>
                {report.report_status_history &&
                  report.report_status_history.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Histórico</h4>
                      <div className="space-y-2">
                        {report.report_status_history.map((history: any) => (
                          <div
                            key={history.id}
                            className="border-l-2 border-primary pl-4 py-2"
                          >
                            <p className="font-medium text-sm">
                              {getStatusLabel(history.status)}
                            </p>
                            {history.notes && (
                              <p className="text-xs text-muted-foreground">
                                {history.notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(history.created_at).toLocaleString(
                                "pt-BR"
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
