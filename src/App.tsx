import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./components/Header";
import { RoomLobby } from "./components/RoomLobby";
import { LiveVoting } from "./components/LiveVoting";
import { WorkflowProgress } from "./components/WorkflowProgress";
import { EvidenceBoard } from "./components/EvidenceBoard";
import { VerdictReport } from "./components/VerdictReport";
import { ProPaywallModal } from "./components/ProPaywallModal";
import { useAudioTribunal } from "./hooks/useAudioTribunal";
import { useRevenueCat } from "./hooks/useRevenueCat";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

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

  // RevenueCat Hook
  const revenueCat = useRevenueCat(voterId);

  // Estados locales de navegación
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isAuditingLocally, setIsAuditingLocally] = useState(false);

  // Detección de ?room=HYPE-XXX en la URL para multijugador entre navegadores
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      let clean = roomParam.toUpperCase().trim();
      if (!clean.startsWith("HYPE-") && /^\d+$/.test(clean)) {
        clean = `HYPE-${clean}`;
      }
      setActiveRoomCode(clean);
    }
  }, []);

  // --- CONSULTAS REACTIVAS DE CONVEX (Multiplayer en tiempo real) ---
  const room = useQuery(
    api.rooms.getByCode,
    activeRoomCode ? { code: activeRoomCode } : "skip"
  );

  const activeClaim = useQuery(
    api.claims.get,
    room?.activeClaimId ? { claimId: room.activeClaimId } : "skip"
  );

  const liveCounts = useQuery(
    api.votes.getCounts,
    room?.activeClaimId ? { claimId: room.activeClaimId } : "skip"
  );

  const myVote = useQuery(
    api.votes.getMyVote,
    room?.activeClaimId ? { claimId: room.activeClaimId, voterId } : "skip"
  );

  const investigation = useQuery(
    api.investigations.getByClaim,
    room?.activeClaimId ? { claimId: room.activeClaimId } : "skip"
  );

  const liveEvidence = useQuery(
    api.evidence.listByInvestigation,
    investigation?._id ? { investigationId: investigation._id } : "skip"
  );

  const proStatus = useQuery(api.entitlements.getStatus, { userId: voterId });

  // --- MUTACIONES Y ACCIONES DE CONVEX ---
  const createRoomWithClaimMutation = useMutation(api.rooms.createWithClaim);
  const updateRoomStatusMutation = useMutation(api.rooms.updateStatus);
  const castVoteMutation = useMutation(api.votes.cast);
  const startInvestigationMutation = useMutation(api.investigations.startOrGet);
  const triggerFailureMutation = useMutation(api.investigations.triggerSimulatedFailure);
  const grantProAccessMutation = useMutation(api.entitlements.grantProAccess);
  const revokeProAccessMutation = useMutation(api.entitlements.revokeProAccess);
  const executeFullAuditAction = useAction(api.actions.executeFullAudit);

  // Determinar si el usuario actual es el Host de la sala
  const isHost = room ? room.hostUserId === voterId : false;

  // Estado consolidado de suscripción Pro
  const hasProAccess = Boolean(proStatus?.hasProAccess || revenueCat.isPro);

  // 1. Crear Sala y claim atómicamente
  const handleCreateRoom = async (title: string, claimText: string) => {
    try {
      audio.playGavel();
      const res = await createRoomWithClaimMutation({
        title,
        hostUserId: voterId,
        claimText,
      });

      setActiveRoomCode(res.code);
      window.history.pushState({}, "", `?room=${res.code}`);
    } catch (err) {
      console.error("Error creating room with claim:", err);
    }
  };

  // 2. Unirse a una sala existente
  const handleJoinRoom = (code: string) => {
    let cleanCode = code.toUpperCase().trim();
    if (!cleanCode.startsWith("HYPE-") && /^\d+$/.test(cleanCode)) {
      cleanCode = `HYPE-${cleanCode}`;
    }
    setActiveRoomCode(cleanCode);
    window.history.pushState({}, "", `?room=${cleanCode}`);
    audio.playVoteClick();
  };

  // 3. Emitir voto multijugador reactivo
  const handleCastVote = async (choice: "SMOKE" | "LEGIT") => {
    if (!room || !room.activeClaimId) return;
    if (choice === "SMOKE") {
      audio.playVoteSmoke();
    } else {
      audio.playVoteLegit();
    }
    try {
      await castVoteMutation({
        claimId: room.activeClaimId,
        roomId: room._id,
        voterId,
        voterName: isHost ? "Host" : `Invitado ${voterId.slice(-4)}`,
        choice,
      });
    } catch (err) {
      console.error("Error casting vote:", err);
    }
  };

  // 4. Desplegar Auditoría Autónoma (Render Workflows + Linkup + Nebius)
  const handleLaunchInvestigation = async () => {
    if (!room || !room.activeClaimId || !activeClaim) return;
    audio.playGavel();
    setIsAuditingLocally(true);

    try {
      const invId = await startInvestigationMutation({
        claimId: room.activeClaimId,
        roomId: room._id,
        workflowRunId: `rw-${Date.now()}`,
      });

      // Ejecutar la acción completa en segundo plano con Linkup y Nebius
      executeFullAuditAction({
        investigationId: invId,
        roomId: room._id,
        claimText: activeClaim.content,
      })
        .then((result) => {
          setIsAuditingLocally(false);
          if (result.verdict === "CERTIFIED_SMOKE") {
            audio.playVerdictChime(true);
            audio.playSmokeSiren();
          } else if (result.verdict === "VERIFIED_LEGIT" || result.verdict === "PLAUSIBLE") {
            audio.playVerdictChime(false);
          }
        })
        .catch((err) => {
          console.error("Error running audit action:", err);
          setIsAuditingLocally(false);
        });
    } catch (err) {
      console.error("Error starting investigation:", err);
      setIsAuditingLocally(false);
    }
  };

  // 5. Simular Falla Controlada (Reto Render Workflows)
  const handleTriggerFailureSimulation = async () => {
    if (!investigation) return;
    audio.playSmokeSiren();
    try {
      await triggerFailureMutation({ investigationId: investigation._id });
    } catch (err) {
      console.error("Error triggering failure simulation:", err);
    }
  };

  // 6. RevenueCat Test Store Purchase
  const handlePurchaseSuccess = async () => {
    audio.playUnlockSound();
    await revenueCat.purchasePro();
    try {
      await grantProAccessMutation({
        userId: voterId,
        entitlementId: "pro_auditor_access",
      });
    } catch (err) {
      console.error("Error granting pro access:", err);
    }
  };

  const handleRevokeAccess = async () => {
    audio.playVoteClick();
    revenueCat.resetPro();
    try {
      await revokeProAccessMutation({ userId: voterId });
    } catch (err) {
      console.error("Error revoking pro access:", err);
    }
  };

  return (
    <div className="min-h-screen bg-tribunal-dark bg-cyber-grid flex flex-col selection:bg-purple-600 selection:text-white relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[300px] sm:h-[400px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Header global */}
      <Header
        roomCode={activeRoomCode || undefined}
        hasProAccess={hasProAccess}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onPlayGavel={audio.playGavel}
      />

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8 z-10">
        {/* Vista 1: Lobby Inicial */}
        {!activeRoomCode && (
          <RoomLobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        )}

        {/* Estado de Carga de la Sala para Invitados */}
        {activeRoomCode && room === undefined && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-slate-300 font-mono text-sm">
              Conectando con el Tribunal de la Verdad... Buscando sala {activeRoomCode}
            </p>
          </div>
        )}

        {/* Sala No Encontrada */}
        {activeRoomCode && room === null && (
          <div className="bg-tribunal-card border border-red-500/30 rounded-2xl max-w-md mx-auto p-6 text-center space-y-4 my-12 shadow-2xl">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-full w-fit mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Sala no encontrada</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No se encontró ninguna sesión activa con el código{" "}
              <span className="text-purple-400 font-mono font-bold">{activeRoomCode}</span>.
              Verifica el código e intenta nuevamente.
            </p>
            <button
              onClick={() => {
                setActiveRoomCode(null);
                window.history.pushState({}, "", window.location.pathname);
              }}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 rounded-lg transition"
            >
              Volver al Lobby
            </button>
          </div>
        )}

        {/* Vista 2: Votación Multijugador en Tiempo Real */}
        {activeRoomCode && room && room.status === "voting" && (
          <div className="space-y-6">
            {activeClaim ? (
              <LiveVoting
                claimContent={activeClaim.content}
                authorName={activeClaim.authorName}
                counts={{
                  smoke: liveCounts?.smoke || 0,
                  legit: liveCounts?.legit || 0,
                  total: liveCounts?.total || 0,
                  smokePercentage: liveCounts?.smokePercentage || 50,
                  legitPercentage: liveCounts?.legitPercentage || 50,
                  recentVoters: liveCounts?.recentVoters || [],
                }}
                myVoteChoice={myVote?.choice as "SMOKE" | "LEGIT" | undefined}
                onCastVote={handleCastVote}
                onLaunchInvestigation={handleLaunchInvestigation}
                isHost={isHost}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400">
                  Cargando afirmación sometida a juicio...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Vista 3: Orquestación Asíncrona (Render Workflows + Linkup Deep Research) */}
        {activeRoomCode && room && (room.status === "auditing" || isAuditingLocally) && (
          <div className="space-y-6">
            <WorkflowProgress
              currentStep={investigation?.currentStep || "extracting_claims"}
              progressPercentage={investigation?.progressPercentage ?? 0}
              simulatedFailureTriggered={investigation?.simulatedFailureTriggered || false}
              retryCount={investigation?.retryCount || 0}
              onTriggerFailureSimulation={handleTriggerFailureSimulation}
            />
            {liveEvidence && liveEvidence.length > 0 && (
              <EvidenceBoard evidenceList={liveEvidence} researchPlan={investigation?.researchPlan} />
            )}
          </div>
        )}

        {/* Vista 4: Veredicto Final y Métricas de Nebius Token Factory */}
        {activeRoomCode && room && room.status === "verdict" && (
          <div className="space-y-8">
            <VerdictReport
              verdict={investigation?.verdict ?? "INSUFFICIENT_EVIDENCE"}
              hypeScore={investigation?.hypeScore}
              summary={investigation?.summary}
              edgeCaseWarning={investigation?.edgeCaseWarning}
              metrics={investigation?.metrics}
              auditSources={investigation?.auditSources}
              completionReason={investigation?.completionReason}
              diagnostics={investigation?.diagnostics}
              hasProAccess={hasProAccess}
              claimText={activeClaim?.content}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onNewClaim={() => {
                if (room) {
                  updateRoomStatusMutation({ roomId: room._id, status: "lobby" });
                }
                setActiveRoomCode(null);
                window.history.pushState({}, "", window.location.pathname);
              }}
            />
            {liveEvidence && liveEvidence.length > 0 && (
              <EvidenceBoard evidenceList={liveEvidence} researchPlan={investigation?.researchPlan} />
            )}
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
        claimText={activeClaim?.content}
      />

      {/* Footer */}
      <footer className="border-t border-tribunal-border bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Truth Tribunal · The Bullshit & Hype Auditor</span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-slate-400">
            <span className="text-purple-400">● Red Reactiva Multijugador</span>
            <span className="text-emerald-400">● Deep Research Multifuente</span>
            <span className="text-indigo-400">● Inferencia LLM Forense</span>
            <span className="text-amber-400">● Due Diligence Certificado</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
