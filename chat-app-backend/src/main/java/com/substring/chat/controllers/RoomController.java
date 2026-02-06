package com.substring.chat.controllers;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.repositories.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // CREATE ROOM
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room) {

        if (roomRepository.findByRoomId(room.getRoomId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Room Already Exists");
        }

        Room savedRoom = roomRepository.save(room);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }

    // GET ROOM
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {

        return roomRepository.findByRoomId(roomId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Room Not Found"));
    }

    // GET ROOM MESSAGES
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return roomRepository.findByRoomId(roomId)
                .map(room -> {

                    List<Message> messages = room.getMessages();

                    int start = Math.max(0, messages.size() - (page + 1) * size);
                    int end = Math.min(messages.size(), start + size);

                    return ResponseEntity.ok(messages.subList(start, end));
                })
                .orElseThrow(() -> new RuntimeException("Room Not Found"));
    }
}
