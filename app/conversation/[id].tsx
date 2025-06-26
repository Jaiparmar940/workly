import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { Conversation, ConversationMessage, Message, MessageDeliveryStatus, MessageType, User } from '@/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuthContext();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [conversationTitle, setConversationTitle] = useState('Conversation');
  const [conversationId, setConversationId] = useState<string>('');
  const [jobId, setJobId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id && user) {
      loadConversation();
    }
  }, [id, user]);

  const loadConversation = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      console.log('Debug - Loading conversation for message ID:', id);
      console.log('Debug - Current user ID:', user.uid);
      
      // First, try to find if this is a conversation ID (new structure)
      let conversation: Conversation | null = null;
      try {
        conversation = await FirebaseService.getConversationById(user.uid, id as string);
        if (conversation) {
          console.log('Debug - Found conversation in new structure');
          setConversationId(conversation.id);
          await loadNewStructureConversation(conversation);
          return;
        }
      } catch (error) {
        console.log('Debug - Not a conversation ID, trying old structure');
      }

      // If not found in new structure, try old structure
      await loadOldStructureConversation();
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const loadNewStructureConversation = async (conversation: Conversation) => {
    if (!user) return;

    // Get the other user from participants
    const otherUserId = conversation.participants.find(pid => pid !== user.uid);
    if (!otherUserId) {
      Alert.alert('Error', 'Invalid conversation');
      return;
    }

    // Load other user's profile
    const otherUserProfile = await FirebaseService.getUserById(otherUserId);
    if (otherUserProfile) {
      setOtherUser(otherUserProfile);
    } else {
      // Create fallback user
      const fallbackUser: User = {
        id: otherUserId,
        name: 'Unknown User',
        email: 'unknown@example.com',
        skills: [],
        experience: '',
        interests: [],
        rating: 0,
        completedJobs: 0,
        location: { city: '', state: '', zipCode: '' },
        accountType: 'personal',
        workerProfileComplete: false,
        createdAt: new Date()
      };
      setOtherUser(fallbackUser);
    }

    // Set conversation title and jobId
    let title = 'Conversation';
    if (conversation.jobId) {
      setJobId(conversation.jobId);
      try {
        const job = await FirebaseService.getJobById(conversation.jobId);
        if (job) {
          title = job.title;
        }
      } catch (error) {
        console.error('Error loading job for title:', error);
      }
    }
    setConversationTitle(title);

    // Load messages
    const conversationMessages = await FirebaseService.getConversationMessages(user.uid, conversation.id);
    setMessages(conversationMessages);

    // Mark as read
    await FirebaseService.markConversationAsRead(user.uid, conversation.id);
  };

  const loadOldStructureConversation = async () => {
    if (!user) return;

    // Load all user messages and find the conversation
    const userMessages = await FirebaseService.getAllMessagesForUser(user.uid);
    console.log('Debug - Found user messages:', userMessages.length);
    
    // Find the specific message we're looking for
    const originalMessage = userMessages.find(msg => msg.id === id);
    console.log('Debug - Original message found:', !!originalMessage);
    
    if (!originalMessage) {
      Alert.alert('Error', 'Conversation not found');
      router.back();
      return;
    }

    // Determine the other user in the conversation
    const otherUserId = originalMessage.senderId === user.uid 
      ? originalMessage.receiverId 
      : originalMessage.senderId;

    // Load the other user's profile
    const otherUserProfile = await FirebaseService.getUserById(otherUserId);
    if (otherUserProfile) {
      setOtherUser(otherUserProfile);
    } else {
      // Create fallback user
      const fallbackUser: User = {
        id: otherUserId,
        name: 'Unknown User',
        email: 'unknown@example.com',
        skills: [],
        experience: '',
        interests: [],
        rating: 0,
        completedJobs: 0,
        location: { city: '', state: '', zipCode: '' },
        accountType: 'personal',
        workerProfileComplete: false,
        createdAt: new Date()
      };
      setOtherUser(fallbackUser);
    }

    // Set conversation title and jobId
    let title = 'Conversation';
    if (originalMessage.jobId) {
      setJobId(originalMessage.jobId);
      try {
        const job = await FirebaseService.getJobById(originalMessage.jobId);
        if (job) {
          title = job.title;
        }
      } catch (error) {
        console.error('Error loading job for title:', error);
      }
    }
    setConversationTitle(title);

    // Load all messages in this conversation
    if (originalMessage.jobId) {
      await loadOldStructureMessages(originalMessage.jobId, originalMessage, otherUserId);
    } else {
      setMessages([{
        id: originalMessage.id,
        senderId: originalMessage.senderId,
        content: originalMessage.content,
        type: originalMessage.type,
        isRead: originalMessage.isRead,
        createdAt: originalMessage.createdAt,
        deliveryStatus: originalMessage.isRead ? MessageDeliveryStatus.READ : MessageDeliveryStatus.DELIVERED,
        readBy: originalMessage.isRead ? [user.uid] : []
      }]);
    }
  };

  const loadOldStructureMessages = async (jobId: string, originalMessage: Message, otherUserId: string) => {
    if (!user) return;

    try {
      // Load messages related to this job
      const jobMessages = await FirebaseService.getMessagesByJobId(jobId);
      
      // Filter messages between the current user and the other user
      const conversationMessages = jobMessages.filter(msg => 
        (msg.senderId === user.uid && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === user.uid)
      );

      // Also load all messages between these two users (regardless of jobId)
      const allUserMessages = await FirebaseService.getAllMessagesForUser(user.uid);
      const directMessages = allUserMessages.filter(msg => 
        (msg.senderId === user.uid && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === user.uid)
      );

      // Combine all messages and remove duplicates
      const allMessages = [...conversationMessages, ...directMessages];
      const uniqueMessages = allMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      );

      // Ensure the original message is included
      const hasOriginalMessage = uniqueMessages.some(msg => msg.id === originalMessage.id);
      if (!hasOriginalMessage) {
        uniqueMessages.push(originalMessage);
      }

      // Sort messages chronologically
      const sortedMessages = uniqueMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Convert to new message format
      const newFormatMessages: ConversationMessage[] = sortedMessages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        content: msg.content,
        type: msg.type,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        deliveryStatus: msg.isRead ? MessageDeliveryStatus.READ : MessageDeliveryStatus.DELIVERED,
        readBy: msg.isRead ? [user.uid] : []
      }));

      setMessages(newFormatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !otherUser) {
      console.log('Debug - Send message validation failed:', {
        hasMessage: !!newMessage.trim(),
        hasUser: !!user,
        hasOtherUser: !!otherUser
      });
      return;
    }

    try {
      console.log('Debug - Sending message from:', user.uid, 'to:', otherUser.id);
      
      let currentConversationId = conversationId;
      
      // If we don't have a conversation ID (old structure), create one
      if (!currentConversationId) {
        const participants = [user.uid, otherUser.id].sort();
        
        const newConversation = await FirebaseService.createConversation(participants, jobId);
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
        
        console.log('Debug - Created new conversation:', currentConversationId);
        
        // Migrate existing messages to the new conversation structure
        await migrateMessagesToNewStructure(currentConversationId);
      }

      // Send message using new structure
      const sentMessage = await FirebaseService.addMessageToConversation(
        currentConversationId,
        user.uid,
        newMessage.trim(),
        MessageType.GENERAL
      );
      
      console.log('Debug - Message sent successfully:', sentMessage.id);
      
      // Add the new message to the local state
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const migrateMessagesToNewStructure = async (conversationId: string) => {
    if (!user || !otherUser) return;

    try {
      console.log('Debug - Migrating messages to new structure');
      
      // Get all messages between these users (both sent and received)
      const allUserMessages = await FirebaseService.getAllMessagesForUser(user.uid);
      const conversationMessages = allUserMessages.filter(msg => 
        (msg.senderId === user.uid && msg.receiverId === otherUser.id) ||
        (msg.senderId === otherUser.id && msg.receiverId === user.uid)
      );

      console.log('Debug - Found messages to migrate:', conversationMessages.length);

      // Sort messages by creation date
      const sortedMessages = conversationMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Add each message to the new conversation structure
      for (const message of sortedMessages) {
        await FirebaseService.addMessageToConversation(
          conversationId,
          message.senderId,
          message.content,
          message.type
        );
      }

      console.log('Debug - Migration completed');
      
      // Reload messages from new structure
      const newMessages = await FirebaseService.getConversationMessages(user.uid, conversationId);
      setMessages(newMessages);
    } catch (error) {
      console.error('Error migrating messages:', error);
    }
  };

  const renderMessage = ({ item }: { item: ConversationMessage }) => {
    const isOwnMessage = item.senderId === user?.uid;
    
    const getDeliveryStatusIcon = (status: MessageDeliveryStatus) => {
      switch (status) {
        case MessageDeliveryStatus.SENDING:
          return '⏳';
        case MessageDeliveryStatus.SENT:
          return '✓';
        case MessageDeliveryStatus.DELIVERED:
          return '✓✓';
        case MessageDeliveryStatus.READ:
          return '✓✓';
        case MessageDeliveryStatus.FAILED:
          return '❌';
        default:
          return '';
      }
    };

    const getDeliveryStatusColor = (status: MessageDeliveryStatus) => {
      switch (status) {
        case MessageDeliveryStatus.SENDING:
          return colors.tabIconDefault;
        case MessageDeliveryStatus.SENT:
          return colors.tabIconDefault;
        case MessageDeliveryStatus.DELIVERED:
          return colors.tabIconDefault;
        case MessageDeliveryStatus.READ:
          return isOwnMessage ? '#34C759' : colors.tint; // Green for read, blue for delivered
        case MessageDeliveryStatus.FAILED:
          return '#FF3B30';
        default:
          return colors.tabIconDefault;
      }
    };
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isOwnMessage ? colors.tint : colors.background,
            borderColor: colors.tabIconDefault
          }
        ]}>
          <ThemedText style={[
            styles.messageText,
            { color: isOwnMessage ? 'white' : colors.text }
          ]}>
            {item.content}
          </ThemedText>
          <View style={styles.messageFooter}>
            <ThemedText style={[
              styles.messageTime,
              { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.tabIconDefault }
            ]}>
              {formatMessageTime(item.createdAt)}
            </ThemedText>
            {isOwnMessage && (
              <ThemedText style={[
                styles.deliveryStatus,
                { color: getDeliveryStatusColor(item.deliveryStatus) }
              ]}>
                {getDeliveryStatusIcon(item.deliveryStatus)}
              </ThemedText>
            )}
          </View>
        </View>
      </View>
    );
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.userInfo}>
        {otherUser?.avatar ? (
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarText}>
              {otherUser?.name?.charAt(0).toUpperCase() || '?'}
            </ThemedText>
          </View>
        )}
        <View style={styles.userDetails}>
          <ThemedText style={styles.userName}>{otherUser?.name || 'Unknown User'}</ThemedText>
          <ThemedText style={styles.userStatus}>Online</ThemedText>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Loading...',
            headerBackTitle: 'Back'
          }} 
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ThemedText>Loading conversation...</ThemedText>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: conversationTitle,
          headerBackTitle: 'Back'
        }} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {renderHeader()}
          
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: colors.background, 
              borderColor: colors.tabIconDefault,
              paddingBottom: Platform.OS === 'ios' ? 16 : 16
            }
          ]}>
            <TextInput
              style={[styles.textInput, { color: colors.text, backgroundColor: colors.background }]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.tabIconDefault}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: newMessage.trim() ? colors.tint : colors.tabIconDefault,
                  opacity: newMessage.trim() ? 1 : 0.5
                }
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <ThemedText style={styles.sendButtonText}>Send</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    opacity: 0.6,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deliveryStatus: {
    fontSize: 12,
    marginLeft: 4,
  },
}); 