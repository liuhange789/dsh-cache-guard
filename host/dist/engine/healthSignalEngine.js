import { toSummary } from '../model/sessionSnapshot.ts';
import { createNoneSignal, createGreenSignal, createYellowSignal, createRedSignal, } from '../model/healthSignal.ts';
export function compute(input) {
    const { snapshots, profile, toolsetChanged, systemPromptRewrite, now } = input;
    const latest = snapshots[snapshots.length - 1];
    if (!latest) {
        return createNoneSignal(now);
    }
    const summary = toSummary(latest);
    const redReason = checkRed(snapshots, profile);
    if (redReason) {
        return createRedSignal(summary, now);
    }
    const yellowReason = checkYellow(latest, profile, toolsetChanged, systemPromptRewrite, snapshots);
    if (yellowReason) {
        return createYellowSignal(yellowReason, summary, now);
    }
    if (checkGreen(snapshots, profile)) {
        return createGreenSignal(summary, now);
    }
    return createNoneSignal(now);
}
function checkRed(snapshots, profile) {
    if (snapshots.length < 3)
        return false;
    const last3 = snapshots.slice(-3);
    const allToolCalls = last3.every((s) => s.consecutiveToolCalls >= 1);
    if (!allToolCalls)
        return false;
    const totalDelta = last3.reduce((sum, s) => sum + s.contextTokenDelta, 0);
    const avgDelta = totalDelta / 3;
    return avgDelta > profile.bloatThreshold;
}
function checkYellow(latest, profile, toolsetChanged, systemPromptRewrite, snapshots) {
    if (systemPromptRewrite) {
        return 'system_prompt_rewrite';
    }
    if (toolsetChanged) {
        return 'toolset_change';
    }
    if (latest.messageCount > profile.messageThreshold) {
        const recent = snapshots.slice(-profile.greenStableFrames);
        const noReuse = recent.every((s) => s.contextTokenDelta > 0 && s.contextTokenDelta < profile.bloatThreshold);
        if (noReuse) {
            return 'message_over_threshold';
        }
    }
    return null;
}
function checkGreen(snapshots, profile) {
    if (snapshots.length < profile.greenStableFrames)
        return false;
    const recent = snapshots.slice(-profile.greenStableFrames);
    for (let i = 1; i < recent.length; i++) {
        if (recent[i].messageCount < recent[i - 1].messageCount)
            return false;
    }
    const first = recent[0];
    const allSameToolset = recent.every((s) => s.toolsetHash === first.toolsetHash);
    if (!allSameToolset)
        return false;
    const allSamePrompt = recent.every((s) => s.systemPromptHash === first.systemPromptHash);
    if (!allSamePrompt)
        return false;
    return true;
}
//# sourceMappingURL=healthSignalEngine.js.map