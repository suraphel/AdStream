import type { Express } from "express";
import { eq, and, or, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { 
  conversations, 
  conversationParticipants, 
  messages,
  insertConversationSchema,
  insertConversationParticipantSchema,
  insertMessageSchema
} from "@shared/schema";
import { isAuthenticated } from "./replitAuth";

export function registerMessagingRoutes(app: Express) {
  // Get all conversations for the current user
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const userConversations = await db
        .select({
          id: conversations.id,
          listingId: conversations.listingId,
          createdAt: conversations.createdAt,
          updatedAt: conversations.updatedAt,
          lastMessage: {
            id: messages.id,
            content: messages.content,
            senderId: messages.senderId,
            createdAt: messages.createdAt,
          }
        })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
        .leftJoin(messages, eq(conversations.id, messages.conversationId))
        .where(eq(conversationParticipants.userId, userId))
        .orderBy(desc(conversations.updatedAt));

      res.json(userConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  });

  // Get messages for a specific conversation
  app.get('/api/conversations/:conversationId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = parseInt(req.params.conversationId);

      // Verify user is participant in this conversation
      const participation = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      if (participation.length === 0) {
        return res.status(403).json({ message: 'Access denied to this conversation' });
      }

      const conversationMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          messageType: messages.messageType,
          attachmentUrl: messages.attachmentUrl,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

      // Mark messages as read
      await db
        .update(conversationParticipants)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        );

      res.json(conversationMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  // Send a new message
  app.post('/api/conversations/:conversationId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = parseInt(req.params.conversationId);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
        senderId: userId,
      });

      // Verify user is participant in this conversation
      const participation = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      if (participation.length === 0) {
        return res.status(403).json({ message: 'Access denied to this conversation' });
      }

      const [newMessage] = await db
        .insert(messages)
        .values(messageData)
        .returning();

      // Update conversation timestamp
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Start a new conversation (usually from a listing)
  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId, listingId, initialMessage } = req.body;

      if (!otherUserId || !initialMessage) {
        return res.status(400).json({ message: 'Other user ID and initial message are required' });
      }

      // Check if conversation already exists between these users for this listing
      let existingConversation;
      if (listingId) {
        const existingConversations = await db
          .select({ id: conversations.id })
          .from(conversations)
          .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
          .where(
            and(
              eq(conversations.listingId, listingId),
              or(
                and(
                  eq(conversationParticipants.userId, userId),
                ),
                and(
                  eq(conversationParticipants.userId, otherUserId),
                )
              )
            )
          );

        if (existingConversations.length >= 2) {
          existingConversation = existingConversations[0];
        }
      }

      let conversationId;

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const [newConversation] = await db
          .insert(conversations)
          .values({ listingId })
          .returning();

        conversationId = newConversation.id;

        // Add both users as participants
        await db.insert(conversationParticipants).values([
          { conversationId, userId },
          { conversationId, userId: otherUserId }
        ]);
      }

      // Send initial message
      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId,
          senderId: userId,
          content: initialMessage,
        })
        .returning();

      res.status(201).json({ conversationId, message: newMessage });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ message: 'Failed to create conversation' });
    }
  });

  // Get conversation participants
  app.get('/api/conversations/:conversationId/participants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = parseInt(req.params.conversationId);

      // Verify user is participant in this conversation
      const participation = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      if (participation.length === 0) {
        return res.status(403).json({ message: 'Access denied to this conversation' });
      }

      const participants = await db
        .select({
          userId: conversationParticipants.userId,
          joinedAt: conversationParticipants.joinedAt,
          lastReadAt: conversationParticipants.lastReadAt,
        })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, conversationId));

      res.json(participants);
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({ message: 'Failed to fetch participants' });
    }
  });
}