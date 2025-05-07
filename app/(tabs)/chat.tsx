import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { GiftedChat, IMessage, InputToolbar } from 'react-native-gifted-chat';

const { width } = Dimensions.get('window');

// EmotionAvatar component remains the same as your last version
const EmotionAvatar = ({ emotion }: { emotion: string }) => {
  const player = useVideoPlayer(null, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = false;
  });

  useEffect(() => {
    if (!player) {
      return;
    }
    let newSource: VideoSource;
    switch (emotion) {
      case 'happy':
        newSource = require('../../assets/videos/happy.mp4');
        break;
      case 'sad':
        newSource = require('../../assets/videos/sad.mp4');
        break;
      default:
        newSource = require('../../assets/videos/neutral.mp4');
    }
    const loadAndPlaySource = async () => {
      try {
        await player.replace(newSource);
        await player.play();
      } catch (error) {
        console.error("Error replacing source or playing video:", error);
      }
    };
    loadAndPlaySource();
  }, [emotion, player]);

  if (!player) {
    return (
      <View style={[styles.videoAvatar, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading Video...</Text>
      </View>
    );
  }

  return (
    <VideoView
      player={player}
      style={styles.videoAvatar}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      nativeControls={false}
      contentFit="cover"
    />
  );
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 'test-msg-1',
      text: 'Is the chat UI visible?',
      createdAt: new Date(),
      user: { _id: 1 },
    },
  ]);
  const [lastEmotion, setLastEmotion] = useState<string>('neutral');

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    const sentMessage = newMessages[0];
    const responseText = `You said: "${sentMessage.text}". I'm your AI friend! 😊`;
    let detectedEmotion = 'neutral';
    const input = sentMessage.text.toLowerCase();
    if (input.includes('sad') || input.includes('bad') || input.includes('sorry')) {
      detectedEmotion = 'sad';
    } else if (input.includes('happy') || input.includes('great') || input.includes('yay')) {
      detectedEmotion = 'happy';
    }
    setLastEmotion(detectedEmotion);
    const aiResponse: IMessage = {
      _id: Math.random().toString(36).substring(7),
      text: responseText,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'AI Friend',
      },
    };
    setTimeout(() => {
      setMessages(previousMessages => GiftedChat.append(previousMessages, [aiResponse]));
    }, 800);
  }, []);

  return (
    // 2. Use SafeAreaView as the root container for the screen
    <SafeAreaView style={styles.safeAreaContainer}>
      <EmotionAvatar emotion={lastEmotion} />
      <View style={styles.chatContainer}> {/* This View ensures GiftedChat takes remaining space */}
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderInputToolbar={(toolbarProps) => <InputToolbar {...toolbarProps} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 3. Style for SafeAreaView
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff', // Or your desired screen background color
    // On Android, SafeAreaView might not handle the status bar by default in all cases.
    // If the video is still cut off specifically on Android, you might add:
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  // Container for the chat UI below the avatar
  chatContainer: {
    flex: 1, // This makes sure GiftedChat wrapper takes the remaining space
    // backgroundColor: 'transparent', // Keep as is or remove if not needed for debugging
  },
  videoAvatar: {
    width: width,
    height: 250,
    // No change needed here unless you want to adjust for aspect ratio within safe area
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  loadingText: {
    color: '#555',
  }
});