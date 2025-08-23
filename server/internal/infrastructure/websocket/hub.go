package websocket

import (
	"encoding/json"
	"github.com/google/uuid"
)

type Message struct {
	TopicId  uuid.UUID
	ClientId uuid.UUID
	UserId   uuid.UUID
	Data     []byte
}

type WSMessage[T any] struct {
	Type string `json:"type"`
	Data T      `json:"data"`
}

func CreateResponseMessage(message Message, data interface{}) (Message, error) {
	bytes, err := json.Marshal(data)
	if err != nil {
		return Message{}, err
	}
	return Message{
		TopicId:  message.TopicId,
		ClientId: message.ClientId,
		UserId:   message.UserId,
		Data:     bytes,
	}, nil
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	topics map[uuid.UUID]map[*Client]bool

	// OnMessageHandler is a function that is called when a message is received.
	onMessageHandlers map[string]func(message Message)

	// Outbound messages to the clients.
	broadcast chan *Message

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func NewHub() *Hub {
	messageHandlers := make(map[string]func(message Message))
	messageHandlers["default"] = func(message Message) {}

	return &Hub{
		broadcast:         make(chan *Message),
		onMessageHandlers: messageHandlers,
		register:          make(chan *Client),
		unregister:        make(chan *Client),
		topics:            make(map[uuid.UUID]map[*Client]bool),
	}
}

// For users of the api, pushes the message to the queue

func (h *Hub) Broadcast(message Message) {
	h.broadcast <- &message
}

// Register a message handler func to a message type
func (h *Hub) OnMessage(messageType string, handler func(message Message)) {
	h.onMessageHandlers[messageType] = handler
}

func (h *Hub) registerClient(client *Client) {
	if _, ok := h.topics[client.topicId]; !ok {
		h.topics[client.topicId] = make(map[*Client]bool)
	}
	h.topics[client.topicId][client] = true
}

func (h *Hub) unregisterClient(client *Client) {
	if _, ok := h.topics[client.topicId]; ok {
		if _, ok := h.topics[client.topicId][client]; ok {
			delete(h.topics[client.topicId], client)
			close(client.send)
		}

		// if there are no more clients in the topic, delete the topic
		if len(h.topics[client.topicId]) == 0 {
			delete(h.topics, client.topicId)
		}
	}
}

// internal use, actually broadcasts
func (h *Hub) broadcastMessage(message Message) {
	clients, ok := h.topics[message.TopicId]

	if !ok {
		return
	}

	for client := range clients {
		select {
		case client.send <- message.Data:
		default: // if client can't receive message, remove it
			close(client.send)
			delete(clients, client)
			client.conn.Close()
		}
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.registerClient(client)

		case client := <-h.unregister:
			h.unregisterClient(client)

		case message := <-h.broadcast:
			h.broadcastMessage(*message)
		}
	}
}
