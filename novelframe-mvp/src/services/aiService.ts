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
        let message = "実行しました！";

        // Japanese command detection
        const isJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(input);
        
        if (lowerInput.includes('create') || lowerInput.includes('add') || lowerInput.includes('make') ||
            lowerInput.includes('作') || lowerInput.includes('追加') || lowerInput.includes('描')) {
          if (lowerInput.includes('circle') || lowerInput.includes('円') || lowerInput.includes('まる')) {
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
            message = isJapanese ? 
              `${this.getColorNameJa(color)}の円（半径${size}）を位置(${position.x}, ${position.y})に作成しました。` :
              `Created a ${color} circle with radius ${size} at position (${position.x}, ${position.y}).`;
          }
          else if (lowerInput.includes('rectangle') || lowerInput.includes('square') || 
                   lowerInput.includes('四角') || lowerInput.includes('しかく') || lowerInput.includes('正方形')) {
            const color = this.extractColor(lowerInput) || '#51cf66';
            const width = this.extractSize(lowerInput) || 100;
            const height = (lowerInput.includes('square') || lowerInput.includes('正方形')) ? width : this.extractSize(lowerInput, 'height') || 60;
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
            message = isJapanese ? 
              `${this.getColorNameJa(color)}の四角形（${width}×${height}）を位置(${position.x}, ${position.y})に作成しました。` :
              `Created a ${color} rectangle (${width}x${height}) at position (${position.x}, ${position.y}).`;
          }
          else if (lowerInput.includes('text') || lowerInput.includes('テキスト') || lowerInput.includes('文字')) {
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
            message = isJapanese ? 
              `テキスト「${text}」を${this.getColorNameJa(color)}で位置(${position.x}, ${position.y})に作成しました。` :
              `Created text "${text}" in ${color} at position (${position.x}, ${position.y}).`;
          }
        }

        if (lowerInput.includes('animate') || lowerInput.includes('move') || lowerInput.includes('bounce') ||
            lowerInput.includes('アニメ') || lowerInput.includes('動') || lowerInput.includes('バウンス')) {
          message += isJapanese ? 
            " アニメーション機能は現在開発中です！" :
            " Animation features are coming soon!";
        }

        if (lowerInput.includes('change color') || lowerInput.includes('make it') ||
            lowerInput.includes('色を変') || lowerInput.includes('色変更')) {
          const color = this.extractColor(lowerInput);
          if (color) {
            message = isJapanese ? 
              `${this.getColorNameJa(color)}への色変更機能は現在開発中です！先にシェイプを選択してください。` :
              `Color change to ${color} is coming soon! Please select a shape first.`;
          }
        }

        if (commands.length === 0) {
          if (lowerInput.includes('help') || lowerInput.includes('what can you do') ||
              lowerInput.includes('ヘルプ') || lowerInput.includes('何ができ')) {
            message = isJapanese ? 
              `図形の作成をお手伝いします！以下のようにお試しください：
• 「赤い円を作って」
• 「青い四角を追加」
• 「こんにちはというテキストを作成」
• 「緑の正方形を位置100, 200に配置」` :
              `I can help you create shapes! Try saying:
• "Create a red circle"
• "Add a blue rectangle"
• "Make a text that says Hello"
• "Create a green square at position 100, 200"`;
          } else {
            message = isJapanese ? 
              "そのコマンドはまだ対応していません。「赤い円を作って」のような図形作成コマンドをお試しください。" :
              "I'm not sure how to help with that yet. Try asking me to create a shape like 'Create a red circle' or ask for help.";
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
      // Japanese color names
      赤: '#ff6b6b',
      あか: '#ff6b6b',
      青: '#4c6ef5',
      あお: '#4c6ef5',
      緑: '#51cf66',
      みどり: '#51cf66',
      黄: '#ffd43b',
      黄色: '#ffd43b',
      きいろ: '#ffd43b',
      紫: '#9775fa',
      むらさき: '#9775fa',
      オレンジ: '#ff8787',
      ピンク: '#f783ac',
      白: '#ffffff',
      しろ: '#ffffff',
      黒: '#000000',
      くろ: '#000000',
      灰色: '#868e96',
      グレー: '#868e96',
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

    if (input.includes('small') || input.includes('小さ')) return 30;
    if (input.includes('medium') || input.includes('中') || input.includes('普通')) return 50;
    if (input.includes('large') || input.includes('大き')) return 80;
    if (input.includes('huge') || input.includes('big') || input.includes('巨大') || input.includes('でか')) return 120;

    return null;
  }

  private extractPosition(input: string): { x: number; y: number } | null {
    const positionRegex = /(?:at|position|位置)\s*(\d+)[,\s]+(\d+)/;
    const match = input.match(positionRegex);
    
    if (match) {
      return {
        x: parseInt(match[1]),
        y: parseInt(match[2])
      };
    }

    if (input.includes('center') || input.includes('中央') || input.includes('真ん中')) return { x: 960, y: 540 };
    if (input.includes('top left') || input.includes('左上')) return { x: 200, y: 200 };
    if (input.includes('top right') || input.includes('右上')) return { x: 1720, y: 200 };
    if (input.includes('bottom left') || input.includes('左下')) return { x: 200, y: 880 };
    if (input.includes('bottom right') || input.includes('右下')) return { x: 1720, y: 880 };
    if (input.includes('left') || input.includes('左')) return { x: 200, y: 540 };
    if (input.includes('right') || input.includes('右')) return { x: 1720, y: 540 };
    if (input.includes('top') || input.includes('上')) return { x: 960, y: 200 };
    if (input.includes('bottom') || input.includes('下')) return { x: 960, y: 880 };

    return null;
  }

  private extractText(input: string): string | null {
    const quotedTextRegex = /["'「」](.*?)["'」「]/;
    const match = input.match(quotedTextRegex);
    
    if (match) {
      return match[1];
    }

    const saysRegex = /(?:text|says?|という|書いて)\s+(.+?)(?:\s+(?:at|in|with|を|に)|$)/i;
    const saysMatch = input.match(saysRegex);
    
    if (saysMatch) {
      return saysMatch[1].trim();
    }

    return null;
  }

  private getColorNameJa(hexColor: string): string {
    const colorNameMap: Record<string, string> = {
      '#ff6b6b': '赤',
      '#4c6ef5': '青',
      '#51cf66': '緑',
      '#ffd43b': '黄色',
      '#9775fa': '紫',
      '#ff8787': 'オレンジ',
      '#f783ac': 'ピンク',
      '#22d3ee': 'シアン',
      '#ffffff': '白',
      '#000000': '黒',
      '#868e96': 'グレー',
    };
    
    return colorNameMap[hexColor] || hexColor;
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