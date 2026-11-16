import StylistOutfitCard from "@/components/StylistOutfitCard";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { GeneratedOutfit } from "@/convex/generateOutfits";
import type { StylistContext } from "@/convex/stylistChat";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string; role: "user" | "assistant"; content: string;
  suggestion?: GeneratedOutfit & { historyId: Id<"outfitHistory"> }; saved?: boolean;
};
type Turn = {
  messages: { role: Message["role"]; content: string }[];
  context: StylistContext;
  feedback?: { historyId: Id<"outfitHistory">; action: "dislike" | "try_another"; eventId: string };
};
const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const initialContext: StylistContext = { occasion: "Casual" };
const starters = [
  { icon: "briefcase-outline" as const, title: "A look for work", prompt: "Put together a smart casual work outfit for cool weather." },
  { icon: "heart-outline" as const, title: "Date-night plans", prompt: "Suggest a date-night outfit for warm weather." },
  { icon: "sunny-outline" as const, title: "Weekend, sorted", prompt: "What should I wear for a relaxed weekend in hot weather?" },
];
const friendlyError = (error: unknown) => error instanceof ConvexError && typeof error.data === "string" ? error.data : "Couldn't send that message. Please try again.";

export default function StylistChat() {
  const chat = useAction(api.stylistChat.sendMessage);
  const recordShown = useMutation(api.outfitHistory.recordShown);
  const logFeedback = useMutation(api.outfitHistory.logFeedback);
  const saveOutfit = useMutation(api.outfits.saveOutfit);
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<StylistContext>(initialContext);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<FlatList<Message>>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const lastTurn = useRef<Turn | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function execute(turn: Turn) {
    if (busy.current) return;
    busy.current = true;
    lastTurn.current = turn;
    setSending(true);
    setError(null);
    try {
      if (turn.feedback) await logFeedback(turn.feedback);
      const result = await chat({ messages: turn.messages, context: turn.context });
      if (!mounted.current) return;
      let suggestion: Message["suggestion"];
      if (result.suggestion) {
        const historyId = await recordShown({ ...result.suggestion, eventId: uniqueId() });
        suggestion = { ...result.suggestion, historyId };
      }
      if (!mounted.current) return;
      setMessages(previous => [...previous, { id: uniqueId(), role: "assistant", content: result.reply, ...(suggestion && { suggestion }) }]);
      setContext(result.context);
      lastTurn.current = null;
    } catch (error) {
      if (mounted.current) setError(friendlyError(error));
    } finally {
      busy.current = false;
      if (mounted.current) setSending(false);
    }
  }

  function send(text = input, feedback?: Turn["feedback"], selectedContext = context) {
    const content = text.trim();
    if (!content || content.length > 2000 || busy.current) return;
    const userMessage: Message = { id: uniqueId(), role: "user", content };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    // Keep a bounded recent conversation; explicit context preserves weather/vibe.
    const recent = next.slice(-20).map(({ role, content }) => ({ role, content }));
    while (recent.length > 1 && recent.reduce((sum, message) => sum + message.content.length, 0) > 16000) recent.shift();
    void execute({ messages: recent, context: selectedContext, ...(feedback && { feedback }) });
  }

  function another(message: Message, action: "dislike" | "try_another") {
    const suggestion = message.suggestion;
    if (!suggestion) return;
    const text = action === "dislike"
      ? `That isn't my style. Suggest a different ${suggestion.occasion} outfit for ${suggestion.weather} weather.`
      : `Show me another ${suggestion.occasion} outfit for ${suggestion.weather} weather.`;
    // Generated chat suggestions always have one of these validated weather values.
    const selectedContext: StylistContext = { occasion: suggestion.occasion, weather: suggestion.weather as NonNullable<StylistContext["weather"]> };
    send(text, { historyId: suggestion.historyId, action, eventId: uniqueId() }, selectedContext);
  }

  async function save(message: Message) {
    if (!message.suggestion || message.saved || busy.current) return;
    busy.current = true;
    setSaving(message.id);
    try {
      await saveOutfit({ historyId: message.suggestion.historyId, eventId: uniqueId() });
      if (mounted.current) setMessages(previous => previous.map(item => item.id === message.id ? { ...item, saved: true } : item));
    } catch (error) {
      if (mounted.current) Alert.alert("Couldn't save outfit", friendlyError(error));
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(null);
    }
  }

  function newChat() {
    if (busy.current || !messages.length) return;
    Alert.alert("Start a new chat?", "This clears the conversation on this screen. Your saved outfits stay in your collection.", [
      { text: "Cancel", style: "cancel" },
      { text: "New chat", onPress: () => { setMessages([]); setContext(initialContext); setInput(""); setError(null); lastTurn.current = null; } },
    ]);
  }
  const disabled = sending || saving !== null;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerIdentity}>
          <Text style={styles.headerTitle}>ZWAG stylist</Text>
          <View style={styles.status}><View style={styles.dot} /><Text style={styles.headerSubtitle}>A little inspiration, made personal</Text></View>
        </View>
        <TouchableOpacity accessibilityLabel="Start a new chat" accessibilityRole="button" style={styles.headerButton} onPress={newChat} disabled={disabled || !messages.length}>
          <Ionicons name="create-outline" size={21} color={disabled || !messages.length ? COLORS.textDisabled : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <FlatList
          ref={list} data={messages} keyExtractor={message => message.id} keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.transcript, !messages.length && styles.emptyTranscript]}
          onContentSizeChange={() => { if (messages.length) list.current?.scrollToEnd({ animated: true }); }}
          ListEmptyComponent={
            <View style={styles.intro}>
              <View style={styles.heroIcon}><Ionicons name="sparkles-outline" size={32} color={COLORS.accent} /></View>
              <Text style={styles.eyebrow}>GOOD STYLE STARTS WITH A CONVERSATION</Text>
              <Text style={styles.title}>What are we{"\n"}dressing for?</Text>
              <Text style={styles.description}>Tell me the occasion, the weather, and your vibe. We’ll find a look in your closet.</Text>
              <View style={styles.starters}>{starters.map(starter => (
                <TouchableOpacity key={starter.title} accessibilityRole="button" style={styles.starter} onPress={() => send(starter.prompt)} disabled={disabled}>
                  <Ionicons name={starter.icon} size={21} color={COLORS.accent} />
                  <Text style={styles.starterText}>{starter.title}</Text>
                  <Ionicons name="arrow-up-outline" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}</View>
            </View>
          }
          renderItem={({ item }) => item.role === "user" ? (
            <View style={styles.userBubble}><Text selectable style={styles.userText}>{item.content}</Text></View>
          ) : (
            <View style={styles.assistantMessage}>
              <View style={styles.assistantLabel}><Ionicons name="sparkles" size={13} color={COLORS.accent} /><Text style={styles.assistantName}>ZWAG</Text></View>
              <Text selectable style={styles.assistantText}>{item.content}</Text>
              {item.suggestion && <StylistOutfitCard outfit={item.suggestion.outfit} disabled={disabled} saving={saving === item.id} saved={!!item.saved} onSave={() => { void save(item); }} onDislike={() => another(item, "dislike")} onAnother={() => another(item, "try_another")} />}
            </View>
          )}
          ListFooterComponent={sending ? <View style={styles.thinking}><ActivityIndicator size="small" color={COLORS.accent} /><Text style={styles.thinkingText}>Your stylist is thinking…</Text></View> : null}
        />
        {error && <View style={styles.errorBanner}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => { if (lastTurn.current) void execute(lastTurn.current); }} disabled={disabled} style={styles.retry}><Text style={styles.retryText}>Retry</Text></TouchableOpacity></View>}
        <View style={styles.composerArea}>
          <View style={styles.composer}>
            <TextInput accessibilityLabel="Message your stylist" placeholder="Ask about an outfit…" placeholderTextColor={COLORS.textDisabled} value={input} onChangeText={setInput} multiline maxLength={2000} style={styles.input} editable={!disabled} />
            <TouchableOpacity accessibilityLabel="Send message" accessibilityRole="button" onPress={() => send()} disabled={disabled || !input.trim()} style={[styles.sendButton, (disabled || !input.trim()) && styles.sendDisabled]}>
              <Ionicons name="arrow-up" size={22} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.composerNote}>Your closet. Your style. A fresh perspective.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.primaryBackground }, body: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E9EAE6", gap: 8 },
  headerButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" }, headerIdentity: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.4, color: COLORS.textPrimary },
  status: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 }, dot: { width: 5, height: 5, backgroundColor: COLORS.accent, borderRadius: 3 },
  headerSubtitle: { fontSize: 10, color: COLORS.textSecondary },
  transcript: { padding: 20, paddingBottom: 28, gap: 22 }, emptyTranscript: { flexGrow: 1, justifyContent: "center" },
  intro: { paddingVertical: 20 }, heroIcon: { width: 70, height: 70, borderRadius: 24, backgroundColor: "#E9EEE7", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  eyebrow: { fontSize: 9, letterSpacing: 1.6, fontWeight: "700", color: COLORS.accent, marginBottom: 14 },
  title: { fontSize: 39, lineHeight: 44, letterSpacing: -1.8, fontWeight: "600", color: COLORS.textPrimary },
  description: { fontSize: 15, lineHeight: 23, color: COLORS.textSecondary, marginTop: 16, maxWidth: 315 },
  starters: { marginTop: 28, gap: 10 }, starter: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, backgroundColor: COLORS.pureWhite },
  starterText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: "500" },
  userBubble: { alignSelf: "flex-end", maxWidth: "88%", borderRadius: 20, borderBottomRightRadius: 5, paddingHorizontal: 17, paddingVertical: 13, backgroundColor: COLORS.accent },
  userText: { color: "white", fontSize: 15, lineHeight: 22 },
  assistantMessage: { alignSelf: "stretch" }, assistantLabel: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  assistantName: { fontSize: 10, fontWeight: "700", letterSpacing: 1.3, color: COLORS.accent }, assistantText: { fontSize: 15, lineHeight: 24, color: COLORS.textPrimary },
  thinking: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }, thinkingText: { color: COLORS.textSecondary, fontSize: 13 },
  composerArea: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, borderTopWidth: 1, borderTopColor: "#E9EAE6" },
  composer: { flexDirection: "row", alignItems: "flex-end", borderRadius: 24, borderWidth: 1, borderColor: "#DADDD7", backgroundColor: COLORS.pureWhite, padding: 7, paddingLeft: 16, minHeight: 54 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingTop: 9, paddingBottom: 9, paddingRight: 8, maxHeight: 120 },
  sendButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.accent, justifyContent: "center", alignItems: "center" }, sendDisabled: { opacity: 0.3 },
  composerNote: { fontSize: 9, color: COLORS.textDisabled, textAlign: "center", marginTop: 9 },
  errorBanner: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: "#FFF0ED", flexDirection: "row", alignItems: "center", gap: 10 },
  errorText: { flex: 1, color: COLORS.error, fontSize: 12, lineHeight: 18 }, retry: { padding: 8 }, retryText: { color: COLORS.error, fontWeight: "700", fontSize: 12 },
});
