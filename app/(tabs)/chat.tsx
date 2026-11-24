// This file runs on the phone. It owns the conversation UI and calls Convex;
// the backend in convex/stylistChat.ts handles the model and outfit selection.
import StylistOutfitCard from "@/components/StylistOutfitCard";
import { AI_CONSENT_DISCLOSURE, AI_CONSENT_VERSION } from "@/constants/aiConsent";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { readLocalChat, saveLocalChat } from "@/lib/localChatStorage";
import { COLORS, SHADOWS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
// `import type` is for TypeScript checking; it does not run backend code here.
import type { Id } from "@/convex/_generated/dataModel";
import type { GeneratedOutfit } from "@/convex/generateOutfits";
import type { StylistContext } from "@/convex/stylistChat";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";

// One entry displayed in the transcript. `?` marks optional fields: an ordinary
// text reply has no suggestion, and only saved outfit cards need saved=true.
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  // `&` combines the generated outfit data with the ID of its shown-history row.
  suggestion?: GeneratedOutfit & { historyId: Id<"outfitHistory"> };
  saved?: boolean;
};
// Keep the exact request and feedback event together so Retry replays one turn.
type Turn = {
  // Send role/content to the model; local UI IDs and saved flags stay on the phone.
  messages: { role: Message["role"]; content: string }[];
  context: StylistContext;
  feedback?: {
    historyId: Id<"outfitHistory">;
    action: "dislike" | "try_another";
    eventId: string;
  };
};
// Local message IDs identify bubbles; event IDs help the backend deduplicate
// feedback retries. Convex generates its own IDs for stored database rows.
const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
// Start with a casual occasion; later turns can refine the occasion and style.
const initialContext: StylistContext = { occasion: "Casual" };
// Only expose deliberate string errors from Convex; use a generic message for
// unexpected exceptions. `unknown` requires checking an error before using it.
const friendlyError = (error: unknown) =>
  error instanceof ConvexError && typeof error.data === "string"
    ? error.data
    : "Couldn't send that message. Please try again.";

export default function ChatScreen() {
  const { userId } = useAuth();
  const { status } = useAccountStatus();
  const setConsent = useMutation(api.users.setAiConsent);
  const [savingConsent, setSavingConsent] = useState(false);

  async function allowConsent() {
    if (savingConsent) return;
    setSavingConsent(true);
    try {
      await setConsent({ allowed: true, version: AI_CONSENT_VERSION });
    } catch (error) {
      Alert.alert(
        "Could not update permission",
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "Check your connection and try again.",
      );
    } finally {
      setSavingConsent(false);
    }
  }

  if (!userId || !status?.canUseApp) return null;
  if (!status.aiConsent) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.consent}>
          <View style={styles.consentCard}>
            <View style={styles.heroIcon} accessible={false}>
              <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.pureWhite} />
            </View>
            <Text accessibilityRole="header" style={styles.title}>Chat with Zwag</Text>
            <Text style={styles.description}>{AI_CONSENT_DISCLOSURE}</Text>
            <View style={styles.consentActions}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: savingConsent, busy: savingConsent }}
                disabled={savingConsent}
                style={[styles.consentButton, styles.consentPrimary, savingConsent && styles.consentBusy]}
                onPress={() => void allowConsent()}
              >
                <Text style={styles.consentPrimaryText}>
                  {savingConsent ? "Saving permission…" : "Allow and continue"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: savingConsent }}
                disabled={savingConsent}
                style={[styles.consentButton, styles.consentSecondary]}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.consentSecondaryText}>Not now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <ChatSession key={userId} userId={userId} />;
}

