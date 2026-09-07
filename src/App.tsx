import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Header } from "./components/Header";
import { RoomLobby } from "./components/RoomLobby";
import { LiveVoting } from "./components/LiveVoting";
import { WorkflowProgress } from "./components/WorkflowProgress";
import { EvidenceBoard } from "./components/EvidenceBoard";
import { VerdictReport } from "./components/VerdictReport";
import { ProPaywallModal } from "./components/ProPaywallModal";
import { useAudioTribunal } from "./hooks/useAudioTribunal";
import { useRevenueCat } from "./hooks/useRevenueCat";

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
      setActiveRoomCode(roomParam.toUpperCase().trim());
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
  const createRoomMutation = useMutation(api.rooms.create);
  const createClaimMutation = useMutation(api.claims.create);
  const updateRoomStatusMutation = useMutation(api.rooms.updateStatus);
  const castVoteMutation = useMutation(api.votes.cast);
  const startInvestigationMutation = useMutation(api.investigations.startOrGet);
  const triggerFailureMutation = useMutation(api.investigations.triggerSimulatedFailure);
  const grantProAccessMutation = useMutation(api.entitlements.grantProAccess);
  const revokeProAccessMutation = useMutation(api.entitlements.revokeProAccess);
  const executeFullAuditAction = useAction(api.actions.executeFullAudit);

  // Estado consolidado de suscripción Pro
  const hasProAccess = Boolean(proStatus?.hasProAccess || revenueCat.isPro);

  // 1. Crear Sala y primer claim
  const handleCreateRoom = async (title: string, claimText: string) => {
    try {
      audio.playGavel();
      const res = await createRoomMutation({
        title,
        hostUserId: voterId,
      });

      // Crear y asociar el claim inicial
      await createClaimMutation({
        roomId: res.roomId,
        authorName: "Host",
        content: claimText,
      });

      setActiveRoomCode(res.code);
      window.history.pushState({}, "", `?room=${res.code}`);
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  // 2. Unirse a una sala existente
  const handleJoinRoom = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    setActiveRoomCode(cleanCode);
    window.history.pushState({}, "", `?room=${cleanCode}`);
    audio.playVoteClick();
  };

  // 3. Emitir voto multijugador reactivo
  const handleCastVote = async (choice: "SMOKE" | "LEGIT") => {
    if (!room || !room.activeClaimId) return;
    audio.playVoteClick();
    try {
      await castVoteMutation({
        claimId: room.activeClaimId,
        roomId: room._id,
        voterId,
        voterName: `Votante ${voterId.slice(-4)}`,
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
          } else {
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

  // Resolver estado visible de la sala
  const currentRoomStatus = room?.status || (activeRoomCode ? "voting" : "lobby");

  return (
    <div className="min-h-screen bg-tribunal-dark flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Header global */}
      <Header
        roomCode={activeRoomCode || undefined}
        hasProAccess={hasProAccess}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onPlayGavel={audio.playGavel}
      />

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {/* Vista 1: Lobby Inicial */}
        {!activeRoomCode && (
          <RoomLobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        )}

        {/* Vista 2: Votación Multijugador en Tiempo Real */}
        {activeRoomCode && currentRoomStatus === "voting" && (
          <div className="space-y-6">
            <LiveVoting
              claimContent={activeClaim?.content || "Cargando afirmación de la sala..."}
              authorName={activeClaim?.authorName || "Anónimo"}
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
              isHost={true}
            />
          </div>
        )}

        {/* Vista 3: Orquestación Asíncrona (Render Workflows + Linkup Deep Research) */}
        {activeRoomCode && (currentRoomStatus === "auditing" || isAuditingLocally) && (
          <div className="space-y-6">
            <WorkflowProgress
              currentStep={investigation?.currentStep || "extracting_claims"}
              progressPercentage={investigation?.progressPercentage || 25}
              simulatedFailureTriggered={investigation?.simulatedFailureTriggered || false}
              retryCount={investigation?.retryCount || 0}
              onTriggerFailureSimulation={handleTriggerFailureSimulation}
            />
            {liveEvidence && liveEvidence.length > 0 && (
              <EvidenceBoard evidenceList={liveEvidence as any} />
            )}
          </div>
        )}

        {/* Vista 4: Veredicto Final y Métricas de Nebius Token Factory */}
        {activeRoomCode && currentRoomStatus === "verdict" && (
          <div className="space-y-8">
            <VerdictReport
              verdict={investigation?.verdict || "CERTIFIED_SMOKE"}
              hypeScore={investigation?.hypeScore || 85}
              summary={investigation?.summary || "Reporte pericial sintetizado por Nebius Token Factory."}
              edgeCaseWarning={investigation?.edgeCaseWarning || "Limitación del modelo ante fórmulas criptográficas densas."}
              metrics={
                investigation?.metrics || {
                  latencyMs: 1180,
                  inputTokens: 820,
                  outputTokens: 310,
                  estimatedCostUsd: 0.00021,
                  confidenceScore: 94.2,
                }
              }
              hasProAccess={hasProAccess}
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
              <EvidenceBoard evidenceList={liveEvidence as any} />
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
          <span>Truth Tribunal · NERDCONF Burning Token Hackathon 2026</span>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span className="text-purple-400">● Convex Cloud: brave-lemur-868</span>
            <span className="text-emerald-400">● Linkup Deep Research</span>
            <span className="text-indigo-400">● Nebius Token Factory</span>
            <span className="text-amber-400">● RevenueCat Test Store</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
