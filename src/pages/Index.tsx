import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Search, Lock, Eye, Bell } from "lucide-react";
import heroImage from "@/assets/hero-security.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SecureReport</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>Entrar</Button>
            <Button onClick={() => navigate("/new-report")}>Nova Denúncia</Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Proteja a Integridade dos Dados com Denúncias Seguras
            </h2>
            <p className="text-xl text-muted-foreground">
              Sistema confidencial para relatar vazamentos de dados empresariais
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/new-report")}>
                <FileText className="mr-2 h-5 w-5" />
                Fazer uma Denúncia
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/track")}>
                <Search className="mr-2 h-5 w-5" />
                Rastrear Denúncia
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Como Funciona</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Denúncia Segura</CardTitle>
                <CardDescription>
                  Escolha identificar-se ou permanecer anônimo. Seus dados são protegidos
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 text-accent mb-3" />
                <CardTitle>Rastreamento</CardTitle>
                <CardDescription>
                  Receba um token único para acompanhar o andamento da sua denúncia
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-success mb-3" />
                <CardTitle>Transparência</CardTitle>
                <CardDescription>
                  Acompanhe cada etapa da investigação com total transparência
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
