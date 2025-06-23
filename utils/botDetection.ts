// Bot detection utilities

export interface BotDetectionConfig {
  minTypingSpeed: number; // minimum time between keystrokes in ms
  maxTypingSpeed: number; // maximum time between keystrokes in ms
  minFormFillTime: number; // minimum time to fill form in ms
  maxFormFillTime: number; // maximum time to fill form in ms
  suspiciousPatterns: string[]; // suspicious input patterns
}

export class BotDetector {
  private config: BotDetectionConfig;
  private keystrokeTimes: number[] = [];
  private formStartTime: number = 0;
  private inputHistory: string[] = [];

  constructor(config: BotDetectionConfig) {
    this.config = config;
  }

  // Start tracking form interaction
  startFormTracking() {
    this.formStartTime = Date.now();
    this.keystrokeTimes = [];
    this.inputHistory = [];
  }

  // Track keystroke timing
  trackKeystroke() {
    const now = Date.now();
    this.keystrokeTimes.push(now);
    
    // Keep only last 10 keystrokes for analysis
    if (this.keystrokeTimes.length > 10) {
      this.keystrokeTimes.shift();
    }
  }

  // Track input changes
  trackInput(input: string) {
    this.inputHistory.push(input);
    
    // Keep only last 5 inputs for analysis
    if (this.inputHistory.length > 5) {
      this.inputHistory.shift();
    }
  }

  // Check for suspicious typing patterns
  checkTypingPattern(): boolean {
    if (this.keystrokeTimes.length < 3) return false;

    const intervals: number[] = [];
    for (let i = 1; i < this.keystrokeTimes.length; i++) {
      intervals.push(this.keystrokeTimes[i] - this.keystrokeTimes[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Check if typing is too fast or too slow
    if (avgInterval < this.config.minTypingSpeed || avgInterval > this.config.maxTypingSpeed) {
      return true; // Suspicious
    }

    // Check for too consistent timing (bot-like)
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    if (variance < 100) { // Very low variance suggests bot
      return true;
    }

    return false;
  }

  // Check form fill time
  checkFormFillTime(): boolean {
    const fillTime = Date.now() - this.formStartTime;
    return fillTime < this.config.minFormFillTime || fillTime > this.config.maxFormFillTime;
  }

  // Check for suspicious input patterns
  checkInputPatterns(input: string): boolean {
    const lowerInput = input.toLowerCase();
    
    for (const pattern of this.config.suspiciousPatterns) {
      if (lowerInput.includes(pattern)) {
        return true;
      }
    }

    // Check for repeated characters (common in bot inputs)
    const repeatedChars = /(.)\1{3,}/;
    if (repeatedChars.test(input)) {
      return true;
    }

    // Check for sequential characters (like "abcd" or "1234")
    const sequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
    if (sequential.test(input)) {
      return true;
    }

    return false;
  }

  // Check for copy-paste behavior
  checkCopyPasteBehavior(): boolean {
    if (this.inputHistory.length < 2) return false;

    // Check if large chunks of text were added at once
    for (let i = 1; i < this.inputHistory.length; i++) {
      const prevLength = this.inputHistory[i - 1].length;
      const currLength = this.inputHistory[i].length;
      
      if (currLength - prevLength > 20) { // Large text addition
        return true;
      }
    }

    return false;
  }

  // Comprehensive bot detection
  detectBot(): { isBot: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (this.checkTypingPattern()) {
      reasons.push('Suspicious typing pattern');
    }

    if (this.checkFormFillTime()) {
      reasons.push('Unusual form fill time');
    }

    if (this.checkCopyPasteBehavior()) {
      reasons.push('Copy-paste behavior detected');
    }

    return {
      isBot: reasons.length > 0,
      reasons
    };
  }

  // Reset tracking data
  reset() {
    this.keystrokeTimes = [];
    this.formStartTime = 0;
    this.inputHistory = [];
  }
}

// Default bot detection configuration
export const defaultBotConfig: BotDetectionConfig = {
  minTypingSpeed: 50, // 50ms between keystrokes minimum
  maxTypingSpeed: 2000, // 2 seconds between keystrokes maximum
  minFormFillTime: 3000, // 3 seconds minimum to fill form
  maxFormFillTime: 300000, // 5 minutes maximum to fill form
  suspiciousPatterns: [
    'test',
    'bot',
    'spam',
    'admin',
    'root',
    'user',
    'guest',
    'demo',
    'sample',
    'example',
    'fake',
    'dummy',
    'temp',
    'temporary',
    'asdf',
    'qwerty',
    '123456',
    'password',
    'admin123',
    'test123',
    'user123',
    'guest123',
    'demo123',
    'sample123',
    'example123',
    'fake123',
    'dummy123',
    'temp123',
    'temporary123',
  ]
};

// Create a new bot detector instance
export const createBotDetector = (config?: Partial<BotDetectionConfig>) => {
  const finalConfig = { ...defaultBotConfig, ...config };
  return new BotDetector(finalConfig);
}; 