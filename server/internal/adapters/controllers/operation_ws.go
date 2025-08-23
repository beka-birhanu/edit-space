package controllers

import (
	"encoding/json"

	"github.com/beka-birhanu/edit-space/server/internal/adapters/dtos"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/websocket"

	"github.com/gorilla/mux"
)

type OperationAdapter struct {
	hub              *websocket.Hub
	operationService *services.OperationService
}

func NewOperationAdapter(hub *websocket.Hub, operationService *services.OperationService) *OperationAdapter {
	return &OperationAdapter{hub: hub, operationService: operationService}
}

func (oa *OperationAdapter) RegisterRoutes(router *mux.Router) {
	oa.hub.OnMessage(string(dtos.MessageTypeOperation), oa.handleOperation)
}

func (oa *OperationAdapter) handleOperation(message websocket.Message) {
	var wsMessage websocket.WSMessage[entities.Operation]
	error := json.Unmarshal(message.Data, &wsMessage)

	if error != nil {
		return
	}

	err := oa.operationService.ApplyAndSave(wsMessage.Data)
	if err != nil {
		return
	}

	oa.hub.Broadcast(message)
}
