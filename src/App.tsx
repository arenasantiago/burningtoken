import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./components/Header";
import { RoomLobby } from "./components/RoomLobby";
import { InRoomLobby } from "./components/InRoomLobby";
import { LiveVoting } from "./components/LiveVoting";
import { WorkflowProgress } from "./components/WorkflowProgress";
import { EvidenceBoard } from "./components/EvidenceBoard";
import { VerdictReport } from "./components/VerdictReport";
import { ProPaywallModal } from "./components/ProPaywallModal";
import { GuestJoinModal } from "./components/GuestJoinModal";
import { useAudioTribunal } from "./hooks/useAudioTribunal";
import { useRevenueCat } from "./hooks/useRevenueCat";
import { Loader2, AlertTriangle } from "lucide-react";

function getOrCreateVoterId(): string {
  let id = sessionStorage.getItem("tribunal_voter_id");
  if (!id) {
    id = "voter_" + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem("tribunal_voter_id", id);
  }
  return id;
}

function getToken(storage: Storage, key: string) {
  let token = storage.getItem(key);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    storage.setItem(key, token);
  }
  return token;
}
export function App() {
  const audio = useAudioTribunal();
  const voterId = getOrCreateVoterId();

  const [sessionToken] = useState(() => getToken(sessionStorage, "tribunal_host_token"));
  const [purchaseToken] = useState(() => getToken(localStorage, "tribunal_purchase_token"));
  const identity = useQuery(api.sessions.identify, { token: sessionToken });
  const purchaseIdentity = useQuery(api.sessions.identify, { token: purchaseToken });
  const revenueCat = useRevenueCat(purchaseIdentity?.userId);
  const [now, setNow] = useState(Date.now());

  // Estados locales de navegación
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const votePending = useRef(false);
  const auditPending = useRef(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isAuditingLocally, setIsAuditingLocally] = useState(false);
  const [nickname, setNickname] = useState<string>(() => {
    try {
      return localStorage.getItem("truth_tribunal_nickname") || "";
    } catch {
      return "";
    }
  });

  const handleUpdateNickname = (name: string) => {
    const trimmed = name.trim();
    setNickname(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem("truth_tribunal_nickname", trimmed);
      } else {
        localStorage.removeItem("truth_tribunal_nickname");
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const syncRoom = () => {
      const value = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase();
      setActiveRoomCode(value ? (/^\d+$/.test(value) ? 'HYPE-' + value : value) : null);
      setIsGuestModalOpen(false);
      setActionError(null);
    };
    syncRoom();
    window.addEventListener("popstate", syncRoom);
    return () => window.removeEventListener("popstate", syncRoom);
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

  const proStatus = useQuery(api.entitlements.getStatus, { token: purchaseToken });

  // --- MUTACIONES Y ACCIONES DE CONVEX ---
  const createRoomWithClaimMutation = useMutation(api.rooms.createWithClaim);
  const startNextClaimMutation = useMutation(api.rooms.startNextClaim);
  const prepareNextClaimMutation = useMutation(api.rooms.prepareNextClaim);
  const castVoteMutation = useMutation(api.votes.cast);
  const triggerFailureMutation = useMutation(api.investigations.triggerSimulatedFailure);
  const launchWorkflow = useAction(api.workflows.launch);
  const syncSubscription = useAction(api.entitlements.sync);
  useEffect(() => {
    const refresh = () => { setNow(Date.now()); void syncSubscription({ token: purchaseToken }).catch(() => {}); };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [purchaseToken, syncSubscription]);

  // Determinar si el usuario actual es el Host de la sala y su identidad
  const isHost = room ? room.hostUserId === identity?.userId : false;
  const effectiveUserName = isHost ? "Host" : (nickname || `Invitado ${voterId.slice(-4)}`);

  // Modal de Acreditación para Invitados
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  useEffect(() => {
    if (activeRoomCode && room && !isHost) {
      const confirmed = sessionStorage.getItem(`guest_nick_confirmed_${activeRoomCode}`);
      if (!confirmed && !nickname) {
        setIsGuestModalOpen(true);
      }
    }
  }, [activeRoomCode, room, isHost, nickname]);

  const handleConfirmGuestNickname = (name: string) => {
    handleUpdateNickname(name);
    if (activeRoomCode) {
      sessionStorage.setItem(`guest_nick_confirmed_${activeRoomCode}`, "true");
    }
    setIsGuestModalOpen(false);
    audio.playVoteClick();
  };

  // Sincronización reactiva del audio del veredicto para todos los participantes (Host e Invitados)
  const playedVerdictKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (investigation && investigation.currentStep === "completed" && investigation._id) {
      const key = `${investigation._id}-${investigation.verdict}`;
      if (playedVerdictKeyRef.current !== key) {
        playedVerdictKeyRef.current = key;
        if (investigation.verdict === "CERTIFIED_SMOKE") {
          audio.playVerdictChime(true);
          audio.playSmokeSiren();
        } else if (investigation.verdict === "VERIFIED_LEGIT" || investigation.verdict === "PLAUSIBLE") {
          audio.playVerdictChime(false);
        }
      }
    }
  }, [investigation?.currentStep, investigation?.verdict, investigation?._id, audio]);

  // Estado consolidado de suscripción Pro
  const hasProAccess = Boolean(proStatus?.hasProAccess && (proStatus.expirationDate ?? 0) > now && now - (proStatus.verifiedAt ?? 0) < 300000);

  // 1. Crear Sala y claim atómicamente
  const handleCreateRoom = async (title: string, claimText: string) => {
    try {
      audio.playGavel();
      const res = await createRoomWithClaimMutation({
        title,
        sessionToken,
        claimText,
      });

      setActiveRoomCode(res.code);
      window.history.pushState({}, "", `?room=${res.code}`);
    } catch (err) {
      throw new Error("No pudimos crear la sala. Intenta de nuevo; tu texto se conserva.");
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
    if (!room || !room.activeClaimId || room.status !== "voting" || votePending.current || isGuestModalOpen) return;
    votePending.current = true;
    setIsVoting(true);
    setActionError(null);
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
        voterName: effectiveUserName,
        choice,
      });
    } catch (err) {
      setActionError("No pudimos guardar tu voto. Intenta de nuevo.");
    } finally {
      votePending.current = false;
      setIsVoting(false);
    }
  };

  // Manejo del siguiente caso manteniendo la sala
  const handleLaunchNextClaim = async (nextClaimText: string) => {
    if (!room) return;
    audio.playGavel();
    try {
      await startNextClaimMutation({
        roomId: room._id,
        sessionToken,
        claimText: nextClaimText,
        authorName: effectiveUserName,
      });
    } catch (err) {
      setActionError("No pudimos abrir el caso. Intenta de nuevo.");
    }
  };

  const handlePrepareNextClaim = async () => {
    if (!room) return;
    audio.playGavel();
    try {
      await prepareNextClaimMutation({ roomId: room._id, sessionToken });
    } catch (err) {
      setActionError("No pudimos preparar el siguiente caso. Intenta de nuevo.");
    }
  };

  const handleLeaveRoom = () => {
    setActiveRoomCode(null);
    window.history.pushState({}, "", window.location.pathname);
  };

  // 4. Desplegar Auditoría Autónoma (Render Workflows + Linkup + Nebius)
  const handleLaunchInvestigation = async () => {
    if (!room || !room.activeClaimId || !activeClaim || !isHost || auditPending.current) return;
    auditPending.current = true;
    setActionError(null);
    audio.playGavel();
    setIsAuditingLocally(true);

    try {
      await launchWorkflow({ roomId: room._id, sessionToken, purchaseToken });
      auditPending.current = false;
      setIsAuditingLocally(false);
    } catch (err) {
      auditPending.current = false;
      setActionError("No pudimos iniciar Render. Comprueba su configuración y vuelve a intentar.");
      setIsAuditingLocally(false);
    }
  };

  // 5. Simular Falla Controlada (Reto Render Workflows)
  const handleTriggerFailureSimulation = async () => {
    if (!investigation) return;
    audio.playSmokeSiren();
    try {
      await triggerFailureMutation({ investigationId: investigation._id, sessionToken });
    } catch (err) {
      setActionError("No pudimos solicitar la falla. Puede que la última etapa ya haya comenzado.");
    }
  };

  const handlePurchaseSuccess = async () => {
    await revenueCat.purchasePro();
    const result = await syncSubscription({ token: purchaseToken });
    setNow(Date.now());
    if (!result.hasProAccess) throw new Error("RevenueCat aún no confirma el acceso. Pulsa Actualizar suscripción en unos segundos.");
    audio.playUnlockSound();
  };
  const handleRefreshAccess = async () => { await syncSubscription({ token: purchaseToken }); setNow(Date.now()); };

  return (
    <div className="min-h-screen bg-tribunal-dark bg-cyber-grid flex flex-col selection:bg-purple-600 selection:text-white relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] lg:w-[900px] h-[200px] sm:h-[400px] bg-purple-600/10 blur-[100px] sm:blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Header global */}
      <Header
        roomCode={activeRoomCode || undefined}
        hasProAccess={hasProAccess}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onPlayGavel={audio.playGavel}
        nickname={room ? effectiveUserName : undefined}
        onLeaveRoom={activeRoomCode ? handleLeaveRoom : undefined}
        onEditNickname={room && !isHost ? () => setIsGuestModalOpen(true) : undefined}
      />

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8 z-10">
        {actionError && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">{actionError}</div>}
        {room && <nav aria-label="Etapas del caso" className="flex flex-wrap gap-2 text-xs text-slate-400">
          {[['lobby', 'Preparar caso'], ['voting', 'Votar'], ['auditing', 'Investigar'], ['verdict', 'Resultado']].map(([status, label]) => (
            <span key={status} aria-current={room.status === status ? "step" : undefined} className={room.status === status ? "rounded-full bg-purple-950 px-3 py-2 font-semibold text-purple-200" : "px-3 py-2"}>{label}</span>
          ))}
        </nav>}
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

        {/* Vista 1.5: Sala en espera / Preparación del siguiente caso (Multijugador persistente) */}
        {activeRoomCode && room && room.status === "lobby" && (
          <InRoomLobby
            roomCode={room.code}
            isHost={isHost}
            nickname={effectiveUserName}
            onLaunchNextClaim={handleLaunchNextClaim}
          />
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
                  smokePercentage: liveCounts?.smokePercentage ?? 50,
                  legitPercentage: liveCounts?.legitPercentage ?? 50,
                  recentVoters: liveCounts?.recentVoters || [],
                }}
                myVoteChoice={myVote?.choice as "SMOKE" | "LEGIT" | undefined}
                isVoting={isVoting || myVote === undefined || isGuestModalOpen}
                isStartingAudit={isAuditingLocally}
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
        {activeRoomCode && room && (room.status === "auditing") && (
          <div className="space-y-6">
            <WorkflowProgress
              currentStep={investigation?.currentStep || "extracting_claims"}
              progressPercentage={investigation?.progressPercentage ?? 0}
              simulatedFailureTriggered={investigation?.simulatedFailureTriggered || false}
              retryCount={investigation?.retryCount || 0}
              onTriggerFailureSimulation={handleTriggerFailureSimulation}
              isHost={isHost}
              workflowStatus={investigation?.workflowStatus}
              workflowRunId={investigation?.workflowRunId}
              workflowError={investigation?.workflowError}
              failureRequested={investigation?.failureRequested}
              onRetry={handleLaunchInvestigation}
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
              isHost={isHost}
              onNewClaim={handlePrepareNextClaim}
              onLeaveRoom={handleLeaveRoom}
              onReauditClaim={handleLaunchNextClaim}
            />
            {liveEvidence && liveEvidence.length > 0 && (
              <EvidenceBoard evidenceList={liveEvidence} researchPlan={investigation?.researchPlan} />
            )}
          </div>
        )}
      </main>

      {/* Modal Acreditación de Jurado Invitado */}
      <GuestJoinModal
        isOpen={isGuestModalOpen && Boolean(room)}
        onCancel={nickname ? () => setIsGuestModalOpen(false) : handleLeaveRoom}
        roomCode={activeRoomCode || ""}
        onConfirmNickname={handleConfirmGuestNickname}
        initialNickname={nickname}
      />

      {/* Modal RevenueCat Test Store */}
      <ProPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        hasProAccess={hasProAccess}
        onPurchaseSuccess={handlePurchaseSuccess}
        onRefreshAccess={handleRefreshAccess}
        purchaseAvailable={revenueCat.isConfigured}
        setupError={revenueCat.error}
        purchaseToken={purchaseToken}
        investigationId={investigation?.currentStep === "completed" ? investigation._id : undefined}
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
            <span className="text-amber-400">● Dossier de Due Diligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
