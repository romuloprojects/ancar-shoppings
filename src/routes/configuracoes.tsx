import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BellRing,
  Database,
  Gauge,
  Link2,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Users,
} from "lucide-react";
import { PageHeader, LoadingBlock } from "@/components/ui-helpers";
import { InternalPage, SectionPanel, StatusPill } from "@/components/InternalPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboardService";
import type { Shopping } from "@/types";
import { USE_MOCK_DATA } from "@/config";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const [shoppings, setShoppings] = useState<Shopping[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(USE_MOCK_DATA);
  const [integrationUrl, setIntegrationUrl] = useState("https://dados.exemplo.com/portfolio");
  const [emissionFactor, setEmissionFactor] = useState("0.084");
  const [refresh, setRefresh] = useState("30");

  useEffect(() => {
    let alive = true;
    dashboardService.getShoppings().then((items) => {
      if (!alive) return;
      setShoppings(items);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const save = () => toast.success("Configurações salvas (demo)");

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Administração do sistema"
        title="Configurações"
        subtitle="Gerencie portfólio, metas, limites, integrações e preferências da plataforma."
        icon={Settings}
        right={
          <Button onClick={save} className="gap-2">
            <Save className="h-4 w-4" /> Salvar alterações
          </Button>
        }
      />

      <Tabs defaultValue="shoppings" className="space-y-4">
        <div className="panel overflow-x-auto p-2">
          <TabsList className="h-auto min-w-max flex-wrap justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="shoppings" className="gap-1.5">
              <Store className="h-3.5 w-3.5" /> Shoppings
            </TabsTrigger>
            <TabsTrigger value="metas" className="gap-1.5">
              <Gauge className="h-3.5 w-3.5" /> Metas
            </TabsTrigger>
            <TabsTrigger value="alertas" className="gap-1.5">
              <BellRing className="h-3.5 w-3.5" /> Alertas
            </TabsTrigger>
            <TabsTrigger value="emissoes" className="gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Emissões
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="unidades" className="gap-1.5">
              <Database className="h-3.5 w-3.5" /> Unidades
            </TabsTrigger>
            <TabsTrigger value="instrumentos" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Disponibilidade
            </TabsTrigger>
            <TabsTrigger value="integracao" className="gap-1.5">
              <Link2 className="h-3.5 w-3.5" /> Integração
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Aparência
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="shoppings" className="m-0">
          <SectionPanel
            title="Portfólio monitorado"
            subtitle="Unidades cadastradas e cobertura atual de instrumentação"
            icon={Store}
            contentClassName="p-0"
          >
            {loading ? (
              <div className="p-4">
                <LoadingBlock h={360} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/20 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Sigla</th>
                      <th className="px-4 py-3 text-left">Nome</th>
                      <th className="px-4 py-3 text-left">Localização</th>
                      <th className="px-4 py-3 text-left">Qualidade</th>
                      <th className="px-4 py-3 text-right">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoppings.map((shopping) => (
                      <tr key={shopping.id} className="border-t border-border/35">
                        <td className="px-4 py-3 font-semibold">{shopping.code}</td>
                        <td className="px-4 py-3">{shopping.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {shopping.city}/{shopping.stateCode}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill
                            label={
                              shopping.dataQuality === "alta"
                                ? "Alta"
                                : shopping.dataQuality === "media"
                                  ? "Média"
                                  : "Baixa"
                            }
                            tone={
                              shopping.dataQuality === "alta"
                                ? "positive"
                                : shopping.dataQuality === "media"
                                  ? "warning"
                                  : "danger"
                            }
                          />
                        </td>
                        <td className="metric-value px-4 py-3 text-right">
                          {shopping.dataAvailability.coveragePct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>
        </TabsContent>

        <TabsContent value="metas" className="m-0">
          <SettingsGrid
            title="Metas corporativas"
            subtitle="Parâmetros utilizados nos comparativos e indicadores executivos"
            icon={Gauge}
          >
            <Field label="Meta eficiência (kW/TR)" defaultValue="0.65" />
            <Field label="Meta redução consumo (%)" defaultValue="8" />
            <Field label="Meta ESG Score" defaultValue="85" />
            <Field label="Meta CO₂ evitado (t/ano)" defaultValue="12500" />
            <Field label="Meta economia (R$/ano)" defaultValue="4200000" />
            <Field label="Meta energia renovável (%)" defaultValue="45" />
          </SettingsGrid>
        </TabsContent>

        <TabsContent value="alertas" className="m-0">
          <SettingsGrid
            title="Limites de alertas"
            subtitle="Referências operacionais para geração de eventos e recomendações"
            icon={BellRing}
          >
            <Field label="Delta T mínimo (°C)" defaultValue="5.0" />
            <Field label="Consumo acima do baseline (%)" defaultValue="15" />
            <Field label="Aproximação máxima (°C)" defaultValue="5.5" />
            <Field label="Eficiência máxima aceitável (kW/TR)" defaultValue="0.85" />
            <Field label="Cobertura mínima (%)" defaultValue="80" />
            <Field label="Tempo máximo sem leitura (min)" defaultValue="10" />
          </SettingsGrid>
        </TabsContent>

        <TabsContent value="emissoes" className="m-0">
          <SectionPanel
            title="Fator de emissão"
            subtitle="Parâmetro aplicado às métricas de emissões e CO₂ evitado"
            icon={SlidersHorizontal}
          >
            <div className="max-w-lg space-y-3">
              <Field
                label="Fator de emissão da rede (t CO₂ / MWh)"
                value={emissionFactor}
                onChange={setEmissionFactor}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Valor demonstrativo baseado na referência configurada para a plataforma. A origem e
                a periodicidade da atualização devem ser definidas na integração definitiva.
              </p>
            </div>
          </SectionPanel>
        </TabsContent>

        <TabsContent value="usuarios" className="m-0">
          <SectionPanel
            title="Usuários e perfis"
            subtitle="Controle demonstrativo de permissões de acesso"
            icon={Users}
            contentClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-muted/20 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">E-mail</th>
                    <th className="px-4 py-3 text-left">Perfil</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Alex Gomes", "alex@empresa.com.br", "Administrador"],
                    ["Marina Souza", "marina@empresa.com.br", "Analista"],
                    ["Rafael Lima", "rafael@empresa.com.br", "Operador"],
                    ["Camila Torres", "camila@empresa.com.br", "Visualização"],
                  ].map(([name, email, profile]) => (
                    <tr key={email} className="border-t border-border/35">
                      <td className="px-4 py-3 font-medium">{name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{email}</td>
                      <td className="px-4 py-3">{profile}</td>
                      <td className="px-4 py-3 text-right">
                        <StatusPill label="Ativo" tone="positive" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionPanel>
        </TabsContent>

        <TabsContent value="unidades" className="m-0">
          <SettingsGrid
            title="Unidades de engenharia"
            subtitle="Padrões exibidos nos cards, gráficos e relatórios"
            icon={Database}
          >
            {[
              ["Energia", "MWh"],
              ["Potência", "kW"],
              ["Eficiência", "kW/TR"],
              ["Temperatura", "°C"],
              ["Vazão", "L/s"],
              ["Emissões", "t CO₂"],
            ].map(([label, value]) => (
              <Field key={label} label={label} defaultValue={value} />
            ))}
          </SettingsGrid>
        </TabsContent>

        <TabsContent value="instrumentos" className="m-0">
          <SectionPanel
            title="Disponibilidade de instrumentos"
            subtitle="Cobertura por família de medição em cada unidade"
            icon={ShieldCheck}
            contentClassName="p-0"
          >
            {loading ? (
              <div className="p-4">
                <LoadingBlock h={360} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                  <thead className="bg-muted/20 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Shopping</th>
                      <th className="px-4 py-3 text-center">Chillers</th>
                      <th className="px-4 py-3 text-center">Periféricos</th>
                      <th className="px-4 py-3 text-center">Temperaturas</th>
                      <th className="px-4 py-3 text-center">Vazão</th>
                      <th className="px-4 py-3 text-right">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoppings.map((shopping) => (
                      <tr key={shopping.id} className="border-t border-border/35">
                        <td className="px-4 py-3 font-medium">
                          {shopping.code} · {shopping.name}
                        </td>
                        <AvailabilityCell value={shopping.dataAvailability.chillers} />
                        <AvailabilityCell value={shopping.dataAvailability.perifericos} />
                        <AvailabilityCell value={shopping.dataAvailability.temperaturas} />
                        <AvailabilityCell value={shopping.dataAvailability.vazao} />
                        <td className="metric-value px-4 py-3 text-right">
                          {shopping.dataAvailability.coveragePct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>
        </TabsContent>

        <TabsContent value="integracao" className="m-0">
          <SectionPanel
            title="Integração de dados"
            subtitle="Fonte, endpoint e intervalo de atualização"
            icon={Link2}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/15 p-4">
                <div>
                  <div className="text-sm font-medium">Usar dados mockados</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Quando desativado, a aplicação consulta a fonte de dados configurada.
                  </div>
                </div>
                <Switch checked={useMock} onCheckedChange={setUseMock} />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field
                  label="Endpoint de integração"
                  value={integrationUrl}
                  onChange={setIntegrationUrl}
                />
                <Field
                  label="Intervalo de atualização (segundos)"
                  value={refresh}
                  onChange={setRefresh}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={save}>Salvar integração</Button>
              </div>
            </div>
          </SectionPanel>
        </TabsContent>

        <TabsContent value="aparencia" className="m-0">
          <SectionPanel
            title="Aparência e experiência"
            subtitle="Preferências visuais demonstrativas"
            icon={Palette}
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-border/50 bg-muted/15 p-4 text-sm text-muted-foreground">
                O tema é fixado em modo escuro corporativo para manter contraste e consistência
                entre as telas do protótipo.
              </div>
              <ToggleSetting
                label="Densidade compacta"
                description="Reduz espaçamentos em tabelas e listas"
              />
              <ToggleSetting
                label="Animações de gráficos"
                description="Mantém transições suaves nas atualizações"
              />
            </div>
          </SectionPanel>
        </TabsContent>
      </Tabs>
    </InternalPage>
  );
}

function SettingsGrid({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Gauge;
  children: ReactNode;
}) {
  return (
    <SectionPanel title={title} subtitle={subtitle} icon={icon}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </SectionPanel>
  );
}

function Field({
  label,
  defaultValue,
  value,
  onChange,
}: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </Label>
      <Input
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="mt-1.5 h-10 bg-background/45"
      />
    </div>
  );
}

function AvailabilityCell({ value }: { value: boolean }) {
  return (
    <td className="px-4 py-3 text-center">
      <span
        className={`mx-auto block h-2.5 w-2.5 rounded-full ${
          value
            ? "bg-[var(--accent-green)] shadow-[0_0_9px_var(--accent-green)]"
            : "bg-muted-foreground/30"
        }`}
        aria-label={value ? "Disponível" : "Indisponível"}
      />
    </td>
  );
}

function ToggleSetting({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/15 p-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch defaultChecked />
    </div>
  );
}
