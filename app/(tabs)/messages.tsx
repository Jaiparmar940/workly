import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FirebaseService } from '@/services/firebaseService';
import { Conversation, Message, User } from '@/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ConversationPreview {
  id: string; // Conversation ID
  jobId?: string;
  jobTitle?: string;
  otherUser: User;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: number;
}

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Handle new message creation from profile
  useEffect(() => {
    if (params.newMessage === 'true' && params.recipientId && user) {
      handleNewMessage();
    }
  }, [params, user]);

  // Refresh conversations when screen comes into focus (e.g., returning from conversation)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadConversations();
      }
    }, [user])
  );

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Try to load conversations using new structure first
      let userConversations: Conversation[] = [];
      try {
        userConversations = await FirebaseService.getConversationsForUser(user.uid);
        console.log('Debug - Found conversations in new structure:', userConversations.length);
      } catch (error) {
        console.log('Debug - No conversations in new structure, using old structure');
      }

      // If no conversations in new structure, fall back to old structure
      if (userConversations.length === 0) {
        await loadOldStructureConversations();
        return;
      }

      // Process new structure conversations
      const conversationPreviews: ConversationPreview[] = [];
      
      for (const conversation of userConversations) {
        // Get the other user from participants
        const otherUserId = conversation.participants.find(pid => pid !== user.uid);
        if (!otherUserId) continue;

        // Get other user's profile
        const otherUser = await FirebaseService.getUserById(otherUserId);
        if (!otherUser) continue;

        // Get job title if it's a job-related conversation
        let jobTitle: string | undefined;
        if (conversation.jobId) {
          try {
            const job = await FirebaseService.getJobById(conversation.jobId);
            jobTitle = job?.title;
          } catch (error) {
            console.error('Error loading job title:', error);
          }
        }

        // Get unread count for current user
        const unreadCount = conversation.unreadCount[user.uid] || 0;

        if (conversation.lastMessage) {
          conversationPreviews.push({
            id: conversation.id,
            jobId: conversation.jobId,
            jobTitle,
            otherUser,
            lastMessage: conversation.lastMessage,
            unreadCount
          });
        }
      }

      // Sort conversations by latest message
      const sortedConversations = conversationPreviews.sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      );

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOldStructureConversations = async () => {
    if (!user) return;

    const userMessages = await FirebaseService.getAllMessagesForUser(user.uid);
    
    // Group messages by conversation (jobId + other user)
    const conversationGroups = new Map<string, Message[]>();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === user.uid ? message.receiverId : message.senderId;
      const conversationKey = message.jobId ? `${message.jobId}_${otherUserId}` : `direct_${otherUserId}`;
      
      if (!conversationGroups.has(conversationKey)) {
        conversationGroups.set(conversationKey, []);
      }
      conversationGroups.get(conversationKey)!.push(message);
    }

    // Create conversation previews
    const conversationPreviews: ConversationPreview[] = [];
    
    for (const [conversationKey, messages] of conversationGroups) {
      // Sort messages by date to get the latest (both sent and received)
      const sortedMessages = messages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const lastMessage = sortedMessages[0];
      const otherUserId = lastMessage.senderId === user.uid ? lastMessage.receiverId : lastMessage.senderId;
      
      // Get other user's profile
      const otherUser = await FirebaseService.getUserById(otherUserId);
      if (!otherUser) continue;

      // Get job title if it's a job-related conversation
      let jobTitle: string | undefined;
      if (lastMessage.jobId) {
        try {
          const job = await FirebaseService.getJobById(lastMessage.jobId);
          jobTitle = job?.title;
        } catch (error) {
          console.error('Error loading job title:', error);
        }
      }

      // Count unread messages (only messages received by current user)
      const unreadCount = messages.filter(msg => 
        msg.receiverId === user.uid && !msg.isRead
      ).length;

      conversationPreviews.push({
        id: lastMessage.id, // Use the latest message ID as conversation ID for old structure
        jobId: lastMessage.jobId,
        jobTitle,
        otherUser,
        lastMessage: {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        },
        unreadCount
      });
    }

    // Sort conversations by latest message
    const sortedConversations = conversationPreviews.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    setConversations(sortedConversations);
  };

  const handleConversationPress = (conversation: ConversationPreview) => {
    // Navigate to conversation screen using the conversation ID
    router.push(`/conversation/${conversation.id}` as any);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversationItem = ({ item }: { item: ConversationPreview }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        { 
          backgroundColor: colors.background,
          borderColor: colors.tabIconDefault,
          opacity: item.unreadCount > 0 ? 1 : 0.7
        }
      ]}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.conversationHeader}>
        <View style={styles.userInfo}>
          {item.otherUser.avatar ? (
            <Image source={{ uri: item.otherUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.avatarText}>
                {item.otherUser.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View style={styles.userDetails}>
            <ThemedText style={styles.userName}>{item.otherUser.name}</ThemedText>
            <ThemedText style={styles.jobTitle}>
              {item.jobTitle || 'Direct Message'}
            </ThemedText>
          </View>
        </View>
        <View style={styles.messageInfo}>
          <ThemedText style={styles.messageTime}>
            {formatDate(item.lastMessage.createdAt)}
          </ThemedText>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.unreadCount}>{item.unreadCount}</ThemedText>
            </View>
          )}
        </View>
      </View>
      <ThemedText style={styles.messagePreview} numberOfLines={2}>
        {item.lastMessage.content}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText type="subtitle">No conversations yet</ThemedText>
      <ThemedText style={styles.emptyStateText}>
        When someone expresses interest in your jobs or sends you a message, it will appear here.
      </ThemedText>
    </View>
  );

  const handleNewMessage = async () => {
    if (!user) return;
    
    try {
      const recipientId = params.recipientId as string;
      const recipientName = params.recipientName as string;
      const subject = params.subject as string;

      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.otherUser.id === recipientId
      );

      if (existingConversation) {
        // Navigate to existing conversation
        router.push(`/conversation/${existingConversation.id}` as any);
      } else {
        // Create new conversation
        const participants = [user.uid, recipientId];
        const newConversation = await FirebaseService.createConversation(
          participants,
          undefined // No job ID for profile-initiated messages
        );

        if (newConversation) {
          // Navigate to the new conversation
          router.push(`/conversation/${newConversation.id}` as any);
        } else {
          Alert.alert('Error', 'Failed to create conversation');
        }
      }
    } catch (error) {
      console.error('Error creating new message:', error);
      Alert.alert('Error', 'Failed to create message');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <ThemedText>Please log in to view messages</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">Messages</ThemedText>
        <ThemedText style={styles.subtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>
      
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={loadConversations}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  conversationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  messagePreview: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginLeft: 52, // Align with sender name (avatar width + margin)
  },
  unreadBadge: {
    backgroundColor: 'red',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
}); 