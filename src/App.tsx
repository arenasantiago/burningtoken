import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { RoomLobby } from "./components/RoomLobby";
import { LiveVoting } from "./components/LiveVoting";
import { WorkflowProgress } from "./components/WorkflowProgress";
import { EvidenceBoard } from "./components/EvidenceBoard";
import { VerdictReport } from "./components/VerdictReport";
import { ProPaywallModal } from "./components/ProPaywallModal";
import { useAudioTribunal } from "./hooks/useAudioTribunal";

// Generar o recuperar ID de votante persistente por pestaña
function getOrCreateVoterId(): string {
  let id = sessionStorage.getItem("tribunal_voter_id");
  if (!id) {
    id = "voter_" + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem("tribunal_voter_id", id);
  }
  return id;
}

export function App() {
  const audio = useAudioTribunal();
  const voterId = getOrCreateVoterId();

  // Estados de la sala y flujo
  const [roomCode, setRoomCode] = useState<string | undefined>();
  const [roomStatus, setRoomStatus] = useState<"lobby" | "voting" | "auditing" | "verdict">("lobby");
  const [claimContent, setClaimContent] = useState("");
  const [authorName, setAuthorName] = useState("Anónimo");
  
  // Votos
  const [myVoteChoice, setMyVoteChoice] = useState<"SMOKE" | "LEGIT" | undefined>();
  const [votes, setVotes] = useState({
    smoke: 14,
    legit: 3,
    total: 17,
    smokePercentage: 82,
    legitPercentage: 18,
    recentVoters: [
      { name: "VC_Scout", choice: "SMOKE" },
      { name: "Hacker_0x", choice: "SMOKE" },
      { name: "DevSanFran", choice: "LEGIT" },
    ],
  });

  // Workflow (Render Workflows)
  const [currentStep, setCurrentStep] = useState<
    "idle" | "extracting_claims" | "linkup_initial_search" | "linkup_deep_search" | "nebius_synthesizing" | "completed" | "recovered_from_failure"
  >("idle");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [simulatedFailure, setSimulatedFailure] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Evidencias (Linkup SDK)
  const [evidenceList, setEvidenceList] = useState<Array<{
    _id: string;
    step: "initial_search" | "follow_up_contrast";
    queryUsed: string;
    title: string;
    url: string;
    snippet: string;
    uncertaintyLevel: "LOW" | "MEDIUM" | "HIGH";
    supportsClaim: boolean;
  }>>([]);

  // Veredicto (Nebius Token Factory)
  const [verdictData, setVerdictData] = useState<{
    verdict: "CERTIFIED_SMOKE" | "PLAUSIBLE" | "VERIFIED_LEGIT";
    hypeScore: number;
    summary: string;
    edgeCaseWarning: string;
    metrics: {
      latencyMs: number;
      inputTokens: number;
      outputTokens: number;
      estimatedCostUsd: number;
      confidenceScore: number;
    };
  }>({
    verdict: "CERTIFIED_SMOKE",
    hypeScore: 88,
    summary: "Tras contrastar los registros de patentes, repositorios de código y declaraciones en prensa indexadas por Linkup, la afirmación carece de pruebas empíricas reproducibles y se califica como hipérbole de marketing.",
    edgeCaseWarning: "CASO LÍMITE (Nebius Token Factory): El modelo presenta sesgo hacia veredictos indulgentes cuando el claim incluye fórmulas matemáticas o jerga criptográfica densa sin contexto operativo claro.",
    metrics: {
      latencyMs: 1240,
      inputTokens: 890,
      outputTokens: 340,
      estimatedCostUsd: 0.000252,
      confidenceScore: 95.4,
    },
  });

  // RevenueCat Pro Entitlement
  const [hasProAccess, setHasProAccess] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Detección de parámetro en URL para multijugador (?room=HYPE-XXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      setRoomCode(roomParam.toUpperCase());
      setClaimContent("Lanzamos AGI autónomo con 99.9% de precisión y cero alucinaciones");
      setRoomStatus("voting");
    }
  }, []);

  // 1. Crear Sala
  const handleCreateRoom = (title: string, claim: string) => {
    const code = "HYPE-" + Math.floor(100 + Math.random() * 900);
    setRoomCode(code);
    setClaimContent(claim);
    setAuthorName("Tú (Host)");
    setRoomStatus("voting");
    audio.playGavel();
  };

  // 2. Unirse a Sala
  const handleJoinRoom = (code: string) => {
    setRoomCode(code.toUpperCase());
    setClaimContent("Blockchain cuántica con 500,000 TPS y cero comisiones garantizadas");
    setRoomStatus("voting");
    audio.playVoteClick();
  };

  // 3. Emitir Voto
  const handleCastVote = (choice: "SMOKE" | "LEGIT") => {
    setMyVoteChoice(choice);
    audio.playVoteClick();

    setVotes((prev) => {
      const newSmoke = choice === "SMOKE" ? prev.smoke + 1 : prev.smoke;
      const newLegit = choice === "LEGIT" ? prev.legit + 1 : prev.legit;
      const newTotal = prev.total + 1;
      return {
        smoke: newSmoke,
        legit: newLegit,
        total: newTotal,
        smokePercentage: Math.round((newSmoke / newTotal) * 100),
        legitPercentage: Math.round((newLegit / newTotal) * 100),
        recentVoters: [
          { name: "Tú", choice },
          ...prev.recentVoters.slice(0, 4),
        ],
      };
    });
  };

  // 4. Desplegar Investigación (Render Workflows + Linkup + Nebius)
  const handleLaunchInvestigation = () => {
    setRoomStatus("auditing");
    audio.playGavel();
    setCurrentStep("extracting_claims");
    setProgressPercentage(20);

    // Paso 2: Linkup Initial Search (después de 1.2s)
    setTimeout(() => {
      setCurrentStep("linkup_initial_search");
      setProgressPercentage(45);
      setEvidenceList([
        {
          _id: "ev-1",
          step: "initial_search",
          queryUsed: `${claimContent.slice(0, 40)} benchmark tech evaluation`,
          title: "Auditoría de Prensa y Anuncio Público",
          url: "https://techcrunch.example/article/ai-claims-scrutiny",
          snippet: `Las publicaciones iniciales reproducen el comunicado de prensa de la compañía sin validación empírica independiente de terceros.`,
          uncertaintyLevel: "MEDIUM",
          supportsClaim: true,
        },
        {
          _id: "ev-2",
          step: "initial_search",
          queryUsed: "independent validation code reproducibility",
          title: "Análisis de Repositorios Técnicos",
          url: "https://github.com/reproducibility-audits",
          snippet: "No se encontraron benchmarks abiertos ni pesos de modelos accesibles públicamente que avalen la afirmación.",
          uncertaintyLevel: "HIGH",
          supportsClaim: false,
        },
      ]);
    }, 1400);

    // Paso 3: Linkup Follow-Up Contrast Search (después de 3s)
    setTimeout(() => {
      setCurrentStep("linkup_deep_search");
      setProgressPercentage(70);
      setEvidenceList((prev) => [
        ...prev,
        {
          _id: "ev-3",
          step: "follow_up_contrast",
          queryUsed: `critique skepticism limitations "${claimContent.slice(0, 30)}"`,
          title: "Paper Científico: Límites Físicos y Teóricos del Claim",
          url: "https://arxiv.org/abs/2609.limits-of-claims",
          snippet: "Expertos en sistemas distribuidos concluyen que garantizar 99.9% de precisión sin intervención humana en entornos no deterministas es teóricamente insostenible.",
          uncertaintyLevel: "LOW",
          supportsClaim: false,
        },
      ]);
    }, 3000);

    // Paso 4: Nebius Token Factory Síntesis (después de 4.8s)
    setTimeout(() => {
      setCurrentStep("nebius_synthesizing");
      setProgressPercentage(90);
    }, 4800);

    // Paso 5: Veredicto Final Revelado (después de 6.2s)
    setTimeout(() => {
      setCurrentStep("completed");
      setProgressPercentage(100);
      setRoomStatus("verdict");
      audio.playVerdictChime(true);
      audio.playSmokeSiren();
    }, 6200);
  };

  // 5. Simulación de Falla Controlada (Reto Render Workflows)
  const handleTriggerFailureSimulation = () => {
    audio.playSmokeSiren();
    setSimulatedFailure(true);
    setRetryCount((r) => r + 1);
    setCurrentStep("recovered_from_failure");
    setProgressPercentage(75);

    // Reanudar automáticamente con idempotencia tras 1.5s
    setTimeout(() => {
      setCurrentStep("nebius_synthesizing");
      setProgressPercentage(92);
      setTimeout(() => {
        setCurrentStep("completed");
        setProgressPercentage(100);
        setRoomStatus("verdict");
        audio.playVerdictChime(true);
      }, 1800);
    }, 1600);
  };

  // 6. RevenueCat Test Store Purchase
  const handlePurchaseSuccess = () => {
    setHasProAccess(true);
    audio.playUnlockSound();
  };

  const handleRevokeAccess = () => {
    setHasProAccess(false);
    audio.playVoteClick();
  };

  return (
    <div className="min-h-screen bg-tribunal-dark flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Header global */}
      <Header
        roomCode={roomCode}
        hasProAccess={hasProAccess}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onPlayGavel={audio.playGavel}
      />

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {roomStatus === "lobby" && (
          <RoomLobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        )}

        {roomStatus === "voting" && (
          <div className="space-y-6">
            <LiveVoting
              claimContent={claimContent}
              authorName={authorName}
              counts={votes}
              myVoteChoice={myVoteChoice}
              onCastVote={handleCastVote}
              onLaunchInvestigation={handleLaunchInvestigation}
              isHost={true}
            />
          </div>
        )}

        {roomStatus === "auditing" && (
          <div className="space-y-6">
            <WorkflowProgress
              currentStep={currentStep}
              progressPercentage={progressPercentage}
              simulatedFailureTriggered={simulatedFailure}
              retryCount={retryCount}
              onTriggerFailureSimulation={handleTriggerFailureSimulation}
            />
            {evidenceList.length > 0 && (
              <EvidenceBoard evidenceList={evidenceList} />
            )}
          </div>
        )}

        {roomStatus === "verdict" && (
          <div className="space-y-8">
            <VerdictReport
              verdict={verdictData.verdict}
              hypeScore={verdictData.hypeScore}
              summary={verdictData.summary}
              edgeCaseWarning={verdictData.edgeCaseWarning}
              metrics={verdictData.metrics}
              hasProAccess={hasProAccess}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onNewClaim={() => setRoomStatus("lobby")}
            />
            <EvidenceBoard evidenceList={evidenceList} />
          </div>
        )}
      </main>

      {/* Modal RevenueCat Test Store */}
      <ProPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        hasProAccess={hasProAccess}
        onPurchaseSuccess={handlePurchaseSuccess}
        onRevokeAccess={handleRevokeAccess}
        claimText={claimContent}
      />

      {/* Footer */}
      <footer className="border-t border-tribunal-border bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Truth Tribunal · NERDCONF Burning Token Hackathon 2026</span>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span>● Convex</span>
            <span>● Linkup</span>
            <span>● Nebius</span>
            <span>● Render</span>
            <span>● RevenueCat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
