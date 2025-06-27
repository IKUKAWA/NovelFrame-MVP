import { useAppStore } from '../store/appStore';

interface AICommand {
  action: 'create' | 'modify' | 'animate' | 'delete';
  target: {
    type?: 'circle' | 'rectangle' | 'polygon' | 'text';
    id?: string;
    properties?: Record<string, any>;
  };
  modifiers?: {
    position?: { x: number; y: number };
    animation?: {
      duration: number;
      properties: Record<string, any>;
      easing?: string;
    };
  };
}

interface AIResponse {
  message: string;
  commands: AICommand[];
}

class AIServiceClass {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  async processCommand(userInput: string): Promise<AIResponse> {
    return this.simulateAIResponse(userInput);
  }

  private simulateAIResponse(input: string): Promise<AIResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerInput = input.toLowerCase();
        const commands: AICommand[] = [];
        let message = "I'll help you with that!";

        if (lowerInput.includes('create') || lowerInput.includes('add') || lowerInput.includes('make')) {
          if (lowerInput.includes('circle')) {
            const color = this.extractColor(lowerInput) || '#4c6ef5';
            const size = this.extractSize(lowerInput) || 50;
            const position = this.extractPosition(lowerInput) || { x: 400, y: 300 };

            commands.push({
              action: 'create',
              target: {
                type: 'circle',
                properties: {
                  fill: color,
                  radius: size,
                  x: position.x,
                  y: position.y,
                }
              }
            });
            message = `Created a ${color} circle with radius ${size} at position (${position.x}, ${position.y}).`;
          }
          else if (lowerInput.includes('rectangle') || lowerInput.includes('square')) {
            const color = this.extractColor(lowerInput) || '#51cf66';
            const width = this.extractSize(lowerInput) || 100;
            const height = lowerInput.includes('square') ? width : this.extractSize(lowerInput, 'height') || 60;
            const position = this.extractPosition(lowerInput) || { x: 400, y: 300 };

            commands.push({
              action: 'create',
              target: {
                type: 'rectangle',
                properties: {
                  fill: color,
                  width,
                  height,
                  x: position.x,
                  y: position.y,
                }
              }
            });
            message = `Created a ${color} rectangle (${width}x${height}) at position (${position.x}, ${position.y}).`;
          }
          else if (lowerInput.includes('text')) {
            const text = this.extractText(lowerInput) || 'Sample Text';
            const color = this.extractColor(lowerInput) || '#ffffff';
            const fontSize = this.extractSize(lowerInput) || 24;
            const position = this.extractPosition(lowerInput) || { x: 400, y: 300 };

            commands.push({
              action: 'create',
              target: {
                type: 'text',
                properties: {
                  text,
                  fill: color,
                  fontSize,
                  x: position.x,
                  y: position.y,
                }
              }
            });
            message = `Created text "${text}" in ${color} at position (${position.x}, ${position.y}).`;
          }
        }

        if (lowerInput.includes('animate') || lowerInput.includes('move') || lowerInput.includes('bounce')) {
          message += " Animation features are coming soon!";
        }

        if (lowerInput.includes('change color') || lowerInput.includes('make it')) {
          const color = this.extractColor(lowerInput);
          if (color) {
            message = `Color change to ${color} is coming soon! Please select a shape first.`;
          }
        }

        if (commands.length === 0) {
          if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
            message = `I can help you create shapes! Try saying:
• "Create a red circle"
• "Add a blue rectangle"
• "Make a text that says Hello"
• "Create a green square at position 100, 200"`;
          } else {
            message = "I'm not sure how to help with that yet. Try asking me to create a shape like 'Create a red circle' or ask for help.";
          }
        }

        resolve({ message, commands });
      }, 1000 + Math.random() * 1000);
    });
  }

  private extractColor(input: string): string | null {
    const colorMap: Record<string, string> = {
      red: '#ff6b6b',
      blue: '#4c6ef5',
      green: '#51cf66',
      yellow: '#ffd43b',
      purple: '#9775fa',
      orange: '#ff8787',
      pink: '#f783ac',
      cyan: '#22d3ee',
      white: '#ffffff',
      black: '#000000',
      gray: '#868e96',
      grey: '#868e96',
    };

    for (const [colorName, hexValue] of Object.entries(colorMap)) {
      if (input.includes(colorName)) {
        return hexValue;
      }
    }

    const hexMatch = input.match(/#[0-9a-fA-F]{6}/);
    if (hexMatch) {
      return hexMatch[0];
    }

    return null;
  }

  private extractSize(input: string, type = 'size'): number | null {
    const sizeRegex = /\b(\d+)\s*(px|pixels?|units?)?\b/g;
    const matches = Array.from(input.matchAll(sizeRegex));
    
    if (matches.length > 0) {
      return parseInt(matches[0][1]);
    }

    if (input.includes('small')) return 30;
    if (input.includes('medium')) return 50;
    if (input.includes('large')) return 80;
    if (input.includes('huge') || input.includes('big')) return 120;

    return null;
  }

  private extractPosition(input: string): { x: number; y: number } | null {
    const positionRegex = /(?:at|position)\s*(\d+)[,\s]+(\d+)/;
    const match = input.match(positionRegex);
    
    if (match) {
      return {
        x: parseInt(match[1]),
        y: parseInt(match[2])
      };
    }

    if (input.includes('center')) return { x: 960, y: 540 };
    if (input.includes('top left')) return { x: 200, y: 200 };
    if (input.includes('top right')) return { x: 1720, y: 200 };
    if (input.includes('bottom left')) return { x: 200, y: 880 };
    if (input.includes('bottom right')) return { x: 1720, y: 880 };
    if (input.includes('left')) return { x: 200, y: 540 };
    if (input.includes('right')) return { x: 1720, y: 540 };
    if (input.includes('top')) return { x: 960, y: 200 };
    if (input.includes('bottom')) return { x: 960, y: 880 };

    return null;
  }

  private extractText(input: string): string | null {
    const quotedTextRegex = /["'](.*?)["']/;
    const match = input.match(quotedTextRegex);
    
    if (match) {
      return match[1];
    }

    const saysRegex = /(?:text|says?)\s+(.+?)(?:\s+(?:at|in|with)|$)/i;
    const saysMatch = input.match(saysRegex);
    
    if (saysMatch) {
      return saysMatch[1].trim();
    }

    return null;
  }

  async executeCommand(command: AICommand): Promise<void> {
    const store = useAppStore.getState();

    switch (command.action) {
      case 'create':
        if (command.target.type && command.target.properties) {
          const shapeData = {
            type: command.target.type,
            x: command.target.properties.x || 400,
            y: command.target.properties.y || 300,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            fill: command.target.properties.fill || '#4c6ef5',
            stroke: command.target.properties.stroke || '#364fc7',
            strokeWidth: command.target.properties.strokeWidth || 2,
            opacity: 1,
            visible: true,
            zIndex: Date.now(),
            ...command.target.properties,
          };
          store.addShape(shapeData);
        }
        break;

      case 'modify':
        if (command.target.id && command.target.properties) {
          store.updateShape(command.target.id, command.target.properties);
        }
        break;

      case 'delete':
        if (command.target.id) {
          store.deleteShape(command.target.id);
        }
        break;

      case 'animate':
        console.log('Animation command:', command);
        break;
    }
  }
}

export const AIService = new AIServiceClass();