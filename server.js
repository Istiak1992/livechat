import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    const onlineUsers = new Map();

    io.on('connection', (socket) => {
      console.log('New user connected');

      socket.on('userOnline', async ({ userId }) => {
        onlineUsers.set(userId, socket.id);

        const notifications = await prisma.notification.findMany({
          where: { user_id: userId, read: false },
        });

        notifications.forEach((notification) => {
          socket.emit('receiveNotification', notification);
        });

        // await prisma.notification.updateMany({
        //   where: { user_id: userId, read: false },
        //   data: { read: true },
        // });
      });

      socket.on('userOffline', ({ userId }) => {
        onlineUsers.delete(userId);
      });

      // Create a new channel
      socket.on('createChannel', async ({ companyId, userId }, callback) => {
        const chat = await prisma.chat.create({
          data: {
            company_id: companyId,
            user_id: userId,
          },
        });
        socket.join(chat.id);
        callback({ chatId: chat.id });
        console.log(`User joined channel: ${chat.id}`);
      });

      // Send a message
      socket.on(
        'sendMessage',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async ({ chatId, userId, recipientId, message, sender, senderType }) => {
          // check who is sending the message
          const isCompanySending = senderType?.toUpperCase() === 'COMPANY'; // TODO: remove hardcoded value
          console.log('message sending by the company', isCompanySending);
          const recipientIsOnline = onlineUsers.has(recipientId);
          console.log('is recipient is in on online', recipientIsOnline);

          const newMessage = await prisma.message.create({
            data: {
              content: message,
              chat_id: chatId,
              sender_id: sender.id,
            },
          });

          console.log("🚀 ~ newMessage:", newMessage)

          onlineUsers.forEach((value, key) => {
            console.log('online user', value, key);
          });

          if (recipientIsOnline) {
            console.log('Recipient online, sending message to:', recipientId);
            io.to(onlineUsers.get(recipientId)).emit('receiveMessage', { ...newMessage, sender });
          } else {
            try {
              console.log('Recipient offline, sending notification to:', recipientId);

              let recipient;
              if (isCompanySending) {
                console.log('Creating notification for company');
                recipient = await prisma.company.findUnique({
                  where: { id: sender?.id },
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                });
              } else {
                console.log('Creating notification for user');
                recipient = await prisma.user.findUnique({
                  where: { id: sender?.id },
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                });
              }

              console.log('Creating notification for recipient', recipient);

              const data = {
                title: recipient?.name
                  ? `${recipient?.name} sent you a message`
                  : 'You got a new message',
                link: '',
              };

              if (isCompanySending) {
                data.user_id = recipientId;
              } else {
                data.company_id = recipientId;
              }

              console.log('Creating notification for recipient', data);

              await prisma.notification.create({ data });
            } catch (error) {
              if (error.code === 'P2003') {
                console.error(
                  'Foreign key constraint failed. Invalid user_id or company_id:',
                  error
                );
              } else {
                console.error('Error creating notification:', error);
              }
            }
          }
        }
      );

      socket.on('disconnect', () => {
        console.log('user disconnected');
        onlineUsers.forEach((value, key) => {
          if (value === socket.id) {
            onlineUsers.delete(key);
          }
        });
      });
    });

    httpServer
      .once('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
      })
      .listen(port, (err) => {
        if (err) {
          console.error('Listen error:', err);
          process.exit(1);
        }
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  })
  .catch((err) => {
    console.error('App preparation error:', err);
    process.exit(1);
  });

export default app;
