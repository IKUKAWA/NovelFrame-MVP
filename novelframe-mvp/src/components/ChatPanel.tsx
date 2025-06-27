import React, { useState } from 'react';
import {
  Box,
  TextInput,
  Button,
  ScrollArea,
  Text,
  Group,
  Paper,
  Loader,
  Stack,
} from '@mantine/core';
import { IconSend, IconBot, IconUser } from '@tabler/icons-react';
import { useAppStore } from '../store/appStore';
import { AIService } from '../services/aiService';

export const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { chatMessages, addChatMessage, isGenerating, setGenerating } = useAppStore();

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    
    addChatMessage({
      type: 'user',
      content: userMessage,
    });

    setGenerating(true);
    
    try {
      const response = await AIService.processCommand(userMessage);
      
      addChatMessage({
        type: 'assistant',
        content: response.message,
      });

      // Execute commands if any
      if (response.commands.length > 0) {
        for (const command of response.commands) {
          await AIService.executeCommand(command);
        }
      }
    } catch (error) {
      addChatMessage({
        type: 'assistant',
        content: 'リクエストの処理中にエラーが発生しました。もう一度お試しください。',
      });
      console.error('AI Service Error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box p="md" style={{ borderBottom: '1px solid #333' }}>
        <Text size="lg" fw={600}>
          AIアシスタント
        </Text>
        <Text size="sm" c="dimmed">
          作成したいものを説明してください
        </Text>
      </Box>

      <ScrollArea flex={1} p="md">
        <Stack gap="md">
          {chatMessages.length === 0 && (
            <Paper p="md" bg="dark.7">
              <Text size="sm" c="dimmed" ta="center">
                👋 こんにちは！図形やアニメーションの作成をお手伝いします。
                <br />
                例: 「赤い円を作って」「バウンスさせて」
              </Text>
            </Paper>
          )}
          
          {chatMessages.map((message) => (
            <Group key={message.id} align="flex-start" gap="sm">
              <Box
                style={{
                  backgroundColor: message.type === 'user' ? '#364fc7' : '#37b24d',
                  borderRadius: '50%',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px',
                }}
              >
                {message.type === 'user' ? (
                  <IconUser size={16} color="white" />
                ) : (
                  <IconBot size={16} color="white" />
                )}
              </Box>
              <Paper
                p="md"
                flex={1}
                bg={message.type === 'user' ? 'dark.6' : 'dark.7'}
              >
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Text>
                <Text size="xs" c="dimmed" mt="xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </Paper>
            </Group>
          ))}
          
          {isGenerating && (
            <Group align="flex-start" gap="sm">
              <Box
                style={{
                  backgroundColor: '#37b24d',
                  borderRadius: '50%',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px',
                }}
              >
                <IconBot size={16} color="white" />
              </Box>
              <Paper p="md" flex={1} bg="dark.7">
                <Group gap="sm">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    考え中...
                  </Text>
                </Group>
              </Paper>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      <Box p="md" style={{ borderTop: '1px solid #333' }}>
        <Group gap="sm">
          <TextInput
            flex={1}
            placeholder="作成したいものを説明してください..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isGenerating}
          />
          <Button
            variant="filled"
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            leftSection={<IconSend size={16} />}
          >
            送信
          </Button>
        </Group>
      </Box>
    </Box>
  );
};