import { Project } from '../store/appStore';
import { animationEngine } from './animationEngine';

export interface ExportSettings {
  width: number;
  height: number;
  fps: number;
  duration: number;
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'webm' | 'gif';
}

export class VideoExporter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private project: Project;

  constructor(project: Project) {
    this.project = project;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async exportVideo(settings: ExportSettings, onProgress?: (progress: number) => void): Promise<Blob> {
    this.canvas.width = settings.width;
    this.canvas.height = settings.height;

    const frameCount = Math.ceil((settings.duration / 1000) * settings.fps);
    const frameTime = 1000 / settings.fps;
    
    const frames: ImageData[] = [];
    
    // Render each frame
    for (let i = 0; i < frameCount; i++) {
      const time = i * frameTime;
      const frame = await this.renderFrame(time);
      frames.push(frame);
      
      if (onProgress) {
        onProgress((i + 1) / frameCount);
      }
    }

    // Convert frames to video
    return this.framesToVideo(frames, settings);
  }

  private async renderFrame(time: number): Promise<ImageData> {
    // Clear canvas
    this.ctx.fillStyle = this.project.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Scale to fit the export dimensions
    const scaleX = this.canvas.width / this.project.width;
    const scaleY = this.canvas.height / this.project.height;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (this.canvas.width - this.project.width * scale) / 2;
    const offsetY = (this.canvas.height - this.project.height * scale) / 2;

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, scale);

    // Render shapes with animation
    const sortedShapes = [...this.project.shapes].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const shape of sortedShapes) {
      if (!shape.visible) continue;

      // Get animated properties
      const animatedProps = animationEngine.getInterpolatedState(shape.id, time);
      const currentProps = animatedProps ? { ...shape, ...animatedProps } : shape;

      this.ctx.save();
      
      // Apply transformations
      this.ctx.translate(currentProps.x, currentProps.y);
      this.ctx.rotate((currentProps.rotation * Math.PI) / 180);
      this.ctx.scale(currentProps.scaleX, currentProps.scaleY);
      this.ctx.globalAlpha = currentProps.opacity;

      // Set fill and stroke
      this.ctx.fillStyle = currentProps.fill;
      if (currentProps.strokeWidth > 0) {
        this.ctx.strokeStyle = currentProps.stroke;
        this.ctx.lineWidth = currentProps.strokeWidth;
      }

      // Render shape
      switch (shape.type) {
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, currentProps.radius || 50, 0, Math.PI * 2);
          this.ctx.fill();
          if (currentProps.strokeWidth > 0) {
            this.ctx.stroke();
          }
          break;

        case 'rectangle':
          const width = currentProps.width || 100;
          const height = currentProps.height || 60;
          this.ctx.fillRect(-width / 2, -height / 2, width, height);
          if (currentProps.strokeWidth > 0) {
            this.ctx.strokeRect(-width / 2, -height / 2, width, height);
          }
          break;

        case 'text':
          this.ctx.font = `${currentProps.fontSize || 24}px ${currentProps.fontFamily || 'Inter'}`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(currentProps.text || 'Text', 0, 0);
          break;

        case 'polygon':
          if (shape.vertices && shape.vertices.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.vertices[0].x, shape.vertices[0].y);
            for (let i = 1; i < shape.vertices.length; i++) {
              this.ctx.lineTo(shape.vertices[i].x, shape.vertices[i].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
            if (currentProps.strokeWidth > 0) {
              this.ctx.stroke();
            }
          }
          break;
      }

      this.ctx.restore();
    }

    this.ctx.restore();

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  private async framesToVideo(frames: ImageData[], settings: ExportSettings): Promise<Blob> {
    // For now, we'll create a simple implementation that creates individual frames
    // In a real implementation, this would use FFmpeg.wasm or a similar library
    
    if (settings.format === 'gif') {
      return this.framesToGif(frames, settings);
    }

    // For MP4/WebM, we would use MediaRecorder API or FFmpeg.wasm
    // This is a simplified implementation
    return new Blob(['Video export not yet implemented'], { type: 'text/plain' });
  }

  private async framesToGif(frames: ImageData[], settings: ExportSettings): Promise<Blob> {
    // Simplified GIF creation (would use a proper GIF encoder in reality)
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;
    const ctx = canvas.getContext('2d')!;

    // Create animated frames by drawing each ImageData
    const frameBlobs: Blob[] = [];
    
    for (const frame of frames) {
      ctx.putImageData(frame, 0, 0);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      frameBlobs.push(blob);
    }

    // In a real implementation, combine these into an animated GIF
    return new Blob(frameBlobs, { type: 'image/gif' });
  }

  async exportFrames(settings: ExportSettings, onProgress?: (progress: number) => void): Promise<Blob[]> {
    this.canvas.width = settings.width;
    this.canvas.height = settings.height;

    const frameCount = Math.ceil((settings.duration / 1000) * settings.fps);
    const frameTime = 1000 / settings.fps;
    
    const frames: Blob[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const time = i * frameTime;
      await this.renderFrame(time);
      
      const blob = await new Promise<Blob>((resolve) => {
        this.canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      frames.push(blob);
      
      if (onProgress) {
        onProgress((i + 1) / frameCount);
      }
    }

    return frames;
  }

  dispose() {
    // Clean up resources
    this.canvas.remove();
  }
}

export const createVideoExporter = (project: Project) => {
  return new VideoExporter(project);
};