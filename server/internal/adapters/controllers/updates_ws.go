package controllers

import (
	"encoding/json"
	"time"

	"github.com/beka-birhanu/edit-space/server/internal/adapters/dtos"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/websocket"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/hashicorp/golang-lru/v2/expirable"
)

type UpdatesAdapter struct {
	hub             *websocket.Hub
	userService     *services.UserService
	documentService *services.DocumentService
	usernameCache   *expirable.LRU[uuid.UUID, string]
}

func NewUpdatesAdapter(hub *websocket.Hub, userService *services.UserService,
	documentService *services.DocumentService,
) *UpdatesAdapter {
	return &UpdatesAdapter{
		hub:             hub,
		userService:     userService,
		documentService: documentService,
		usernameCache:   expirable.NewLRU[uuid.UUID, string](1000, nil, time.Minute*30),
	}
}

func (ua *UpdatesAdapter) RegisterRoutes(router *mux.Router) {
	ua.hub.OnMessage(string(dtos.MessageTypeCursor), ua.handleCursorUpdate)
	ua.hub.OnMessage(string(dtos.MessageTypeTitleChange), ua.handleTitleUpdate)
}

func (ua *UpdatesAdapter) handleCursorUpdate(message websocket.Message) {
	var wsMessage websocket.WSMessage[dtos.CursorUpdateReq]
	err := json.Unmarshal(message.Data, &wsMessage)
	if err != nil {
		return
	}

	cursorUpdate := dtos.CursorUpdate{
		Start:    wsMessage.Data.Start,
		Length:   wsMessage.Data.Length,
		Username: ua.getUsername(message.UserId),
		ClientId: message.ClientId,
		Color:    wsMessage.Data.Color,
	}

	response, err := websocket.CreateResponseMessage(
		message,
		websocket.WSMessage[dtos.CursorUpdate]{
			Type: string(dtos.MessageTypeCursor),
			Data: cursorUpdate,
		},
	)
	if err != nil {
		return
	}
	ua.hub.Broadcast(response)
}

func (ua *UpdatesAdapter) handleTitleUpdate(message websocket.Message) {
	var wsMessage websocket.WSMessage[dtos.TitleUpdate]
	err := json.Unmarshal(message.Data, &wsMessage)
	if err != nil {
		return
	}

	err = ua.documentService.ChangeTitle(message.TopicId, wsMessage.Data.Title)
	if err != nil {
		return
	}

	ua.hub.Broadcast(message)
}

func (ua *UpdatesAdapter) getUsername(userId uuid.UUID) string {
	if userId == uuid.Nil {
		return "anonymous"
	}

	username, ok := ua.usernameCache.Get(userId)
	if ok {
		return username
	}
	username, err := ua.userService.GetUserName(userId)
	if err != nil {
		return "anonymous"
	}

	ua.usernameCache.Add(userId, username)
	return username
}
