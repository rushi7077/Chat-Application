package com.substring.chat.entities;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.substring.chat.entities.Room;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;
    private String content;
    private LocalDateTime timeStamp;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @PrePersist
    protected void onCreate() {
        this.timeStamp = LocalDateTime.now();
    }
}
