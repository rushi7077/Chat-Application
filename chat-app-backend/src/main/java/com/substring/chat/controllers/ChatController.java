package com.substring.chat.controllers;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.repositories.MessageRepository;
import com.substring.chat.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    private final RoomRepository roomRepository;
    private final MessageRepository messageRepository;

    public ChatController(RoomRepository roomRepository,
                          MessageRepository messageRepository) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
    }

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            MessageRequest request
    ) {

        // 1️⃣ Find room
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Room Not Found"));

        // 2️⃣ Create message
        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());

        // 3️⃣ Set relation
        message.setRoom(room);

        // 4️⃣ Save to DB
        Message savedMessage = messageRepository.save(message);

        // 5️⃣ Return → broadcast to subscribers
        return savedMessage;
    }
}