export function ChatSession({ userId }: { userId: string }) {
  // These hooks return callable backend references; declaring them sends no chat
  // request. Actions can call OpenAI; mutations write history, feedback, or saves.
  const chat = useAction(api.stylistChat.sendMessage);
  const recordShown = useMutation(api.outfitHistory.recordShown);
  const logFeedback = useMutation(api.outfitHistory.logFeedback);
  const saveOutfit = useMutation(api.outfits.saveOutfit);
  // State survives re-renders while this component stays mounted. Calling a setter
  // schedules a render so the UI reflects the new value. The transcript is local,
  // not loaded from a chat database when this screen mounts.
  const [messages, setMessages] = useState<Message[]>([]);

  // Context carries occasion/style across follow-ups, even if old messages are removed from the bounded request sent to the backend.
  const [context, setContext] = useState<StylistContext>(initialContext);

  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  // Restore the previous conversation when chat opens.
  useEffect(() => {
    let active = true;

    const restoreChat = async () => {
      try {
        const raw = await readLocalChat(userId);
        if (!active) return;

        if (raw !== null) {
          const saved = JSON.parse(raw) as {
            messages: Message[];
            context: StylistContext;
          };

          if (
            !Array.isArray(saved?.messages) ||
            typeof saved.context?.occasion !== "string"
          ) {
            throw new Error("Invalid saved conversation");
          }

          setMessages(saved.messages);
          setContext(saved.context);
        }
        setStorageStatus("ready");
      } catch {
        if (active) setStorageStatus("error");
      }
    };

    void restoreChat();
    return () => {
      active = false;
    };
  }, [userId]);
  useEffect(() => {
    if (storageStatus !== "ready") return;

    void saveLocalChat(
      userId,
      JSON.stringify({ messages, context }),
    ).catch((error) => {
      console.warn("Could not save chat", error);
    });
  }, [userId, storageStatus, messages, context]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  // Store the message ID being saved so only that outfit card shows a save spinner.
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Refs hold mutable values without triggering renders. `list.current` gives us
  // the rendered list's scroll methods; the other refs coordinate async requests.
  const list = useRef<FlatList<Message>>(null);
  // A ref blocks rapid repeat taps immediately, before React updates button state.
  const busy = useRef(false);
  const mounted = useRef(true);
  const lastTurn = useRef<Turn | null>(null); // Retain a failed request for Retry.
  // Set up when the component mounts; cleanup runs when it unmounts. This guards
  // later UI updates but does not cancel a network request already in flight.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Shared request pipeline for Send, Try another, dislike, and Retry. `send`
  // prepares the turn; `execute` performs the asynchronous backend operations.
  async function execute(turn: Turn) {
    if (busy.current) return;
    busy.current = true;
    lastTurn.current = turn;
    setSending(true);
    setError(null);
    try {
      // Persist the reaction first. Its event ID survives Retry, so a failed model
      // request cannot cause the same dislike/Try Another click to be logged twice.
      if (turn.feedback) await logFeedback(turn.feedback);
      // `await` waits for Convex's reply without blocking the phone's UI thread.
      const result = await chat({
        messages: turn.messages,
        context: turn.context,
      });
      if (!mounted.current) return;
      let suggestion: Message["suggestion"];
      if (result.suggestion) {
        // The server rechecks ownership, item availability, and repeats before
        // this card enters the transcript. Its history ID also anchors feedback.
        const historyId = await recordShown({
          ...result.suggestion,
          eventId: uniqueId(),
        });
        suggestion = { ...result.suggestion, historyId };
      }
      // Requests can finish after the user navigates away from this screen.
      if (!mounted.current) return;
      // The functional setter receives the latest transcript. Spread (`...`)
      // copies existing messages into a new array before appending the reply.
      setMessages((previous) => [
        ...previous,
        {
          id: uniqueId(),
          role: "assistant",
          content: result.reply,
          ...(suggestion && { suggestion }), // Include the field only if present.
        },
      ]);
      setContext(result.context);
      lastTurn.current = null; // Successful turns no longer need Retry.
    } catch (error) {
      if (mounted.current) setError(friendlyError(error));
    } finally {
      // Runs after success, failure, or an early return inside try.
      busy.current = false;
      if (mounted.current) setSending(false);
    }
  }

  // A normal Send click uses the current input/context. Outfit-card actions can
  // supply their own follow-up text, feedback, and the clicked outfit's context.
  function send(
    text = input,
    feedback?: Turn["feedback"],
    selectedContext = context,
  ) {
    const content = text.trim();
    if (!content || content.length > 2000 || busy.current) return;
    const userMessage: Message = { id: uniqueId(), role: "user", content };
    const next = [...messages, userMessage];
    // Show the user's bubble immediately, before the backend has answered.
    setMessages(next);
    setInput("");
    // Keep a bounded recent conversation; explicit context preserves occasion/vibe.
    const recent = next
      .slice(-20)
      .map(({ role, content }) => ({ role, content }));
    // Keep at most 20 messages and 16,000 characters in the request. Removing
    // entries here affects only `recent`; the displayed transcript remains intact.
    while (
      recent.length > 1 &&
      recent.reduce((sum, message) => sum + message.content.length, 0) > 16000
    )
      recent.shift();
    // Start the async operation without awaiting it in this synchronous handler.
    // `void` discards its Promise; execute handles its own request errors.
    void execute({
      messages: recent,
      context: selectedContext,
      ...(feedback && { feedback }),
    });
  }

  // Convert an outfit-card reaction into feedback plus a conversational request.
  // Use this card's occasion/style, which may differ from the latest chat turn.
  function another(message: Message, action: "dislike" | "try_another") {
    const suggestion = message.suggestion;
    if (!suggestion) return;
    const text =
      action === "dislike"
        ? `That isn't my style. Suggest a different ${suggestion.occasion} outfit.`
        : `Show me another ${suggestion.occasion} outfit.`;
    const selectedContext: StylistContext = {
      occasion: suggestion.occasion,
    };
    send(
      text,
      { historyId: suggestion.historyId, action, eventId: uniqueId() },
      selectedContext,
    );
  }

  // Save the shown-history reference, not a client-supplied list of garment IDs.
  // The backend resolves and validates that history entry before storing a save.
  async function save(message: Message) {
    if (!message.suggestion || message.saved || busy.current) return;
    busy.current = true;
    setSaving(message.id);
    try {
      await saveOutfit({
        historyId: message.suggestion.historyId,
        eventId: uniqueId(),
      });
      if (mounted.current)
        setMessages((previous) =>
          // Replace only the saved message; leave all other entries unchanged.
          previous.map((item) =>
            item.id === message.id ? { ...item, saved: true } : item,
          ),
        );
    } catch (error) {
      if (mounted.current)
        Alert.alert("Couldn't save outfit", friendlyError(error));
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(null);
    }
  }

  // Derive UI availability from state instead of keeping a separate flag in sync.
  const disabled = sending || saving !== null;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header: return to the closet or confirm clearing this conversation. */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circularBackButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.pureWhite} />
        </TouchableOpacity>
      </View>
      {/* Adjust the content area when the software keyboard opens. */}
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* FlatList renders transcript rows. Its ref lets us scroll to the end
            when content grows; keyExtractor gives every row a stable identity. */}
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(message) => message.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.transcript,
            !messages.length && styles.emptyTranscript,
          ]}
          onContentSizeChange={() => {
            if (messages.length) list.current?.scrollToEnd({ animated: true });
          }}
          // Show the introduction while the transcript has no messages.
          ListEmptyComponent={
            <View style={styles.intro}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={32}
                  color={COLORS.pureWhite}
                />
              </View>
              <Text style={styles.eyebrow}>Zwag</Text>
              <Text style={styles.title}>What are we{"\n"}dressing for?</Text>
              <Text style={styles.description}>
                Tell me the occasion and your vibe. We’ll find a look in your
                closet.
              </Text>
              <View>
                {[
                  "Build me a casual outfit",
                  "What should I wear to dinner?",
                  "What colors go well with navy?",
                ].map((prompt) => (
                  <TouchableOpacity
                    key={prompt}
                    accessibilityRole="button"
                    style={styles.chatStarterButton}
                    disabled={disabled}

                    onPress={() => send(prompt)}
                  >
                    <Text style={styles.chatStarterText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          // Each row chooses the user bubble or assistant text/card from its role.
          renderItem={({ item }) =>
            item.role === "user" ? (
              <View style={styles.userBubble}>
                <Text selectable style={styles.userText}>
                  {item.content}
                </Text>
              </View>
            ) : (
              <View style={styles.assistantMessage}>
                <View style={styles.assistantLabel}>
                  <Ionicons name="sparkles" size={13} color={COLORS.black} />
                  <Text style={styles.assistantName}>Zwag</Text>
                </View>
                <Text selectable style={styles.assistantText}>
                  {item.content}
                </Text>
                {item.suggestion && (
                  // The card renders garment data and calls these parent handlers
                  // when tapped. Arrow functions defer the handlers until the tap.
                  <StylistOutfitCard
                    outfit={item.suggestion.outfit}
                    disabled={disabled}
                    saving={saving === item.id}
                    saved={!!item.saved}
                    onSave={() => {
                      void save(item);
                    }}
                    onDislike={() => another(item, "dislike")}
                    onAnother={() => another(item, "try_another")}
                  />
                )}
              </View>
            )
          }
          // Waiting indicator below the conversation while a turn is in progress.
          ListFooterComponent={
            sending ? (
              <View style={styles.thinking}>
                <ActivityIndicator size="small" color={COLORS.black} />
                <Text style={styles.thinkingText}>
                  Zwag is thinking…
                </Text>
              </View>
            ) : undefined
          }
        />
        {/* Retry reuses lastTurn directly so it doesn't append a second user bubble. */}
        {error && (
          <View style={styles.errorBanner}>
            <Text accessibilityRole="alert" style={styles.errorText}>
              {error}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                if (lastTurn.current) void execute(lastTurn.current);
              }}
              disabled={disabled}
              style={styles.retry}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Controlled input: typing updates `input`; its value prop displays it.
            Send is disabled for blank text and while another operation is busy. */}
        <View style={styles.composerArea}>
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Message Zwag"
              placeholder="Ask about an outfit…"
              placeholderTextColor={COLORS.textDisabled}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              style={styles.input}
              editable={!disabled}
            />
            <TouchableOpacity
              accessibilityLabel="Send message"
              accessibilityRole="button"
              onPress={() => send()}
              disabled={disabled || !input.trim()}
              style={[
                styles.sendButton,
                (disabled || !input.trim()) && styles.sendDisabled,
              ]}
            >
              <Ionicons name="arrow-up" size={22} color={COLORS.pureWhite} />
            </TouchableOpacity>
          </View>
          <Text style={styles.composerNote}>
            Your closet. Your style. A fresh perspective.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Visual presentation only. `flex: 1` fills available space; row/column alignment,
// padding, and colors determine layout and appearance, not backend behavior.
const styles = StyleSheet.create({
  consent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  consentCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 440,
    backgroundColor: COLORS.pureWhite,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.sm,
  },
  consentActions: { gap: 10, marginTop: 24 },
  consentButton: { minHeight: 48, padding: 12, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  consentPrimary: { backgroundColor: COLORS.black },
  consentSecondary: { borderColor: COLORS.border, borderWidth: 1 },
  consentBusy: { opacity: 0.65 },
  consentPrimaryText: { color: COLORS.pureWhite, fontSize: 15, fontWeight: "700", textAlign: "center" },
  consentSecondaryText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "600", textAlign: "center" },
  screen: { flex: 1, backgroundColor: COLORS.primaryBackground },
  body: { flex: 1 },
  header: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIdentity: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: COLORS.textPrimary,
  },
  status: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  dot: { width: 5, height: 5, backgroundColor: COLORS.black, borderRadius: 3 },
  headerSubtitle: { fontSize: 10, color: COLORS.textSecondary },
  // Conversation spacing and the introduction shown before the first message.
  transcript: { padding: 20, paddingBottom: 28, gap: 22 },
  emptyTranscript: { flexGrow: 1, justifyContent: "center" },
  intro: { paddingVertical: 20 },
  heroIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 14,
  },
  title: {
    fontSize: 39,
    lineHeight: 44,
    letterSpacing: -1.8,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textSecondary,
    marginTop: 16,
    maxWidth: 315,
  },
  // Right-aligned user bubbles, assistant replies, and the waiting indicator.
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "88%",
    borderRadius: 20,
    borderBottomRightRadius: 5,
    paddingHorizontal: 17,
    paddingVertical: 13,
    backgroundColor: COLORS.black,
  },
  userText: { color: COLORS.pureWhite, fontSize: 15, lineHeight: 22 },
  assistantMessage: { alignSelf: "stretch" },
  assistantLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  assistantName: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
    color: COLORS.black,
  },
  assistantText: { fontSize: 15, lineHeight: 24, color: COLORS.textPrimary },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  thinkingText: { color: COLORS.textSecondary, fontSize: 13 },
  // Bottom message input and Send button.
  composerArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.pureWhite,
    padding: 7,
    paddingLeft: 16,
    minHeight: 54,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingTop: 9,
    paddingBottom: 9,
    paddingRight: 8,
    maxHeight: 120,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  sendDisabled: { opacity: 0.3 },
  composerNote: {
    fontSize: 9,
    color: COLORS.textDisabled,
    textAlign: "center",
    marginTop: 9,
  },
  chatStarters: {},
  chatStarterButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatStarterText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  // Request-failure message and Retry control.
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circularBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkGray,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  errorText: { flex: 1, color: COLORS.textPrimary, fontSize: 12, lineHeight: 18 },
  retry: { padding: 8 },
  retryText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 12 },
});
