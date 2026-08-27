export class VoiceGuardian {
  constructor() {
    this.accessMode = 'Owner Only'; // 'Owner Only', 'Owner + Family', 'Everyone'
    this.matchThreshold = 60; // 40% to 80%
    this.ownerProfile = { trained: true, voiceId: 'flaxy_primary' };
  }

  verifyVoice(matchScore) {
    if (this.accessMode === 'Everyone') return { allowed: true };
    return { allowed: matchScore >= this.matchThreshold, matchScore };
  }
}
