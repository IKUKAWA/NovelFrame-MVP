import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { animationEngine } from '../utils/animationEngine';

export interface Shape {
  id: string;
  type: 'circle' | 'rectangle' | 'polygon' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  vertices?: Array<{ x: number; y: number }>;
}

export interface Keyframe {
  id: string;
  time: number;
  shapeId: string;
  properties: Partial<Shape>;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  backgroundColor: string;
  shapes: Shape[];
  keyframes: Keyframe[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AppState {
  // Project state
  currentProject: Project | null;
  
  // Canvas state
  selectedShapeIds: string[];
  currentTime: number;
  isPlaying: boolean;
  
  // Chat state
  chatMessages: ChatMessage[];
  isGenerating: boolean;
  
  // UI state
  activeTool: 'select' | 'circle' | 'rectangle' | 'polygon' | 'text';
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  
  // Actions
  createProject: (name: string) => void;
  saveProject: () => void;
  loadProject: (project: Project) => void;
  
  // Shape actions
  addShape: (shape: Omit<Shape, 'id'>) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  // Animation actions
  addKeyframe: (shapeId: string, time: number, properties: Partial<Shape>) => void;
  removeKeyframe: (id: string) => void;
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  
  // Chat actions
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setGenerating: (generating: boolean) => void;
  
  // Tool actions
  setActiveTool: (tool: AppState['activeTool']) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentProject: null,
      selectedShapeIds: [],
      currentTime: 0,
      isPlaying: false,
      chatMessages: [],
      isGenerating: false,
      activeTool: 'select',
      showGrid: true,
      snapToGrid: false,
      gridSize: 20,
      
      // Project actions
      createProject: (name: string) => {
        const project: Project = {
          id: crypto.randomUUID(),
          name,
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 5000,
          backgroundColor: '#000000',
          shapes: [],
          keyframes: [],
        };
        set({ currentProject: project });
      },
      
      saveProject: async () => {
        const { currentProject } = get();
        if (!currentProject) return;
        
        try {
          const result = await window.electronAPI.saveFile();
          if (!result.canceled && result.filePath) {
            await window.electronAPI.writeFile(
              result.filePath,
              JSON.stringify(currentProject, null, 2)
            );
          }
        } catch (error) {
          console.error('Failed to save project:', error);
        }
      },
      
      loadProject: (project: Project) => {
        set({ currentProject: project, selectedShapeIds: [], currentTime: 0 });
      },
      
      // Shape actions
      addShape: (shapeData) => {
        const shape: Shape = {
          id: crypto.randomUUID(),
          ...shapeData,
        };
        
        set((state) => ({
          currentProject: state.currentProject ? {
            ...state.currentProject,
            shapes: [...state.currentProject.shapes, shape],
          } : null,
        }));
      },
      
      updateShape: (id, updates) => {
        set((state) => ({
          currentProject: state.currentProject ? {
            ...state.currentProject,
            shapes: state.currentProject.shapes.map(shape =>
              shape.id === id ? { ...shape, ...updates } : shape
            ),
          } : null,
        }));
      },
      
      deleteShape: (id) => {
        set((state) => ({
          currentProject: state.currentProject ? {
            ...state.currentProject,
            shapes: state.currentProject.shapes.filter(shape => shape.id !== id),
            keyframes: state.currentProject.keyframes.filter(kf => kf.shapeId !== id),
          } : null,
          selectedShapeIds: state.selectedShapeIds.filter(shapeId => shapeId !== id),
        }));
      },
      
      selectShape: (id, multi = false) => {
        set((state) => ({
          selectedShapeIds: multi 
            ? state.selectedShapeIds.includes(id)
              ? state.selectedShapeIds.filter(shapeId => shapeId !== id)
              : [...state.selectedShapeIds, id]
            : [id],
        }));
      },
      
      clearSelection: () => {
        set({ selectedShapeIds: [] });
      },
      
      // Animation actions
      addKeyframe: (shapeId, time, properties) => {
        const keyframe: Keyframe = {
          id: crypto.randomUUID(),
          time,
          shapeId,
          properties,
          easing: 'ease-in-out',
        };
        
        set((state) => {
          const newState = {
            currentProject: state.currentProject ? {
              ...state.currentProject,
              keyframes: [...state.currentProject.keyframes, keyframe],
            } : null,
          };
          
          // Update animation engine
          if (newState.currentProject) {
            animationEngine.updateFromKeyframes(newState.currentProject.keyframes);
          }
          
          return newState;
        });
      },
      
      removeKeyframe: (id) => {
        set((state) => {
          const newState = {
            currentProject: state.currentProject ? {
              ...state.currentProject,
              keyframes: state.currentProject.keyframes.filter(kf => kf.id !== id),
            } : null,
          };
          
          // Update animation engine
          if (newState.currentProject) {
            animationEngine.updateFromKeyframes(newState.currentProject.keyframes);
          }
          
          return newState;
        });
      },
      
      setCurrentTime: (time) => {
        set({ currentTime: time });
      },
      
      play: () => {
        set({ isPlaying: true });
      },
      
      pause: () => {
        set({ isPlaying: false });
      },
      
      stop: () => {
        set({ isPlaying: false, currentTime: 0 });
      },
      
      // Chat actions
      addChatMessage: (message) => {
        const chatMessage: ChatMessage = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...message,
        };
        
        set((state) => ({
          chatMessages: [...state.chatMessages, chatMessage],
        }));
      },
      
      setGenerating: (generating) => {
        set({ isGenerating: generating });
      },
      
      // Tool actions
      setActiveTool: (tool) => {
        set({ activeTool: tool });
      },
      
      toggleGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }));
      },
      
      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }));
      },
      
      setGridSize: (size) => {
        set({ gridSize: size });
      },
    }),
    {
      name: 'novelframe-store',
    }
  )
);