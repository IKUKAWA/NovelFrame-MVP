import { Shape, Keyframe } from '../store/appStore';

export type EasingFunction = (t: number) => number;

export const easingFunctions: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 2),
  'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  'ease-in-cubic': (t: number) => t * t * t,
  'ease-out-cubic': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out-cubic': (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  'ease-in-quart': (t: number) => t * t * t * t,
  'ease-out-quart': (t: number) => 1 - Math.pow(1 - t, 4),
  'ease-in-out-quart': (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  'bounce-out': (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  'elastic-out': (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export interface AnimationTrack {
  shapeId: string;
  keyframes: Keyframe[];
}

export class AnimationEngine {
  private tracks: Map<string, AnimationTrack> = new Map();

  addKeyframe(keyframe: Keyframe) {
    const track = this.tracks.get(keyframe.shapeId) || {
      shapeId: keyframe.shapeId,
      keyframes: [],
    };

    // Remove existing keyframe at the same time
    track.keyframes = track.keyframes.filter(kf => kf.time !== keyframe.time);
    
    // Add new keyframe and sort by time
    track.keyframes.push(keyframe);
    track.keyframes.sort((a, b) => a.time - b.time);

    this.tracks.set(keyframe.shapeId, track);
  }

  removeKeyframe(keyframeId: string) {
    for (const track of this.tracks.values()) {
      track.keyframes = track.keyframes.filter(kf => kf.id !== keyframeId);
      if (track.keyframes.length === 0) {
        this.tracks.delete(track.shapeId);
      }
    }
  }

  getInterpolatedState(shapeId: string, time: number): Partial<Shape> | null {
    const track = this.tracks.get(shapeId);
    if (!track || track.keyframes.length === 0) {
      return null;
    }

    const keyframes = track.keyframes;

    // Find the keyframes to interpolate between
    let prevKeyframe: Keyframe | null = null;
    let nextKeyframe: Keyframe | null = null;

    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].time <= time) {
        prevKeyframe = keyframes[i];
      }
      if (keyframes[i].time > time && !nextKeyframe) {
        nextKeyframe = keyframes[i];
        break;
      }
    }

    // If we're before the first keyframe, return the first keyframe's properties
    if (!prevKeyframe && nextKeyframe) {
      return nextKeyframe.properties;
    }

    // If we're after the last keyframe, return the last keyframe's properties
    if (prevKeyframe && !nextKeyframe) {
      return prevKeyframe.properties;
    }

    // If we have both keyframes, interpolate between them
    if (prevKeyframe && nextKeyframe) {
      const timeDiff = nextKeyframe.time - prevKeyframe.time;
      const progress = timeDiff === 0 ? 0 : (time - prevKeyframe.time) / timeDiff;
      
      // Apply easing function
      const easingFunc = easingFunctions[nextKeyframe.easing] || easingFunctions.linear;
      const easedProgress = easingFunc(progress);

      return this.interpolateProperties(
        prevKeyframe.properties,
        nextKeyframe.properties,
        easedProgress
      );
    }

    return null;
  }

  private interpolateProperties(
    startProps: Partial<Shape>,
    endProps: Partial<Shape>,
    progress: number
  ): Partial<Shape> {
    const interpolated: Partial<Shape> = {};

    // Numeric properties that can be interpolated
    const numericProps: (keyof Shape)[] = [
      'x', 'y', 'width', 'height', 'radius', 'rotation',
      'scaleX', 'scaleY', 'strokeWidth', 'opacity', 'fontSize'
    ];

    for (const prop of numericProps) {
      const startValue = startProps[prop] as number;
      const endValue = endProps[prop] as number;

      if (typeof startValue === 'number' && typeof endValue === 'number') {
        (interpolated as any)[prop] = startValue + (endValue - startValue) * progress;
      } else if (endValue !== undefined) {
        (interpolated as any)[prop] = endValue;
      } else if (startValue !== undefined) {
        (interpolated as any)[prop] = startValue;
      }
    }

    // Color properties (simplified - just switch at 50% progress)
    const colorProps: (keyof Shape)[] = ['fill', 'stroke'];
    for (const prop of colorProps) {
      const startValue = startProps[prop] as string;
      const endValue = endProps[prop] as string;

      if (endValue !== undefined) {
        if (progress < 0.5) {
          (interpolated as any)[prop] = startValue || endValue;
        } else {
          (interpolated as any)[prop] = endValue;
        }
      } else if (startValue !== undefined) {
        (interpolated as any)[prop] = startValue;
      }
    }

    // String properties (switch at 50% progress)
    const stringProps: (keyof Shape)[] = ['text', 'fontFamily'];
    for (const prop of stringProps) {
      const startValue = startProps[prop] as string;
      const endValue = endProps[prop] as string;

      if (endValue !== undefined) {
        if (progress < 0.5) {
          (interpolated as any)[prop] = startValue || endValue;
        } else {
          (interpolated as any)[prop] = endValue;
        }
      } else if (startValue !== undefined) {
        (interpolated as any)[prop] = startValue;
      }
    }

    // Boolean properties (switch at 50% progress)
    const booleanProps: (keyof Shape)[] = ['visible'];
    for (const prop of booleanProps) {
      const startValue = startProps[prop] as boolean;
      const endValue = endProps[prop] as boolean;

      if (endValue !== undefined) {
        if (progress < 0.5) {
          (interpolated as any)[prop] = startValue !== undefined ? startValue : endValue;
        } else {
          (interpolated as any)[prop] = endValue;
        }
      } else if (startValue !== undefined) {
        (interpolated as any)[prop] = startValue;
      }
    }

    return interpolated;
  }

  getAllTracks(): AnimationTrack[] {
    return Array.from(this.tracks.values());
  }

  clearAllTracks() {
    this.tracks.clear();
  }

  updateFromKeyframes(keyframes: Keyframe[]) {
    this.clearAllTracks();
    for (const keyframe of keyframes) {
      this.addKeyframe(keyframe);
    }
  }

  // Generate automatic keyframes for common animations
  generateBounceAnimation(shapeId: string, startTime: number, duration: number, amplitude: number = 50): Keyframe[] {
    const keyframes: Keyframe[] = [];
    const steps = 8;

    for (let i = 0; i <= steps; i++) {
      const time = startTime + (duration * i) / steps;
      const progress = i / steps;
      const bounceOffset = amplitude * Math.sin(progress * Math.PI * 2) * (1 - progress * 0.8);

      keyframes.push({
        id: `bounce-${shapeId}-${i}`,
        time,
        shapeId,
        properties: { y: bounceOffset },
        easing: 'ease-out',
      });
    }

    return keyframes;
  }

  generateRotationAnimation(shapeId: string, startTime: number, duration: number, rotations: number = 1): Keyframe[] {
    const totalRotation = 360 * rotations;
    
    return [
      {
        id: `rotation-${shapeId}-start`,
        time: startTime,
        shapeId,
        properties: { rotation: 0 },
        easing: 'linear',
      },
      {
        id: `rotation-${shapeId}-end`,
        time: startTime + duration,
        shapeId,
        properties: { rotation: totalRotation },
        easing: 'linear',
      },
    ];
  }

  generateScaleAnimation(shapeId: string, startTime: number, duration: number, fromScale: number = 1, toScale: number = 1.5): Keyframe[] {
    const midTime = startTime + duration / 2;
    
    return [
      {
        id: `scale-${shapeId}-start`,
        time: startTime,
        shapeId,
        properties: { scaleX: fromScale, scaleY: fromScale },
        easing: 'ease-out',
      },
      {
        id: `scale-${shapeId}-mid`,
        time: midTime,
        shapeId,
        properties: { scaleX: toScale, scaleY: toScale },
        easing: 'ease-in',
      },
      {
        id: `scale-${shapeId}-end`,
        time: startTime + duration,
        shapeId,
        properties: { scaleX: fromScale, scaleY: fromScale },
        easing: 'ease-out',
      },
    ];
  }

  generateFadeAnimation(shapeId: string, startTime: number, duration: number, fromOpacity: number = 1, toOpacity: number = 0): Keyframe[] {
    return [
      {
        id: `fade-${shapeId}-start`,
        time: startTime,
        shapeId,
        properties: { opacity: fromOpacity },
        easing: 'ease-in-out',
      },
      {
        id: `fade-${shapeId}-end`,
        time: startTime + duration,
        shapeId,
        properties: { opacity: toOpacity },
        easing: 'ease-in-out',
      },
    ];
  }
}

export const animationEngine = new AnimationEngine();