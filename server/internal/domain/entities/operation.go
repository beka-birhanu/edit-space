package entities

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/types"

	"github.com/google/uuid"
)

type OperationType string

const (
	OperationTypeInsert OperationType = "INSERT"
	OperationTypeDelete OperationType = "DELETE"
)

type Operation struct {
	Type       OperationType  `json:"type"`
	DocumentId uuid.UUID      `json:"documentId"`
	ChrId      uuid.UUID      `json:"chrId"`
	Value      string         `json:"value"`
	ClientId   uuid.UUID      `json:"clientId"`
	Position   types.Position `json:"position" bun:",array"`
	Counter    int            `json:"counter"`
}

func NewOperation(
	chrId, clientId, documentId uuid.UUID,
	value string, position types.Position,
	operationType OperationType, counter int,
) Operation {
	return Operation{
		Type:     operationType,
		ChrId:    chrId,
		Value:    value,
		ClientId: clientId,
		Position: position,
		Counter:  counter,
	}
}
