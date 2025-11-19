import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import type { User, Session } from "@supabase/supabase-js";

const reportSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, { message: "Nome da empresa é obrigatório" })
    .max(200),
  incidentDate: z
    .string()
    .min(1, { message: "Data do incidente é obrigatória" }),
  description: z
    .string()
    .trim()
    .min(20, { message: "Descrição deve ter no mínimo 20 caracteres" })
    .max(5000),
  evidenceDetails: z.string().max(3000).optional(),
});

export default function NewReport() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    incidentDate: "",
    description: "",
    evidenceDetails: "",
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = reportSchema.parse(formData);

      // If user is not logged in, force anonymous mode
      const effectiveIsAnonymous = isAnonymous || !user;
      let trackingToken: string | null = null;

      if (effectiveIsAnonymous) {
        const { data: tokenData } = await supabase.rpc(
          "generate_tracking_token"
        );
        trackingToken = tokenData;
      }

      const { data, error } = await supabase
        .from("reports")
        .insert({
          user_id: effectiveIsAnonymous ? null : user?.id,
          company_name: validated.companyName,
          incident_date: validated.incidentDate,
          description: validated.description,
          evidence_details: validated.evidenceDetails || null,
          is_anonymous: effectiveIsAnonymous,
          tracking_token: trackingToken,
        })
        .select()
        .single();

      if (error) throw error;

      if (effectiveIsAnonymous && trackingToken) {
        toast.success(
          <div className="space-y-2">
            <p className="font-semibold">Denúncia registrada!</p>
            <p className="text-sm">Seu token de rastreamento:</p>
            <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {trackingToken}
            </p>
            <p className="text-xs text-muted-foreground">
              Guarde este código para acompanhar sua denúncia
            </p>
          </div>,
          { duration: 10000 }
        );
        navigate("/track");
      } else {
        toast.success("Denúncia registrada com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao registrar denúncia: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(user ? "/dashboard" : "/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-warning/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Nova Denúncia</CardTitle>
                  <CardDescription>
                    Relate um vazamento de dados com segurança
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {user && (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">
                          Denúncia Anônima
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Ocultar sua identidade nesta denúncia
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    placeholder="Ex: Empresa ACME Ltda"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Data do Incidente *</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, incidentDate: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Vazamento *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o vazamento de dados: o que aconteceu, quais dados foram expostos, quando descobriu, etc."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    disabled={loading}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 20 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidenceDetails">
                    Evidências e Detalhes (opcional)
                  </Label>
                  <Textarea
                    id="evidenceDetails"
                    placeholder="Forneça informações adicionais, evidências ou detalhes técnicos sobre o vazamento"
                    value={formData.evidenceDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        evidenceDetails: e.target.value,
                      })
                    }
                    disabled={loading}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(user ? "/dashboard" : "/")}
                    disabled={loading}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Enviando..." : "Enviar Denúncia"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
